import { evaluateGuideline } from "../calculations";
import type { FinancialResults } from "../types/financial";

export type CalculationMode = "purchase" | "move" | "safety";
export type CurrencyFormatter = (value: number) => string;

export type CashFlowViewModelInput = {
  income: number;
  rent: number;
  utilities: number;
  transport: number;
  food: number;
  debtPayments: number;
  monthlyHousing: number;
  monthlyCommitments: number;
  extraMonthlyCosts: number;
  planMonthlyPayment: number;
  plannedMonthlySaving: number;
};

export const buildCashFlow = (
  input: CashFlowViewModelInput,
  formatCurrency: CurrencyFormatter,
): FinancialResults["cashFlow"] => ({
  income: formatCurrency(input.income),
  rent: formatCurrency(input.rent),
  utilities: formatCurrency(input.utilities),
  transport: formatCurrency(input.transport),
  food: formatCurrency(input.food),
  debtPayments: formatCurrency(input.debtPayments + input.planMonthlyPayment),
  otherCommitments: formatCurrency(
    input.monthlyCommitments + input.extraMonthlyCosts,
  ),
  saving: formatCurrency(input.plannedMonthlySaving),
  remaining: formatCurrency(
    input.income -
      input.monthlyHousing -
      input.transport -
      input.food -
      input.debtPayments -
      input.monthlyCommitments -
      input.extraMonthlyCosts -
      input.planMonthlyPayment -
      input.plannedMonthlySaving,
  ),
});

export type FinanceHealthViewModelInput = {
  mode: CalculationMode;
  income: number;
  rent: number;
  utilities: number;
  transport: number;
  food: number;
  debtPayments: number;
  monthlyHousing: number;
  planMonthlyPayment: number;
  plannedMonthlySaving: number;
};

export const buildFinanceHealth = (
  input: FinanceHealthViewModelInput,
): NonNullable<FinancialResults["financeHealth"]> => [
  {
    label: "Housing",
    ...evaluateGuideline(
      input.mode === "move" ? input.rent : input.monthlyHousing,
      input.income,
      { max: 0.3 },
    ),
  },
  {
    label: "Housing + debt",
    ...evaluateGuideline(
      input.monthlyHousing + input.planMonthlyPayment + input.debtPayments,
      input.income,
      { max: 0.36 },
    ),
  },
  {
    label: "Transport",
    ...evaluateGuideline(input.transport, input.income, {
      min: 0.1,
      max: 0.15,
    }),
  },
  {
    label: "Food",
    ...evaluateGuideline(input.food, input.income, {
      min: 0.1,
      max: 0.15,
    }),
  },
  {
    label: "Utilities",
    ...evaluateGuideline(input.utilities, input.income, {
      min: 0.05,
      max: 0.1,
    }),
  },
  {
    label: "Savings",
    ...evaluateGuideline(input.plannedMonthlySaving, input.income, {
      min: 0.1,
    }),
  },
  {
    label: "Debt repayments",
    ...evaluateGuideline(
      input.debtPayments + input.planMonthlyPayment,
      input.income,
      { max: 0.2 },
    ),
  },
];
