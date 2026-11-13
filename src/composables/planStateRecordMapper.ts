import type { Ref } from "vue";
import type {
  AppView,
  FinancialPlanState,
  PlanStorageRecord,
} from "../types/plan";
import type { FinancialStateRefs } from "./useFinancialState";

export const readPlanState = (
  state: FinancialStateRefs,
): FinancialPlanState => ({
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

export const restorePlanState = (
  record: PlanStorageRecord,
  state: FinancialStateRefs,
  view: Ref<AppView>,
): void => {
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
