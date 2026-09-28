import { ref } from "vue";
import type {
  AppView,
  CalculatorMode,
  ExtraCost,
  PurchaseType,
} from "../types/plan";

export function useFinancialState() {
  return {
    mode: ref<CalculatorMode>("purchase"),
    view: ref<AppView>("calculators"),
    purchaseType: ref<PurchaseType>("finance"),
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
    saved: ref(1800),
    monthlySaving: ref(350),
    extraCosts: ref<ExtraCost[]>([]),
  };
}
