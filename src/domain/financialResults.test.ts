import { describe, expect, it } from "vitest";
import { calculateFinancialPlan } from "./financialResults";
import type { FinancialPlanState } from "../types/plan";

const createState = (
  overrides: Partial<FinancialPlanState> = {},
): FinancialPlanState => ({
  mode: "move",
  purchaseType: "finance",
  income: 2_000,
  price: 0,
  deposit: 0,
  term: 12,
  rate: 0,
  rent: 700,
  moving: 0,
  furnishings: 0,
  utilities: 200,
  transport: 200,
  food: 200,
  monthlyCommitments: 100,
  debtPayments: 100,
  saved: 0,
  monthlySaving: 200,
  extraCosts: [{ id: 1, name: "Other", amount: 50 }],
  ...overrides,
});

describe("calculateFinancialPlan", () => {
  it("derives the complete financial result from raw plan state", () => {
    const results = calculateFinancialPlan(createState());

    expect(results).toMatchObject({
      essentials: 1_500,
      status: "plan-needs-review",
      monthlyCosts: 1_550,
      disposableMargin: 450,
      cashFlow: {
        debtPayments: 100,
        otherCommitments: 150,
        remaining: 250,
      },
    });
    expect(results.financeHealth[0]).toEqual({
      metric: "housing",
      ratio: 0.35,
      status: "above",
    });
    expect(results.financeHealth[1]).toEqual({
      metric: "housing-and-debt",
      ratio: 0.5,
      status: "above",
    });
  });

  it("normalizes purchase details and safety progress as domain values", () => {
    const results = calculateFinancialPlan(
      createState({
        mode: "safety",
        price: 10_000,
        deposit: 2_000,
        term: 48,
        rate: 6.9,
        saved: 4_650,
        monthlySaving: 200,
      }),
    );

    expect(results.status).toBe("safety-taking-shape");
    expect(results.purchase).toMatchObject({
      borrowedAmount: 8_000,
      termYears: 4,
      rate: 6.9,
    });
    expect(results.safety.progress).toBe(50);
  });

  it("owns the semantic affordability verdict for the raw plan", () => {
    expect(
      calculateFinancialPlan(createState({ income: 3_000 }))
        .affordabilityVerdict,
    ).toBe("comfortable");
    expect(calculateFinancialPlan(createState()).affordabilityVerdict).toBe(
      "stretching",
    );
  });
});
