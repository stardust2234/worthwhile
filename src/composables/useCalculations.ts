import { computed, type Ref } from "vue";
import {
  calculateFinancialPlan,
  type FinancialCalculationResult,
} from "../domain/financialResults";
import type { FinancialPlanState } from "../types/plan";

type ReactiveFinancialPlanState = {
  [Key in keyof FinancialPlanState]: Ref<FinancialPlanState[Key]>;
};

export function useCalculations(state: ReactiveFinancialPlanState) {
  const calculation = computed<FinancialCalculationResult>(() =>
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

  const project = <Key extends keyof FinancialCalculationResult>(key: Key) =>
    computed(() => calculation.value[key]);

  return {
    calculation,
    housingRatio: project("housingRatio"),
    comfortRatio: project("comfortRatio"),
    housingCost: project("housingCost"),
    essentials: project("essentials"),
    affordabilityVerdict: project("affordabilityVerdict"),
    debtRepaymentAboveGuideline: project("debtRepaymentAboveGuideline"),
    rentAboveComfortRule: project("rentAboveComfortRule"),
    suggestedHousingMaximum: project("suggestedHousingMaximum"),
    minimumIncomeForRent: project("minimumIncomeForRent"),
    monthlyPayment: project("monthlyPayment"),
    interestCost: project("interestCost"),
    fullPurchasePrice: project("fullPurchasePrice"),
    moveTotal: project("moveTotal"),
    emergencyTarget: project("emergencyTarget"),
    cashAvailable: project("cashAvailable"),
    extraMonthlyCosts: project("extraMonthlyCosts"),
    monthlyHousing: project("monthlyHousing"),
    plannedMonthlySaving: project("plannedMonthlySaving"),
    availableMonthly: project("availableMonthly"),
    disposableMargin: project("disposableMargin"),
    disposableMarginPercentage: computed(
      () => calculation.value.disposableMarginRatio,
    ),
    essentialCostRatio: project("essentialCostRatio"),
    essentialCostPosition: project("essentialCostPosition"),
    suggestedSaving: project("suggestedSaving"),
    suggestedSavingRate: project("suggestedSavingRate"),
    effectiveMonthlySaving: project("effectiveMonthlySaving"),
    savingIsPossible: project("savingIsPossible"),
    savingIsRealistic: project("savingIsRealistic"),
    cashPurchaseMonths: project("cashPurchaseMonths"),
    cashAmountStillNeeded: project("cashAmountStillNeeded"),
    emergencyGap: project("emergencyGap"),
    emergencyMonths: project("emergencyMonths"),
    ratio: project("ratio"),
    debtRepaymentRatio: project("debtRepaymentRatio"),
    score: project("score"),
  };
}
