import { computed, type Ref } from "vue";
import {
  calculateCashPurchase,
  calculateEmergencyMonths,
  calculateEmergencyTarget,
  calculateHousingRatio,
  calculateInterestCost,
  calculateMonthlyPayment,
  calculateMoveInTotal,
  calculateSuggestedSaving,
  evaluateGuideline,
  getEssentialCostPosition,
  isWithinComfortRule,
  sanitizeNumber,
  sanitizeAggregate,
  sanitizeTermMonths,
} from "../calculations";
import type { FinancialResults } from "../types/financial";

export function useCalculations(state: {
  mode: Ref<"purchase" | "move" | "safety">;
  purchaseType: Ref<"finance" | "cash">;
  income: Ref<number>;
  price: Ref<number>;
  deposit: Ref<number>;
  term: Ref<number>;
  rate: Ref<number>;
  rent: Ref<number>;
  moving: Ref<number>;
  furnishings: Ref<number>;
  utilities: Ref<number>;
  transport: Ref<number>;
  food: Ref<number>;
  monthlyCommitments: Ref<number>;
  debtPayments: Ref<number>;
  essentials: Ref<number>;
  saved: Ref<number>;
  monthlySaving: Ref<number>;
  extraCosts: Ref<{ id: number; name: string; amount: number }[]>;
}) {
  const extraMonthlyCosts = computed(() =>
    state.extraCosts.value.reduce(
      (sum, cost) => sum + sanitizeNumber(cost.amount),
      0,
    ),
  );
  const monthlyHousing = computed(
    () =>
      sanitizeNumber(state.rent.value) + sanitizeNumber(state.utilities.value),
  );
  const monthlyPayment = computed(() =>
    calculateMonthlyPayment(
      state.price.value,
      state.deposit.value,
      state.term.value,
      state.rate.value,
    ),
  );
  const planMonthlyPayment = computed(() =>
    state.mode.value === "purchase" && state.purchaseType.value === "finance"
      ? monthlyPayment.value
      : 0,
  );
  const interestCost = computed(() =>
    calculateInterestCost(
      state.price.value,
      state.deposit.value,
      state.term.value,
      state.rate.value,
    ),
  );
  const housingCost = computed(() =>
    state.mode.value === "purchase"
      ? state.purchaseType.value === "cash"
        ? 0
        : monthlyPayment.value
      : monthlyHousing.value,
  );
  const housingRatio = computed(() =>
    sanitizeNumber(state.income.value) === 0
      ? 1
      : housingCost.value / sanitizeNumber(state.income.value),
  );
  const comfortRatio = computed(() =>
    state.mode.value === "move"
      ? calculateHousingRatio(state.rent.value, state.income.value)
      : housingRatio.value,
  );
  const fullPurchasePrice = computed(() =>
    calculateCashPurchase(state.price.value),
  );
  const moveTotal = computed(() =>
    calculateMoveInTotal(
      state.rent.value,
      state.moving.value,
      state.furnishings.value,
    ),
  );
  const emergencyTarget = computed(
    () =>
      calculateEmergencyTarget(state.essentials.value) +
      extraMonthlyCosts.value * 6,
  );
  const cashAvailable = computed(() => 0);
  const disposableMargin = computed(
    () =>
      sanitizeNumber(state.income.value) -
      sanitizeAggregate(state.essentials.value) -
      extraMonthlyCosts.value,
  );
  const disposableMarginPercentage = computed(() =>
    sanitizeNumber(state.income.value) > 0
      ? disposableMargin.value / sanitizeNumber(state.income.value)
      : 0,
  );
  const suggestedSaving = computed(() =>
    calculateSuggestedSaving(state.income.value, disposableMargin.value),
  );
  const effectiveMonthlySaving = computed(() =>
    sanitizeNumber(state.monthlySaving.value) > 0
      ? sanitizeNumber(state.monthlySaving.value)
      : suggestedSaving.value,
  );
  const cashAmountStillNeeded = computed(() =>
    Math.max(0, fullPurchasePrice.value - cashAvailable.value),
  );
  const cashPurchaseMonths = computed(() =>
    cashAmountStillNeeded.value === 0
      ? 0
      : cashSavingPace.value > 0 &&
          cashSavingPace.value <= disposableMargin.value
        ? Math.ceil(cashAmountStillNeeded.value / cashSavingPace.value)
        : Infinity,
  );
  const emergencyGap = computed(() =>
    Math.max(0, emergencyTarget.value - sanitizeNumber(state.saved.value)),
  );
  const emergencySavingPace = computed(() => {
    const selectedSaving = sanitizeNumber(state.monthlySaving.value);
    return suggestedSaving.value === 0 ||
      selectedSaving > disposableMargin.value
      ? 0
      : effectiveMonthlySaving.value;
  });
  const plannedMonthlySaving = computed(() =>
    state.mode.value === "safety"
      ? emergencySavingPace.value
      : sanitizeNumber(state.monthlySaving.value),
  );
  const cashSavingPace = computed(() => plannedMonthlySaving.value);
  const emergencyMonths = computed(() =>
    calculateEmergencyMonths(
      emergencyTarget.value,
      state.saved.value,
      emergencySavingPace.value,
    ),
  );
  const ratio = computed(() => {
    const costs =
      state.mode.value === "purchase"
        ? state.purchaseType.value === "cash"
          ? monthlyHousing.value + state.monthlyCommitments.value
          : monthlyHousing.value +
            planMonthlyPayment.value +
            state.monthlyCommitments.value
        : monthlyHousing.value + state.monthlyCommitments.value;
    return calculateHousingRatio(
      costs +
        state.debtPayments.value +
        state.transport.value +
        state.food.value +
        extraMonthlyCosts.value,
      state.income.value,
    );
  });
  const listedMonthlyCosts = computed(
    () =>
      monthlyHousing.value +
      state.monthlyCommitments.value +
      state.debtPayments.value +
      state.transport.value +
      state.food.value +
      extraMonthlyCosts.value,
  );
  const debtRepaymentRatio = computed(() =>
    calculateHousingRatio(
      state.debtPayments.value + planMonthlyPayment.value,
      state.income.value,
    ),
  );
  const score = computed(() =>
    state.mode.value === "safety"
      ? emergencyTarget.value === 0
        ? 100
        : Math.min(
            100,
            Math.round(
              (sanitizeNumber(state.saved.value) / emergencyTarget.value) * 100,
            ),
          )
      : Math.max(
          0,
          Math.min(
            100,
            Math.round(
              100 -
                ratio.value * 145 -
                (state.mode.value === "move"
                  ? moveTotal.value /
                    Math.max(1, sanitizeNumber(state.income.value)) /
                    2
                  : 0),
            ),
          ),
        ),
  );
  const verdict = computed(() =>
    (state.mode.value === "move"
      ? comfortRatio.value
      : state.mode.value === "safety"
        ? housingRatio.value
        : ratio.value) <= 0.3
      ? "Comfortable"
      : score.value >= 50
        ? "Worth a closer look"
        : "This may stretch you",
  );
  const minSalary = computed(
    () =>
      Math.ceil(
        (state.mode.value === "purchase"
          ? monthlyPayment.value
          : state.mode.value === "move"
            ? state.rent.value
            : monthlyHousing.value) /
          0.3 /
          100,
      ) * 100,
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0,
    }).format(value);

  const results = computed<FinancialResults>(() => ({
    overallStatus:
      state.mode.value === "safety"
        ? emergencyGap.value === 0
          ? "Safety net target reached"
          : score.value >= 50
            ? "Safety net is taking shape"
            : "Safety net needs attention"
        : (state.mode.value === "move" ? comfortRatio.value : ratio.value) <=
            0.3
          ? "Housing looks manageable"
          : "This plan needs a closer look",
    score: score.value,
    purchaseSummary:
      state.purchaseType.value === "cash"
        ? formatCurrency(fullPurchasePrice.value)
        : formatCurrency(monthlyPayment.value),
    purchaseDetails:
      state.purchaseType.value === "cash"
        ? "Paid in cash"
        : `${formatCurrency(Math.max(0, sanitizeNumber(state.price.value) - sanitizeNumber(state.deposit.value)))} borrowed · ${formatCurrency(interestCost.value)} interest · ${sanitizeTermMonths(state.term.value) / 12} years at ${sanitizeNumber(state.rate.value)}%`,
    emergencySummary: formatCurrency(emergencyTarget.value),
    safetyTimeToGoal:
      emergencyGap.value === 0
        ? "Target reached"
        : emergencyMonths.value === Infinity
          ? "Not possible"
          : `${(emergencyMonths.value / 12).toFixed(1)} years`,
    safetyProgress:
      emergencyTarget.value === 0
        ? 100
        : Math.min(
            100,
            Math.round(
              (sanitizeNumber(state.saved.value) / emergencyTarget.value) * 100,
            ),
          ),
    monthlyCosts: formatCurrency(
      monthlyHousing.value +
        planMonthlyPayment.value +
        state.monthlyCommitments.value +
        state.debtPayments.value +
        state.transport.value +
        state.food.value +
        extraMonthlyCosts.value,
    ),
    disposableMargin: formatCurrency(disposableMargin.value),
    disposableMarginPercentage: Math.round(
      disposableMarginPercentage.value * 100,
    ),
    essentialCostRatio: Math.round(
      calculateHousingRatio(
        state.essentials.value + extraMonthlyCosts.value,
        state.income.value,
      ) * 100,
    ),
    essentialCostPosition: getEssentialCostPosition(
      calculateHousingRatio(
        state.essentials.value + extraMonthlyCosts.value,
        state.income.value,
      ),
    )
      .replace(/-/g, " ")
      .replace(/^\w/, (letter) => letter.toUpperCase()),
    cashFlow: {
      income: formatCurrency(state.income.value),
      rent: formatCurrency(state.rent.value),
      utilities: formatCurrency(state.utilities.value),
      transport: formatCurrency(state.transport.value),
      food: formatCurrency(state.food.value),
      debtPayments: formatCurrency(
        state.debtPayments.value + planMonthlyPayment.value,
      ),
      otherCommitments: formatCurrency(
        state.monthlyCommitments.value + extraMonthlyCosts.value,
      ),
      saving: formatCurrency(plannedMonthlySaving.value),
      remaining: formatCurrency(
        state.income.value -
          monthlyHousing.value -
          state.transport.value -
          state.food.value -
          state.debtPayments.value -
          state.monthlyCommitments.value -
          extraMonthlyCosts.value -
          planMonthlyPayment.value -
          plannedMonthlySaving.value,
      ),
    },
    financeHealth: [
      {
        label: "Housing",
        ...evaluateGuideline(
          state.mode.value === "move" ? state.rent.value : monthlyHousing.value,
          state.income.value,
          {
            max: 0.3,
          },
        ),
      },
      {
        label: "Housing + debt",
        ...evaluateGuideline(
          monthlyHousing.value +
            planMonthlyPayment.value +
            state.debtPayments.value,
          state.income.value,
          { max: 0.36 },
        ),
      },
      {
        label: "Transport",
        ...evaluateGuideline(state.transport.value, state.income.value, {
          min: 0.1,
          max: 0.15,
        }),
      },
      {
        label: "Food",
        ...evaluateGuideline(state.food.value, state.income.value, {
          min: 0.1,
          max: 0.15,
        }),
      },
      {
        label: "Utilities",
        ...evaluateGuideline(state.utilities.value, state.income.value, {
          min: 0.05,
          max: 0.1,
        }),
      },
      {
        label: "Savings",
        ...evaluateGuideline(plannedMonthlySaving.value, state.income.value, {
          min: 0.1,
        }),
      },
      {
        label: "Debt repayments",
        ...evaluateGuideline(
          state.debtPayments.value + planMonthlyPayment.value,
          state.income.value,
          {
            max: 0.2,
          },
        ),
      },
    ],
  }));

  return {
    housingRatio,
    comfortRatio,
    housingCost,
    monthlyPayment,
    interestCost,
    fullPurchasePrice,
    moveTotal,
    emergencyTarget,
    cashAvailable,
    listedMonthlyCosts,
    disposableMargin,
    disposableMarginPercentage,
    effectiveMonthlySaving,
    cashPurchaseMonths,
    cashAmountStillNeeded,
    emergencyGap,
    emergencyMonths,
    ratio,
    debtRepaymentRatio,
    score,
    verdict,
    minSalary,
    formatCurrency,
    results,
    isWithinComfortRule,
  };
}
