import { computed, reactive } from "vue";
import { useFinancialState } from "./useFinancialState";
import { useCalculations } from "./useCalculations";
import { usePersistence } from "./usePersistence";
import { usePlanCommands } from "./usePlanCommands";
import { usePlanNotifications } from "./usePlanNotifications";
import { usePreferences } from "./usePreferences";
import { buildAffordabilityDisplayState } from "../viewModels/affordabilityDisplay";
import {
  buildFinancialResults,
  formatCurrency,
} from "../viewModels/financialResults";
import type { PlanPersistencePort } from "../types/plan";
import type { AppController } from "./appControllerContract";

export function useAppController(
  persistencePort: PlanPersistencePort,
): AppController {
  const { view, ...stateRefs } = useFinancialState();
  const { metrics } = useCalculations(stateRefs);
  const notifications = usePlanNotifications();
  const persistence = usePersistence(
    persistencePort,
    stateRefs,
    view,
    notifications.showNotice,
  );
  const planCommands = usePlanCommands(stateRefs, view, persistence);
  const preferences = usePreferences(notifications.showNotice);
  const affordabilityDisplay = computed(() =>
    buildAffordabilityDisplayState({
      mode: stateRefs.mode.value,
      purchaseType: stateRefs.purchaseType.value,
      score: metrics.value.score,
      emergencyTarget: metrics.value.emergencyTarget,
      emergencyGap: metrics.value.emergencyGap,
      emergencyMonths: metrics.value.emergencyMonths,
      effectiveMonthlySaving: metrics.value.effectiveMonthlySaving,
      fullPurchasePrice: metrics.value.fullPurchasePrice,
      cashAmountStillNeeded: metrics.value.cashAmountStillNeeded,
      cashPurchaseMonths: metrics.value.cashPurchaseMonths,
      moveTotal: metrics.value.moveTotal,
      housingCost: metrics.value.housingCost,
      housingRatio: metrics.value.housingRatio,
      affordabilityVerdict: metrics.value.affordabilityVerdict,
      debtRepaymentAboveGuideline: metrics.value.debtRepaymentAboveGuideline,
      rentAboveComfortRule: metrics.value.rentAboveComfortRule,
      suggestedHousingMaximum: metrics.value.suggestedHousingMaximum,
      minimumIncomeForRent: metrics.value.minimumIncomeForRent,
      ratio: metrics.value.ratio,
      monthlyPayment: metrics.value.monthlyPayment,
      debtRepaymentRatio: metrics.value.debtRepaymentRatio,
      cashAvailable: metrics.value.cashAvailable,
      interestCost: metrics.value.interestCost,
      rent: stateRefs.rent.value,
      income: stateRefs.income.value,
      comfortRatio: metrics.value.comfortRatio,
      formatCurrency,
    }),
  );
  const calculatedResults = computed(() =>
    buildFinancialResults(metrics.value, formatCurrency),
  );
  const state = reactive({
    ...stateRefs,
    view,
    preferencesOpen: preferences.preferencesOpen,
    notice: notifications.notice,
  });

  return {
    state,
    metrics,
    affordabilityDisplay,
    calculatedResults,
    commands: {
      ...planCommands,
      ...preferences,
      ...notifications,
      formatCurrency,
    },
  };
}
