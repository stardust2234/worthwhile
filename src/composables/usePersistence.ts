import { onMounted, ref, watch, type Ref } from "vue";
import {
  normalizePurchaseTerm,
  sanitizeNumber,
  sanitizeRate,
} from "../calculations";
import type {
  AppView,
  CalculatorMode,
  ExtraCost,
  FinancialPlanState,
  PlanPersistencePort,
  PartialPlanStorageRecord,
  PlanStorageRecord,
  PurchaseType,
} from "../types/plan";

type PlanStateRefs = {
  [Key in keyof FinancialPlanState]: Ref<FinancialPlanState[Key]>;
};

const isCalculatorMode = (value: unknown): value is CalculatorMode =>
  value === "purchase" || value === "move" || value === "safety";

const isPurchaseType = (value: unknown): value is PurchaseType =>
  value === "finance" || value === "cash";

const isAppView = (value: unknown): value is AppView =>
  value === "calculators" || value === "results";

const isExtraCost = (value: unknown): value is ExtraCost =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  typeof (value as ExtraCost).id === "number" &&
  typeof (value as ExtraCost).name === "string" &&
  typeof (value as ExtraCost).amount === "number";

const deserializeRecord = (value: unknown): PartialPlanStorageRecord | null => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const record = value as PartialPlanStorageRecord;
  if (
    (record.mode !== undefined && !isCalculatorMode(record.mode)) ||
    (record.purchaseType !== undefined &&
      !isPurchaseType(record.purchaseType)) ||
    (record.view !== undefined && !isAppView(record.view)) ||
    (record.extraCosts !== undefined && !Array.isArray(record.extraCosts))
  ) {
    return null;
  }
  return {
    ...record,
    ...(record.mode === undefined ? {} : { mode: record.mode }),
    ...(record.purchaseType === undefined
      ? {}
      : { purchaseType: record.purchaseType }),
    ...(record.view === undefined ? {} : { view: record.view }),
    ...(record.extraCosts === undefined
      ? {}
      : { extraCosts: record.extraCosts.filter(isExtraCost) }),
  } as PartialPlanStorageRecord;
};

export const createLocalStoragePersistence = (
  storageKey: string,
  storage: Storage = localStorage,
): PlanPersistencePort => ({
  load: () => {
    const stored = storage.getItem(storageKey);
    return stored ? deserializeRecord(JSON.parse(stored)) : null;
  },
  save: (record) => storage.setItem(storageKey, JSON.stringify(record)),
  clear: () => storage.removeItem(storageKey),
});

const toStorageRecord = (
  state: PlanStateRefs,
  view: Ref<AppView>,
): PlanStorageRecord => ({
  mode: state.mode.value,
  view: view.value,
  purchaseType: state.purchaseType.value,
  income: state.income.value,
  price: state.price.value,
  deposit: state.deposit.value,
  term: state.term.value,
  rate: state.rate.value,
  rent: state.rent.value,
  moving: state.moving.value,
  furnishings: state.furnishings.value,
  utilities: state.utilities.value,
  transport: state.transport.value,
  food: state.food.value,
  monthlyCommitments: state.monthlyCommitments.value,
  debtPayments: state.debtPayments.value,
  saved: state.saved.value,
  monthlySaving: state.monthlySaving.value,
  extraCosts: state.extraCosts.value,
});

const restoreFromRecord = (
  record: PartialPlanStorageRecord,
  defaults: PlanStorageRecord,
  state: PlanStateRefs,
  view: Ref<AppView>,
) => {
  state.mode.value = record.mode ?? defaults.mode!;
  view.value = record.view ?? defaults.view!;
  state.purchaseType.value = record.purchaseType ?? defaults.purchaseType!;
  state.income.value = sanitizeNumber(record.income ?? defaults.income!);
  state.price.value = sanitizeNumber(record.price ?? defaults.price!);
  state.deposit.value = sanitizeNumber(record.deposit ?? defaults.deposit!);
  state.term.value = normalizePurchaseTerm(record.term ?? defaults.term!);
  state.rate.value = sanitizeRate(record.rate ?? defaults.rate!);
  state.rent.value = sanitizeNumber(record.rent ?? defaults.rent!);
  state.moving.value = sanitizeNumber(record.moving ?? defaults.moving!);
  state.furnishings.value = sanitizeNumber(
    record.furnishings ?? defaults.furnishings!,
  );
  state.utilities.value = sanitizeNumber(
    record.utilities ?? defaults.utilities!,
  );
  state.transport.value = sanitizeNumber(
    record.transport ?? defaults.transport!,
  );
  state.food.value = sanitizeNumber(record.food ?? defaults.food!);
  state.monthlyCommitments.value = sanitizeNumber(
    record.monthlyCommitments ?? defaults.monthlyCommitments!,
  );
  state.debtPayments.value = sanitizeNumber(
    record.debtPayments ?? defaults.debtPayments!,
  );
  state.saved.value = sanitizeNumber(record.saved ?? defaults.saved!);
  state.monthlySaving.value = sanitizeNumber(
    record.monthlySaving ?? defaults.monthlySaving!,
  );
  state.extraCosts.value = (record.extraCosts ?? defaults.extraCosts!).map(
    (cost) => ({
      ...cost,
      amount: sanitizeNumber(cost.amount),
    }),
  );
};

export function usePersistence(
  port: PlanPersistencePort,
  state: PlanStateRefs,
  view: Ref<AppView>,
  notify: (message: string) => void,
) {
  const skipNextSave = ref(false);
  const defaults = toStorageRecord(state, view);
  const snapshot = () => toStorageRecord(state, view);
  const save = (message = "Plan saved on this device.") => {
    try {
      port.save(snapshot());
      notify(message);
    } catch {
      notify("Could not save on this device.");
    }
  };
  const clear = () => {
    try {
      port.clear();
      skipNextSave.value = true;
      restoreFromRecord(defaults, defaults, state, view);
      setTimeout(() => port.clear(), 0);
      notify("Saved data cleared from this device.");
    } catch {
      notify("Could not clear saved data.");
    }
  };
  onMounted(() => {
    try {
      const record = port.load();
      if (record) restoreFromRecord(record, defaults, state, view);
    } catch {
      notify("Saved data could not be loaded.");
    }
  });
  watch(
    [...Object.values(state), view],
    () => {
      if (skipNextSave.value) {
        skipNextSave.value = false;
        return;
      }
      try {
        port.save(snapshot());
      } catch {
        // Saving is retried on the next state change or explicit save.
      }
    },
    { deep: true },
  );
  return { save, clear };
}
