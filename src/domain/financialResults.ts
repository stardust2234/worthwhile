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
  sanitizeAggregate,
  sanitizeNumber,
  sanitizeTermMonths,
  type EssentialCostPosition,
  type GuidelineStatus,
} from "../calculations";
import type { FinancialPlanState, PurchaseType } from "../types/plan";
export type AffordabilityVerdict = "comfortable" | "closer-look" | "stretching";

export type FinancialResultStatus =
  | "safety-target-reached"
  | "safety-taking-shape"
  | "safety-needs-attention"
  | "housing-manageable"
  | "plan-needs-review";
export type FinanceHealthMetric =
  | "housing"
  | "housing-and-debt"
  | "transport"
  | "food"
  | "utilities"
  | "savings"
  | "debt-repayments";

export type CashFlowData = {
  income: number;
  rent: number;
  utilities: number;
  transport: number;
  food: number;
  debtPayments: number;
  otherCommitments: number;
  saving: number;
  remaining: number;
};

export type FinanceHealthData = {
  metric: FinanceHealthMetric;
  ratio: number;
  status: GuidelineStatus;
};

export type FinancialResultData = {
  status: FinancialResultStatus;
  score: number;
  purchase: {
    type: PurchaseType;
    summaryAmount: number;
    borrowedAmount: number;
    interestCost: number;
    termYears: number;
    rate: number;
  };
  safety: {
    target: number;
    gap: number;
    months: number;
    progress: number;
  };
  monthlyCosts: number;
  disposableMargin: number;
  disposableMarginRatio: number;
  essentialCostRatio: number;
  essentialCostPosition: EssentialCostPosition;
  cashFlow: CashFlowData;
  financeHealth: FinanceHealthData[];
};

export type FinancialCalculationResult = FinancialResultData & {
  essentials: number;
  affordabilityVerdict: AffordabilityVerdict;
  debtRepaymentAboveGuideline: boolean;
  rentAboveComfortRule: boolean;
  suggestedHousingMaximum: number;
  minimumIncomeForRent: number;
  housingRatio: number;
  comfortRatio: number;
  housingCost: number;
  monthlyPayment: number;
  interestCost: number;
  fullPurchasePrice: number;
  moveTotal: number;
  emergencyTarget: number;
  cashAvailable: number;
  extraMonthlyCosts: number;
  monthlyHousing: number;
  plannedMonthlySaving: number;
  availableMonthly: number;
  suggestedSaving: number;
  suggestedSavingRate: number;
  effectiveMonthlySaving: number;
  savingIsPossible: boolean;
  savingIsRealistic: boolean;
  cashPurchaseMonths: number;
  cashAmountStillNeeded: number;
  emergencyGap: number;
  emergencyMonths: number;
  ratio: number;
  debtRepaymentRatio: number;
};

const evaluateMetric = (
  metric: FinanceHealthMetric,
  amount: number,
  income: number,
  guideline: { min?: number; max?: number },
): FinanceHealthData => {
  const { ratio, status } = evaluateGuideline(amount, income, guideline);
  return { metric, ratio, status };
};

