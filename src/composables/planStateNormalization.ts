import {
  normalizePurchaseTerm,
  sanitizeNumber,
  sanitizeRate,
} from "../calculations";
import type {
  PartialPlanStorageRecord,
  PlanStorageRecord,
} from "../types/plan";

export const normalizePlanRecord = (
  record: PartialPlanStorageRecord,
  defaults: PlanStorageRecord,
): PlanStorageRecord => ({
  ...defaults,
  schemaVersion: defaults.schemaVersion,
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
