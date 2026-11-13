import { onMounted, ref, watch, type Ref } from "vue";
import {
  toPlanStorageRecord,
  normalizePlanRecord,
} from "./planPersistenceRecord";
import type {
  AppView,
  FinancialPlanState,
  PlanPersistencePort,
  PlanStorageRecord,
} from "../types/plan";

type PlanStateRefs = {
  [Key in keyof FinancialPlanState]: Ref<FinancialPlanState[Key]>;
};

const readState = (state: PlanStateRefs): FinancialPlanState => ({
  mode: state.mode.value,
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

const restoreState = (
  record: PlanStorageRecord,
  state: PlanStateRefs,
  view: Ref<AppView>,
) => {
  state.mode.value = record.mode;
  view.value = record.view;
  state.purchaseType.value = record.purchaseType;
  state.income.value = record.income;
  state.price.value = record.price;
  state.deposit.value = record.deposit;
  state.term.value = record.term;
  state.rate.value = record.rate;
  state.rent.value = record.rent;
  state.moving.value = record.moving;
  state.furnishings.value = record.furnishings;
  state.utilities.value = record.utilities;
  state.transport.value = record.transport;
  state.food.value = record.food;
  state.monthlyCommitments.value = record.monthlyCommitments;
  state.debtPayments.value = record.debtPayments;
  state.saved.value = record.saved;
  state.monthlySaving.value = record.monthlySaving;
  state.extraCosts.value = record.extraCosts;
};

export function usePersistence(
  port: PlanPersistencePort,
  state: PlanStateRefs,
  view: Ref<AppView>,
  notify: (message: string) => void,
) {
  const skipNextSave = ref(false);
  const defaults = toPlanStorageRecord(readState(state), view.value);
  const snapshot = () => toPlanStorageRecord(readState(state), view.value);
  const restore = (record: Parameters<typeof normalizePlanRecord>[0]) => {
    restoreState(normalizePlanRecord(record, defaults), state, view);
  };
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
      restore(defaults);
      setTimeout(() => port.clear(), 0);
      notify("Saved data cleared from this device.");
    } catch {
      notify("Could not clear saved data.");
    }
  };
  onMounted(() => {
    try {
      const record = port.load();
      if (record) restore(record);
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
