import { computed, ref, type Ref } from "vue";
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
): WorkspaceController & {
  preferencesOpen: Ref<boolean>;
  notice: Ref<string>;
  showNotice(message: string): void;
  clearSavedData(): void;
  closePreferences(): void;
  savePreferences(): void;
  transport: Ref<number>;
  food: Ref<number>;
  debtPayments: Ref<number>;
  monthlyCommitments: Ref<number>;
} {
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
  const {
    housingRatio,
    comfortRatio,
    affordabilityVerdict,
    debtRepaymentAboveGuideline,
    rentAboveComfortRule,
    suggestedHousingMaximum,
    minimumIncomeForRent,
    housingCost,
    monthlyPayment,
    interestCost,
    fullPurchasePrice,
    moveTotal,
    emergencyTarget,
    cashAvailable,
    availableMonthly,
    suggestedSaving,
    suggestedSavingRate,
    savingIsPossible,
    savingIsRealistic,
    cashPurchaseMonths,
    cashAmountStillNeeded,
    emergencyGap,
    emergencyMonths,
    effectiveMonthlySaving,
    ratio,
    debtRepaymentRatio,
    score,
    calculation,
  } = calculations;
  const fmt = formatCurrency;
  const affordabilityDisplay = computed(() =>
    buildAffordabilityDisplayState({
      mode: mode.value,
      purchaseType: purchaseType.value,
      score: score.value,
      emergencyTarget: emergencyTarget.value,
      emergencyGap: emergencyGap.value,
      emergencyMonths: emergencyMonths.value,
      effectiveMonthlySaving: effectiveMonthlySaving.value,
      fullPurchasePrice: fullPurchasePrice.value,
      cashAmountStillNeeded: cashAmountStillNeeded.value,
      cashPurchaseMonths: cashPurchaseMonths.value,
      moveTotal: moveTotal.value,
      housingCost: housingCost.value,
      housingRatio: housingRatio.value,
      affordabilityVerdict: affordabilityVerdict.value,
      debtRepaymentAboveGuideline: debtRepaymentAboveGuideline.value,
      rentAboveComfortRule: rentAboveComfortRule.value,
      suggestedHousingMaximum: suggestedHousingMaximum.value,
      minimumIncomeForRent: minimumIncomeForRent.value,
      ratio: ratio.value,
      monthlyPayment: monthlyPayment.value,
      debtRepaymentRatio: debtRepaymentRatio.value,
      cashAvailable: cashAvailable.value,
      interestCost: interestCost.value,
      rent: rent.value,
      income: income.value,
      comfortRatio: comfortRatio.value,
      formatCurrency: fmt,
    }),
  );
  const calculatedResults = computed(() =>
    buildFinancialResults(calculation.value, fmt),
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
  const selectCalculator = (next: CalculatorMode | "results") => {
    if (next === "results") {
      view.value = "results";
      return;
    }
    mode.value = next;
    view.value = "calculators";
  };

  return {
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
    essentials: calculations.essentials,
    saved,
    monthlySaving,
    extraCosts,
    preferencesOpen,
    notice,
    affordabilityDisplay,
    calculatedResults,
    availableMonthly,
    suggestedSaving,
    suggestedSavingRate,
    savingIsPossible,
    savingIsRealistic,
    fmt,
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
    clearSavedData,
    showNotice,
    closePreferences,
    savePreferences,
    selectCalculator,
  };
}
