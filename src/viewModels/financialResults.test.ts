import { describe, expect, it } from "vitest";
import { buildCashFlow, buildFinanceHealth } from "./financialResults";

const formatCurrency = (value: number) => `£${value}`;

describe("financial result view-model builders", () => {
  it("builds a cash-flow view model from monthly amounts", () => {
    expect(
      buildCashFlow(
        {
          income: 2_000,
          rent: 700,
          utilities: 200,
          transport: 100,
          food: 250,
          debtPayments: 150,
          monthlyHousing: 900,
          monthlyCommitments: 100,
          extraMonthlyCosts: 50,
          planMonthlyPayment: 300,
          plannedMonthlySaving: 100,
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

  it("builds guideline indicators using moving-plan rent for housing", () => {
    const health = buildFinanceHealth({
      mode: "move",
      income: 2_000,
      rent: 700,
      utilities: 200,
      transport: 200,
      food: 200,
      debtPayments: 100,
      monthlyHousing: 900,
      planMonthlyPayment: 0,
      plannedMonthlySaving: 200,
    });

    expect(health[0]).toMatchObject({
      label: "Housing",
      percentage: 35,
      status: "above",
    });
    expect(health[1]).toMatchObject({
      label: "Housing + debt",
      percentage: 50,
      status: "above",
    });
    expect(health[6]).toMatchObject({
      label: "Debt repayments",
      percentage: 5,
      status: "within",
    });
  });
});
