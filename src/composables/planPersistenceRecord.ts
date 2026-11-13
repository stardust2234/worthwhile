import {
  normalizePurchaseTerm,
  sanitizeNumber,
  sanitizeRate,
} from "../calculations";
import { PLAN_SCHEMA_VERSION } from "../types/plan";
import type {
  AppView,
  CalculatorMode,
  ExtraCost,
  FinancialPlanState,
  PartialPlanStorageRecord,
  PlanStorageRecord,
  PurchaseType,
} from "../types/plan";

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

export const deserializePlanRecord = (
  value: unknown,
): PartialPlanStorageRecord | null => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const record = value as PartialPlanStorageRecord;
  if (
    (record.mode !== undefined && !isCalculatorMode(record.mode)) ||
    (record.purchaseType !== undefined &&
      !isPurchaseType(record.purchaseType)) ||
    (record.view !== undefined && !isAppView(record.view)) ||
    (record.extraCosts !== undefined && !Array.isArray(record.extraCosts)) ||
    (record.schemaVersion !== undefined &&
      (!Number.isInteger(record.schemaVersion) ||
        record.schemaVersion < 0 ||
        record.schemaVersion > PLAN_SCHEMA_VERSION))
  ) {
    return null;
  }
  return {
    ...record,
    ...(record.extraCosts === undefined
      ? {}
      : { extraCosts: record.extraCosts.filter(isExtraCost) }),
  } as PartialPlanStorageRecord;
};

const migrateLegacyPlanRecord = (
  record: PartialPlanStorageRecord,
): PartialPlanStorageRecord => ({
  ...record,
  schemaVersion: PLAN_SCHEMA_VERSION,
});

export const migratePlanRecord = (
  record: PartialPlanStorageRecord,
): PartialPlanStorageRecord | null => {
  switch (record.schemaVersion ?? 0) {
    case 0:
      return migrateLegacyPlanRecord(record);
    case PLAN_SCHEMA_VERSION:
      return record;
    default:
      return null;
  }
};

export const toPlanStorageRecord = (
  state: FinancialPlanState,
  view: AppView,
): PlanStorageRecord => ({
  ...state,
  view,
  schemaVersion: PLAN_SCHEMA_VERSION,
});

export const normalizePlanRecord = (
  record: PartialPlanStorageRecord,
  defaults: PlanStorageRecord,
): PlanStorageRecord => ({
  schemaVersion: PLAN_SCHEMA_VERSION,
  mode: record.mode ?? defaults.mode,
  view: record.view ?? defaults.view,
  purchaseType: record.purchaseType ?? defaults.purchaseType,
  income: sanitizeNumber(record.income ?? defaults.income),
  price: sanitizeNumber(record.price ?? defaults.price),
  deposit: sanitizeNumber(record.deposit ?? defaults.deposit),
  term: normalizePurchaseTerm(record.term ?? defaults.term),
  rate: sanitizeRate(record.rate ?? defaults.rate),
  rent: sanitizeNumber(record.rent ?? defaults.rent),
  moving: sanitizeNumber(record.moving ?? defaults.moving),
  furnishings: sanitizeNumber(record.furnishings ?? defaults.furnishings),
  utilities: sanitizeNumber(record.utilities ?? defaults.utilities),
  transport: sanitizeNumber(record.transport ?? defaults.transport),
  food: sanitizeNumber(record.food ?? defaults.food),
  monthlyCommitments: sanitizeNumber(
    record.monthlyCommitments ?? defaults.monthlyCommitments,
  ),
  debtPayments: sanitizeNumber(record.debtPayments ?? defaults.debtPayments),
  saved: sanitizeNumber(record.saved ?? defaults.saved),
  monthlySaving: sanitizeNumber(record.monthlySaving ?? defaults.monthlySaving),
  extraCosts: (record.extraCosts ?? defaults.extraCosts).map((cost) => ({
    ...cost,
    amount: sanitizeNumber(cost.amount),
  })),
});