export const calculateFinancialPlan = (
  state: FinancialPlanState,
): FinancialCalculationResult => {
  const extraMonthlyCosts = state.extraCosts.reduce(
    (sum, cost) => sum + sanitizeNumber(cost.amount),
    0,
  );
  const monthlyHousing =
    sanitizeNumber(state.rent) + sanitizeNumber(state.utilities);
  const monthlyPayment = calculateMonthlyPayment(
    state.price,
    state.deposit,
    state.term,
    state.rate,
  );
  const planMonthlyPayment =
    state.mode === "purchase" && state.purchaseType === "finance"
      ? monthlyPayment
      : 0;
  const interestCost = calculateInterestCost(
    state.price,
    state.deposit,
    state.term,
    state.rate,
  );
  const housingCost =
    state.mode === "purchase"
      ? state.purchaseType === "cash"
        ? 0
        : monthlyPayment
      : monthlyHousing;
  const housingRatio =
    sanitizeNumber(state.income) === 0
      ? 1
      : housingCost / sanitizeNumber(state.income);
  const comfortRatio =
    state.mode === "move"
      ? calculateHousingRatio(state.rent, state.income)
      : housingRatio;
  const fullPurchasePrice = calculateCashPurchase(state.price);
  const moveTotal = calculateMoveInTotal(
    state.rent,
    state.moving,
    state.furnishings,
  );
  const essentials =
    sanitizeNumber(state.rent) +
    sanitizeNumber(state.utilities) +
    sanitizeNumber(state.transport) +
    sanitizeNumber(state.food) +
    sanitizeNumber(state.debtPayments) +
    sanitizeNumber(state.monthlyCommitments);
  const emergencyTarget =
    calculateEmergencyTarget(essentials) + extraMonthlyCosts * 6;
  const cashAvailable = 0;
  const disposableMargin =
    sanitizeNumber(state.income) -
    sanitizeAggregate(essentials) -
    extraMonthlyCosts;
  const availableMonthly = Math.max(0, disposableMargin);
  const disposableMarginRatio =
    sanitizeNumber(state.income) > 0
      ? disposableMargin / sanitizeNumber(state.income)
      : 0;
  const essentialCostRatio = calculateHousingRatio(
    essentials + extraMonthlyCosts,
    state.income,
  );
  const essentialCostPosition = getEssentialCostPosition(essentialCostRatio);
  const suggestedSaving = calculateSuggestedSaving(
    state.income,
    disposableMargin,
  );
  const effectiveMonthlySaving =
    sanitizeNumber(state.monthlySaving) > 0
      ? sanitizeNumber(state.monthlySaving)
      : suggestedSaving;
  const suggestedSavingRate =
    sanitizeNumber(state.income) > 0
      ? (suggestedSaving / sanitizeNumber(state.income)) * 100
      : 0;
  const savingIsPossible = suggestedSaving > 0;
  const savingIsRealistic =
    savingIsPossible && effectiveMonthlySaving <= availableMonthly;
  const cashAmountStillNeeded = Math.max(0, fullPurchasePrice - cashAvailable);
  const plannedMonthlySaving =
    state.mode === "safety"
      ? (() => {
          const selectedSaving = sanitizeNumber(state.monthlySaving);
          return suggestedSaving === 0 || selectedSaving > disposableMargin
            ? 0
            : effectiveMonthlySaving;
        })()
      : sanitizeNumber(state.monthlySaving);
  const cashPurchaseMonths =
    cashAmountStillNeeded === 0
      ? 0
      : plannedMonthlySaving > 0 && plannedMonthlySaving <= disposableMargin
        ? Math.ceil(cashAmountStillNeeded / plannedMonthlySaving)
        : Infinity;
  const emergencyGap = Math.max(
    0,
    emergencyTarget - sanitizeNumber(state.saved),
  );
  const emergencySavingPace =
    suggestedSaving === 0 ||
    sanitizeNumber(state.monthlySaving) > disposableMargin
      ? 0
      : effectiveMonthlySaving;
  const emergencyMonths = calculateEmergencyMonths(
    emergencyTarget,
    state.saved,
    emergencySavingPace,
  );
  const ratioCosts =
    state.mode === "purchase"
      ? state.purchaseType === "cash"
        ? monthlyHousing + state.monthlyCommitments
        : monthlyHousing + planMonthlyPayment + state.monthlyCommitments
      : monthlyHousing + state.monthlyCommitments;
  const ratio = calculateHousingRatio(
    ratioCosts +
      state.debtPayments +
      state.transport +
      state.food +
      extraMonthlyCosts,
    state.income,
  );
  const debtRepaymentRatio = calculateHousingRatio(
    state.debtPayments + planMonthlyPayment,
    state.income,
  );
  const score =
    state.mode === "safety"
      ? emergencyTarget === 0
        ? 100
        : Math.min(
            100,
            Math.round((sanitizeNumber(state.saved) / emergencyTarget) * 100),
          )
      : Math.max(
          0,
          Math.min(
            100,
            Math.round(
              100 -
                ratio * 145 -
                (state.mode === "move"
                  ? moveTotal / Math.max(1, sanitizeNumber(state.income)) / 2
                  : 0),
            ),
          ),
        );
  const affordabilityRatio =
    state.mode === "move"
      ? comfortRatio
      : state.mode === "safety"
        ? housingRatio
        : ratio;
  const affordabilityVerdict: AffordabilityVerdict =
    affordabilityRatio <= 0.3
      ? "comfortable"
      : score >= 50
        ? "closer-look"
        : "stretching";
  const status: FinancialResultStatus =
    state.mode === "safety"
      ? emergencyGap === 0
        ? "safety-target-reached"
        : score >= 50
          ? "safety-taking-shape"
          : "safety-needs-attention"
      : (state.mode === "move" ? comfortRatio : ratio) <= 0.3
        ? "housing-manageable"
        : "plan-needs-review";
  const remaining =
    state.income -
    monthlyHousing -
    state.transport -
    state.food -
    state.debtPayments -
    state.monthlyCommitments -
    extraMonthlyCosts -
    planMonthlyPayment -
    plannedMonthlySaving;

  return {
    essentials,
    affordabilityVerdict,
    debtRepaymentAboveGuideline: debtRepaymentRatio > 0.2,
    rentAboveComfortRule: comfortRatio > 0.3,
    suggestedHousingMaximum: sanitizeNumber(state.income) * 0.3,
    minimumIncomeForRent: state.rent / 0.3,
    housingRatio,
    comfortRatio,
    housingCost,
    monthlyPayment,
    interestCost,
    fullPurchasePrice,
    moveTotal,
    emergencyTarget,
    cashAvailable,
    extraMonthlyCosts,
    monthlyHousing,
    plannedMonthlySaving,
    availableMonthly,
    suggestedSaving,
    suggestedSavingRate,
    effectiveMonthlySaving,
    savingIsPossible,
    savingIsRealistic,
    cashPurchaseMonths,
    cashAmountStillNeeded,
    emergencyGap,
    emergencyMonths,
    ratio,
    debtRepaymentRatio,
    status,
    score,
    purchase: {
      type: state.purchaseType,
      summaryAmount:
        state.purchaseType === "cash" ? fullPurchasePrice : monthlyPayment,
      borrowedAmount: Math.max(
        0,
        sanitizeNumber(state.price) - sanitizeNumber(state.deposit),
      ),
      interestCost,
      termYears: sanitizeTermMonths(state.term) / 12,
      rate: sanitizeNumber(state.rate),
    },
    safety: {
      target: emergencyTarget,
      gap: emergencyGap,
      months: emergencyMonths,
      progress:
        emergencyTarget === 0
          ? 100
          : Math.min(
              100,
              Math.round(
                ((emergencyTarget - emergencyGap) / emergencyTarget) * 100,
              ),
            ),
    },
    monthlyCosts:
      monthlyHousing +
      planMonthlyPayment +
      state.monthlyCommitments +
      state.debtPayments +
      state.transport +
      state.food +
      extraMonthlyCosts,
    disposableMargin,
    disposableMarginRatio,
    essentialCostRatio,
    essentialCostPosition,
    cashFlow: {
      income: state.income,
      rent: state.rent,
      utilities: state.utilities,
      transport: state.transport,
      food: state.food,
      debtPayments: state.debtPayments + planMonthlyPayment,
      otherCommitments: state.monthlyCommitments + extraMonthlyCosts,
      saving: plannedMonthlySaving,
      remaining,
    },
    financeHealth: [
      evaluateMetric(
        "housing",
        state.mode === "move" ? state.rent : monthlyHousing,
        state.income,
        { max: 0.3 },
      ),
      evaluateMetric(
        "housing-and-debt",
        monthlyHousing + planMonthlyPayment + state.debtPayments,
        state.income,
        { max: 0.36 },
      ),
      evaluateMetric("transport", state.transport, state.income, {
        min: 0.1,
        max: 0.15,
      }),
      evaluateMetric("food", state.food, state.income, {
        min: 0.1,
        max: 0.15,
      }),
      evaluateMetric("utilities", state.utilities, state.income, {
        min: 0.05,
        max: 0.1,
      }),
      evaluateMetric("savings", plannedMonthlySaving, state.income, {
        min: 0.1,
      }),
      evaluateMetric(
        "debt-repayments",
        state.debtPayments + planMonthlyPayment,
        state.income,
        { max: 0.2 },
      ),
    ],
  };
};
