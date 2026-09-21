import { describe, expect, it } from "vitest";
import {
  buildAffordabilityDisplayState,
  type AffordabilityDisplayInput,
} from "./affordabilityDisplay";

const formatCurrency = (value: number) => `£${value}`;

const createInput = (
  overrides: Partial<AffordabilityDisplayInput> = {},
): AffordabilityDisplayInput => ({
  mode: "purchase",
  purchaseType: "finance",
  verdict: "Worth a closer look",
  score: 60,
  emergencyTarget: 6_000,
  emergencyGap: 2_000,
  emergencyMonths: 20,
  effectiveMonthlySaving: 100,
  fullPurchasePrice: 10_000,
  cashAmountStillNeeded: 10_000,
  cashPurchaseMonths: 100,
  moveTotal: 2_000,
  housingCost: 500,
  housingRatio: 0.25,
  ratio: 0.4,
  monthlyPayment: 500,
  debtRepaymentRatio: 0.1,
  cashAvailable: 0,
  interestCost: 1_000,
  rent: 500,
  income: 2_000,
  comfortRatio: 0.25,
  formatCurrency,
  ...overrides,
});

describe("buildAffordabilityDisplayState", () => {
  it("builds the safety-net display state", () => {
    const display = buildAffordabilityDisplayState(
      createInput({
        mode: "safety",
        emergencyGap: 0,
        emergencyMonths: 0,
      }),
    );

    expect(display).toMatchObject({
      title: "Preparedness plan",
      primaryLabel: "Emergency fund target",
      primaryValue: "£6000",
      secondaryLabel: "Time to save",
      secondaryValue: "Target reached",
      ruleTitle: "Safety-net plan",
      warning: undefined,
    });
    expect(display.copy).toContain("Your target is £6000");
  });

  it("builds purchase warnings from debt repayment ratio", () => {
    const display = buildAffordabilityDisplayState(
      createInput({ debtRepaymentRatio: 0.25 }),
    );

    expect(display).toMatchObject({
      title: "Worth a closer look",
      primaryLabel: "Monthly payment",
      primaryValue: "£500",
      secondaryLabel: "Interest cost",
      secondaryValue: "£1000",
      warningTitle: "Above the 20% debt repayment threshold",
      warning: "Debt repayments use 25% of take-home income.",
    });
  });

  it("labels cash purchases with the zero starting-cash assumption", () => {
    const display = buildAffordabilityDisplayState(
      createInput({ purchaseType: "cash" }),
    );

    expect(display.primaryLabel).toBe("Starting cash (assumed £0)");
    expect(display.primaryValue).toBe("£0");
  });

  it("builds a moving cash warning when rent exceeds the comfort rule", () => {
    const display = buildAffordabilityDisplayState(
      createInput({
        mode: "move",
        comfortRatio: 0.35,
        rent: 700,
      }),
    );

    expect(display).toMatchObject({
      primaryLabel: "Monthly rent",
      primaryValue: "£700",
      secondaryLabel: "Suggested housing max",
      secondaryValue: "£600",
      warning:
        "Minimum income for rent: £2333.3333333333335 / month. Rent currently uses 35% of take-home income.",
    });
  });
});
