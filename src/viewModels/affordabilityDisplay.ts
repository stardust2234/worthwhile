import type { AffordabilityVerdict } from "../domain/financialResults";
import type { CurrencyFormatter } from "../types/financial";

type AffordabilityDisplayMode = "purchase" | "move" | "safety";
type PurchaseDisplayType = "finance" | "cash";

export type AffordabilityDisplayState = {
  title: string;
  score: number;
  copy: string;
  primaryLabel: string;
  primaryValue: string;
  secondaryLabel: string;
  secondaryValue: string;
  ruleTitle: string;
  ruleCopy: string;
  warningTitle?: string;
  warning?: string;
};

export type AffordabilityDisplayInput = {
  mode: AffordabilityDisplayMode;
  purchaseType: PurchaseDisplayType;
  score: number;
  emergencyTarget: number;
  emergencyGap: number;
  emergencyMonths: number;
  effectiveMonthlySaving: number;
  fullPurchasePrice: number;
  cashAmountStillNeeded: number;
  cashPurchaseMonths: number;
  moveTotal: number;
  housingCost: number;
  housingRatio: number;
  ratio: number;
  monthlyPayment: number;
  debtRepaymentRatio: number;
  cashAvailable: number;
  interestCost: number;
  rent: number;
  income: number;
  comfortRatio: number;
  affordabilityVerdict: AffordabilityVerdict;
  debtRepaymentAboveGuideline: boolean;
  rentAboveComfortRule: boolean;
  suggestedHousingMaximum: number;
  minimumIncomeForRent: number;
  formatCurrency: CurrencyFormatter;
};

const monthsLabel = (months: number) =>
  `${months} month${months === 1 ? "" : "s"}`;

export const buildAffordabilityDisplayState = (
  input: AffordabilityDisplayInput,
): AffordabilityDisplayState => {
  const isCashPurchase =
    input.mode === "purchase" && input.purchaseType === "cash";
  const isSafetyPlan = input.mode === "safety";
  const verdict = {
    comfortable: "Comfortable",
    "closer-look": "Worth a closer look",
    stretching: "This may stretch you",
  }[input.affordabilityVerdict];

  const copy = isSafetyPlan
    ? `Your target is ${input.formatCurrency(input.emergencyTarget)}. You need ${input.formatCurrency(input.emergencyGap)} to reach your goal. ${input.emergencyGap === 0 ? "Your target is reached." : input.emergencyMonths === Infinity ? "Increase your monthly saving pace to calculate a finish date." : `At ${input.formatCurrency(input.effectiveMonthlySaving)} per month, you have ${input.emergencyMonths} month${input.emergencyMonths === 1 ? "" : "s"} to go.`}`
    : isCashPurchase
      ? input.cashAmountStillNeeded === 0
        ? `The full purchase price is ${input.formatCurrency(input.fullPurchasePrice)}. It is covered without borrowing.`
        : input.cashPurchaseMonths === Infinity
          ? `The full purchase price is ${input.formatCurrency(input.fullPurchasePrice)}. It cannot currently be funded from your available monthly surplus.`
          : `The full purchase price is ${input.formatCurrency(input.fullPurchasePrice)}. At your planned saving pace, you can afford this without borrowing in approximately ${monthsLabel(input.cashPurchaseMonths)} if your current income and essential expenses remain unchanged.`
      : input.mode === "move"
        ? `Your first-month move-in cost is ${input.formatCurrency(input.moveTotal)}. Housing is ${input.formatCurrency(input.housingCost)} per month (${Math.round(input.housingRatio * 100)}% of income); housing and listed commitments together use ${Math.round(input.ratio * 100)}%.`
        : `Your estimated monthly purchase payment is ${input.formatCurrency(input.monthlyPayment)} per month (${Math.round(input.housingRatio * 100)}% of take-home income). Debt repayments use ${Math.round(input.debtRepaymentRatio * 100)}% of take-home income.`;

  const secondaryValue = isCashPurchase
    ? input.cashAmountStillNeeded === 0
      ? "Covered this month"
      : input.cashPurchaseMonths === Infinity
        ? "Not possible"
        : monthsLabel(input.cashPurchaseMonths)
    : input.mode === "purchase"
      ? input.formatCurrency(input.interestCost)
      : isSafetyPlan
        ? input.emergencyGap === 0
          ? "Target reached"
          : input.emergencyMonths === Infinity
            ? "Not possible"
            : `${(input.emergencyMonths / 12).toFixed(1)} years`
        : input.formatCurrency(input.suggestedHousingMaximum);

  return {
    title: isSafetyPlan ? "Preparedness plan" : verdict,
    score: input.score,
    copy,
    primaryLabel: isSafetyPlan
      ? "Emergency fund target"
      : isCashPurchase
        ? "Starting cash (assumed £0)"
        : input.mode === "purchase"
          ? "Monthly payment"
          : "Monthly rent",
    primaryValue: input.formatCurrency(
      isSafetyPlan
        ? input.emergencyTarget
        : input.mode === "purchase"
          ? isCashPurchase
            ? input.cashAvailable
            : input.monthlyPayment
          : input.rent,
    ),
    secondaryLabel: isCashPurchase
      ? "Time to save"
      : input.mode === "purchase"
        ? "Interest cost"
        : isSafetyPlan
          ? "Time to save"
          : "Suggested housing max",
    secondaryValue,
    ruleTitle: isSafetyPlan
      ? "Safety-net plan"
      : input.mode === "purchase"
        ? "Within the 20% debt repayment threshold"
        : "Under the 30% comfort rule",
    ruleCopy: isSafetyPlan
      ? "Your saving plan is building toward your emergency fund target."
      : input.mode === "purchase"
        ? "Your purchase debt repayments stay within 20% of take-home income."
        : "Your rent stays within 30% of take-home income.",
    warningTitle:
      input.mode === "purchase"
        ? "Above the 20% debt repayment threshold"
        : undefined,
    warning:
      input.mode === "purchase" && input.debtRepaymentAboveGuideline
        ? `Debt repayments use ${Math.round(input.debtRepaymentRatio * 100)}% of take-home income.`
        : input.mode === "move" && input.rentAboveComfortRule
          ? `Minimum income for rent: ${input.formatCurrency(input.minimumIncomeForRent)} / month. Rent currently uses ${Math.round(input.comfortRatio * 100)}% of take-home income.`
          : undefined,
  };
};
