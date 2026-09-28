import type { CurrencyFormatter, FinancialResults } from "../types/financial";
import type {
  CashFlowData,
  FinanceHealthData,
  FinanceHealthMetric,
  FinancialResultData,
  FinancialResultStatus,
} from "../domain/financialResults";

export const formatCurrency: CurrencyFormatter = (value) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);

const statusLabels: Record<FinancialResultStatus, string> = {
  "safety-target-reached": "Safety net target reached",
  "safety-taking-shape": "Safety net is taking shape",
  "safety-needs-attention": "Safety net needs attention",
  "housing-manageable": "Housing looks manageable",
  "plan-needs-review": "This plan needs a closer look",
};

const metricLabels: Record<FinanceHealthMetric, string> = {
  housing: "Housing",
  "housing-and-debt": "Housing + debt",
  transport: "Transport",
  food: "Food",
  utilities: "Utilities",
  savings: "Savings",
  "debt-repayments": "Debt repayments",
};

export const buildCashFlow = (
  input: CashFlowData,
  formatCurrency: CurrencyFormatter,
): FinancialResults["cashFlow"] => ({
  income: formatCurrency(input.income),
  rent: formatCurrency(input.rent),
  utilities: formatCurrency(input.utilities),
  transport: formatCurrency(input.transport),
  food: formatCurrency(input.food),
  debtPayments: formatCurrency(input.debtPayments),
  otherCommitments: formatCurrency(input.otherCommitments),
  saving: formatCurrency(input.saving),
  remaining: formatCurrency(input.remaining),
});

export const buildFinanceHealth = (
  input: FinanceHealthData[],
): NonNullable<FinancialResults["financeHealth"]> =>
  input.map(({ metric, ratio, status }) => ({
    label: metricLabels[metric],
    percentage: Math.round(ratio * 100),
    status,
  }));

export const buildFinancialResults = (
  input: FinancialResultData,
  formatCurrency: CurrencyFormatter,
): FinancialResults => ({
  overallStatus: statusLabels[input.status],
  score: input.score,
  purchaseSummary: formatCurrency(input.purchase.summaryAmount),
  purchaseDetails:
    input.purchase.type === "cash"
      ? "Paid in cash"
      : `${formatCurrency(input.purchase.borrowedAmount)} borrowed · ${formatCurrency(input.purchase.interestCost)} interest · ${input.purchase.termYears} years at ${input.purchase.rate}%`,
  emergencySummary: formatCurrency(input.safety.target),
  safetyTimeToGoal:
    input.safety.gap === 0
      ? "Target reached"
      : input.safety.months === Infinity
        ? "Not possible"
        : `${(input.safety.months / 12).toFixed(1)} years`,
  safetyProgress: input.safety.progress,
  monthlyCosts: formatCurrency(input.monthlyCosts),
  disposableMargin: formatCurrency(input.disposableMargin),
  disposableMarginPercentage: Math.round(input.disposableMarginRatio * 100),
  essentialCostRatio: Math.round(input.essentialCostRatio * 100),
  essentialCostPosition: input.essentialCostPosition
    .replace(/-/g, " ")
    .replace(/^\w/, (letter) => letter.toUpperCase()),
  cashFlow: buildCashFlow(input.cashFlow, formatCurrency),
  financeHealth: buildFinanceHealth(input.financeHealth),
});
