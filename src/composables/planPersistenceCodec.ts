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

export const serializePlanRecord = (
  state: FinancialPlanState,
  view: AppView,
): PlanStorageRecord => ({
  ...state,
  view,
  schemaVersion: PLAN_SCHEMA_VERSION,
});
