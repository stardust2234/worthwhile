import { describe, expect, it } from "vitest";
import type { FinancialResultData } from "../domain/financialResults";
import {
  buildCashFlow,
  buildFinanceHealth,
  buildFinancialResults,
} from "./financialResults";

const formatCurrency = (value: number) => `£${value}`;

const createResultData = (
  overrides: Partial<FinancialResultData> = {},
): FinancialResultData => ({
  status: "safety-needs-attention",
  score: 0,
  purchase: {
    type: "finance",
    summaryAmount: 0,
    borrowedAmount: 0,
    interestCost: 0,
    termYears: 1,
    rate: 0,
  },
  safety: {
    target: 4_800,
    gap: 4_800,
    months: 48,
    progress: 0,
  },
  monthlyCosts: 800,
  disposableMargin: 200,
  disposableMarginRatio: 0.2,
  essentialCostRatio: 0.8,
  essentialCostPosition: "vulnerable",
  cashFlow: {
    income: 1_000,
    rent: 0,
    utilities: 0,
    transport: 0,
    food: 0,
    debtPayments: 0,
    otherCommitments: 0,
    saving: 100,
    remaining: 900,
  },
  financeHealth: [{ metric: "housing", ratio: 0, status: "within" }],
  ...overrides,
});

describe("financial result view-model builders", () => {
  it("formats pre-calculated cash-flow amounts", () => {
    expect(
      buildCashFlow(
        {
          income: 2_000,
          rent: 700,
          utilities: 200,
          transport: 100,
          food: 250,
          debtPayments: 450,
          otherCommitments: 150,
          saving: 100,
          remaining: 50,
        },
        formatCurrency,
      ),
    ).toEqual({
      income: "£2000",
      rent: "£700",
      utilities: "£200",
      transport: "£100",
      food: "£250",
      debtPayments: "£450",
      otherCommitments: "£150",
      saving: "£100",
      remaining: "£50",
    });
  });

  it("adds labels and percentages to domain guideline results", () => {
    const health = buildFinanceHealth([
      { metric: "housing", ratio: 0.35, status: "above" },
      { metric: "housing-and-debt", ratio: 0.5, status: "above" },
      { metric: "debt-repayments", ratio: 0.05, status: "within" },
    ]);

    expect(health).toEqual([
      { label: "Housing", percentage: 35, status: "above" },
      { label: "Housing + debt", percentage: 50, status: "above" },
      { label: "Debt repayments", percentage: 5, status: "within" },
    ]);
  });

  it("builds formatted results from domain result data", () => {
    const results = buildFinancialResults(createResultData(), formatCurrency);

    expect(results).toMatchObject({
      overallStatus: "Safety net needs attention",
      essentialCostRatio: 80,
      essentialCostPosition: "Vulnerable",
      cashFlow: {
        income: "£1000",
        saving: "£100",
        remaining: "£900",
      },
    });
    expect(results.financeHealth?.[0]).toEqual({
      label: "Housing",
      percentage: 0,
      status: "within",
    });
  });
});
