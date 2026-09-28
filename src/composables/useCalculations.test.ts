import { ref } from "vue";
import { describe, expect, it } from "vitest";
import { useCalculations } from "./useCalculations";

describe("useCalculations", () => {
  const createCalculations = (
    overrides: {
      monthlySaving?: number;
    } = {},
  ) =>
    useCalculations({
      mode: ref<"purchase" | "move" | "safety">("safety"),
      purchaseType: ref<"finance" | "cash">("finance"),
      income: ref(1_000),
      price: ref(0),
      deposit: ref(0),
      term: ref(12),
      rate: ref(0),
      rent: ref(800),
      moving: ref(0),
      furnishings: ref(0),
      utilities: ref(0),
      transport: ref(0),
      food: ref(0),
      monthlyCommitments: ref(0),
      debtPayments: ref(0),
      saved: ref(0),
      monthlySaving: ref(overrides.monthlySaving ?? 0),
      extraCosts: ref<{ id: number; name: string; amount: number }[]>([]),
    });

  it("preserves aggregate essentials in disposable margin", () => {
    const calculations = useCalculations({
      mode: ref<"purchase" | "move" | "safety">("purchase"),
      purchaseType: ref<"finance" | "cash">("finance"),
      income: ref(1_000_000_000),
      price: ref(0),
      deposit: ref(0),
      term: ref(12),
      rate: ref(0),
      rent: ref(1_000_000_000),
      moving: ref(0),
      furnishings: ref(0),
      utilities: ref(1_000_000_000),
      transport: ref(1_000_000_000),
      food: ref(1_000_000_000),
      monthlyCommitments: ref(1_000_000_000),
      debtPayments: ref(1_000_000_000),
      saved: ref(0),
      monthlySaving: ref(0),
      extraCosts: ref<{ id: number; name: string; amount: number }[]>([]),
    });

    expect(calculations.disposableMargin.value).toBe(-5_000_000_000);
  });

  it("shares saving decisions with the safety calculator", () => {
    const calculations = createCalculations();

    expect(calculations.availableMonthly.value).toBe(200);
    expect(calculations.suggestedSaving.value).toBe(100);
    expect(calculations.suggestedSavingRate.value).toBe(10);
    expect(calculations.savingIsPossible.value).toBe(true);
    expect(calculations.savingIsRealistic.value).toBe(true);
  });

  it("marks an explicit saving pace above the available margin unrealistic", () => {
    const calculations = createCalculations({ monthlySaving: 201 });

    expect(calculations.suggestedSaving.value).toBe(100);
    expect(calculations.savingIsRealistic.value).toBe(false);
  });
});
