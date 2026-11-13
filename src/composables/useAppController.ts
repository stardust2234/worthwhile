import { computed, reactive, ref, type Ref } from "vue";
import { useFinancialState } from "./useFinancialState";
import { useCalculations } from "./useCalculations";
import { usePersistence } from "./usePersistence";
import {
  sanitizeNumber,
  sanitizeRate,
  sanitizeTermMonths,
} from "../calculations";
import { buildAffordabilityDisplayState } from "../viewModels/affordabilityDisplay";
import { buildFinancialResults } from "../viewModels/financialResults";
import { formatCurrency } from "../viewModels/financialResults";
import type {
  CalculatorMode,
  PlanPersistencePort,
  PurchaseType,
} from "../types/plan";
import type { WorkspaceController } from "./workspaceContract";

export function useAppController(
  persistencePort: PlanPersistencePort,
): WorkspaceController {
  const {
    mode,
    view,
    purchaseType,
    income,
    price,
    deposit,
    term,
    rate,
    rent,
    moving,
    furnishings,
    utilities,
    transport,
    food,
    monthlyCommitments,
    debtPayments,
    saved,
    monthlySaving,
    extraCosts,
  } = useFinancialState();
  const preferencesOpen = ref(false);
  const notice = ref("");

  const calculations = useCalculations({
    mode,
    purchaseType,
    income,
    price,
    deposit,
    term,
    rate,
    rent,
    moving,
    furnishings,
    utilities,
    transport,
    food,
    monthlyCommitments,
    debtPayments,
    saved,
    monthlySaving,
    extraCosts,
  });
  const { metrics } = calculations;
  const fmt = formatCurrency;
  const affordabilityDisplay = computed(() =>
    buildAffordabilityDisplayState({
      mode: mode.value,
      purchaseType: purchaseType.value,
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
      rent: rent.value,
      income: income.value,
      comfortRatio: metrics.value.comfortRatio,
      formatCurrency: fmt,
    }),
  );
  const calculatedResults = computed(() =>
    buildFinancialResults(metrics.value, fmt),
  );

  const showNotice = (message: string) => {
    notice.value = message;
    setTimeout(() => (notice.value = ""), 4000);
  };
  const numericSetter = (target: Ref<number>) => (value: number) => {
    target.value = sanitizeNumber(value);
  };
  const setIncome = numericSetter(income);
  const setPrice = numericSetter(price);
  const setDeposit = numericSetter(deposit);
  const setRate = (value: number) => {
    rate.value = sanitizeRate(value);
  };
  const setPurchaseType = (value: PurchaseType) => {
    purchaseType.value = value;
  };
  const setRent = numericSetter(rent);
  const setMoving = numericSetter(moving);
  const setFurnishings = numericSetter(furnishings);
  const setUtilities = numericSetter(utilities);
  const setTransport = numericSetter(transport);
  const setFood = numericSetter(food);
  const setDebtPayments = numericSetter(debtPayments);
  const setMonthlySaving = numericSetter(monthlySaving);
  const setMonthlyCommitments = numericSetter(monthlyCommitments);
  const setSaved = numericSetter(saved);
  const setTerm = (value: number) => {
    term.value = sanitizeTermMonths(value);
  };
  const persistence = usePersistence(
    persistencePort,
    {
      mode,
      purchaseType,
      price,
      deposit,
      term,
      rate,
      income,
      rent,
      utilities,
      transport,
      food,
      monthlyCommitments,
      debtPayments,
      saved,
      monthlySaving,
      moving,
      furnishings,
      extraCosts,
    },
    view,
    showNotice,
  );
  const addCost = () =>
    extraCosts.value.push({
      id: Date.now(),
      name: "New monthly cost",
      amount: 0,
    });
  const removeCost = (id: number) =>
    (extraCosts.value = extraCosts.value.filter((cost) => cost.id !== id));
  const setExtraCostAmount = (id: number, value: number) => {
    const cost = extraCosts.value.find((item) => item.id === id);
    if (cost) cost.amount = sanitizeNumber(value);
  };
  const setExtraCostName = (id: number, value: string) => {
    const cost = extraCosts.value.find((item) => item.id === id);
    if (cost) cost.name = value;
  };
  const savePlan = () => persistence.save();
  const clearSavedData = () => persistence.clear();
  const closePreferences = () => {
    preferencesOpen.value = false;
  };
  const savePreferences = () => {
    closePreferences();
    showNotice("Preferences saved on this device.");
  };
  const openPreferences = () => {
    preferencesOpen.value = true;
  };
  const selectCalculator = (next: CalculatorMode | "results") => {
    if (next === "results") {
      view.value = "results";
      return;
    }
    mode.value = next;
    view.value = "calculators";
  };
  const state = reactive({
    mode,
    view,
    purchaseType,
    income,
    price,
    deposit,
    term,
    rate,
    rent,
    moving,
    furnishings,
    utilities,
    transport,
    food,
    monthlyCommitments,
    debtPayments,
    saved,
    monthlySaving,
    extraCosts,
    preferencesOpen,
    notice,
  });

  return {
    state,
    metrics,
    affordabilityDisplay,
    calculatedResults,
    commands: {
      setIncome,
      setPrice,
      setDeposit,
      setRate,
      setTerm,
      setPurchaseType,
      setRent,
      setMoving,
      setFurnishings,
      setUtilities,
      setTransport,
      setFood,
      setDebtPayments,
      setMonthlySaving,
      setMonthlyCommitments,
      setSaved,
      addCost,
      removeCost,
      setExtraCostName,
      setExtraCostAmount,
      savePlan,
      selectCalculator,
      openPreferences,
      closePreferences,
      savePreferences,
      clearSavedData,
      showNotice,
      formatCurrency: fmt,
    },
  };
}
