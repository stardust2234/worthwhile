import { ref } from "vue";

export type CalculatorMode = "purchase" | "move" | "safety";
type AppView = "calculators" | "results";
type ExtraCost = { id: number; name: string; amount: number };

export function useFinancialState() {
  return {
    mode: ref<CalculatorMode>("purchase"),
    view: ref<AppView>("calculators"),
    purchaseType: ref<"finance" | "cash">("finance"),
    income: ref(4200),
    price: ref(0),
    deposit: ref(0),
    term: ref(48),
    rate: ref(6.9),
    rent: ref(1450),
    moving: ref(0),
    furnishings: ref(0),
    utilities: ref(250),
    transport: ref(0),
    food: ref(0),
    monthlyCommitments: ref(0),
    debtPayments: ref(0),
    essentials: ref(2200),
    saved: ref(1800),
    monthlySaving: ref(350),
    extraCosts: ref<ExtraCost[]>([]),
  };
}
