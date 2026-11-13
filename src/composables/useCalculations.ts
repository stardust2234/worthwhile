import { computed, type Ref } from "vue";
import {
  calculateFinancialPlan,
  type PlanMetrics,
} from "../domain/financialResults";
import type { FinancialPlanState } from "../types/plan";

type ReactiveFinancialPlanState = {
  [Key in keyof FinancialPlanState]: Ref<FinancialPlanState[Key]>;
};

export function useCalculations(state: ReactiveFinancialPlanState) {
  const metrics = computed<PlanMetrics>(() =>
    calculateFinancialPlan({
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
    }),
  );

  return { metrics };
}
