import type { ComputedRef, Ref } from "vue";
import type { AffordabilityDisplayState } from "../viewModels/affordabilityDisplay";
import type { FinancialResults } from "../types/financial";
import type {
  AppView,
  CalculatorMode,
  ExtraCost,
  PurchaseType,
} from "../types/plan";

type WorkspaceDto = {
  mode: Ref<CalculatorMode>;
  view: Ref<AppView>;
  purchaseType: Ref<PurchaseType>;
  income: Ref<number>;
  price: Ref<number>;
  deposit: Ref<number>;
  term: Ref<number>;
  rate: Ref<number>;
  rent: Ref<number>;
  moving: Ref<number>;
  furnishings: Ref<number>;
  utilities: Ref<number>;
  essentials: ComputedRef<number>;
  saved: Ref<number>;
  monthlySaving: Ref<number>;
  extraCosts: Ref<ExtraCost[]>;
  affordabilityDisplay: ComputedRef<AffordabilityDisplayState>;
  calculatedResults: ComputedRef<FinancialResults>;
  availableMonthly: ComputedRef<number>;
  suggestedSaving: ComputedRef<number>;
  suggestedSavingRate: ComputedRef<number>;
  savingIsPossible: ComputedRef<boolean>;
  savingIsRealistic: ComputedRef<boolean>;
  fmt: (value: number) => string;
};

type WorkspaceCommands = {
  setIncome(value: number): void;
  setPrice(value: number): void;
  setDeposit(value: number): void;
  setRate(value: number): void;
  setTerm(value: number): void;
  setPurchaseType(value: PurchaseType): void;
  setRent(value: number): void;
  setMoving(value: number): void;
  setFurnishings(value: number): void;
  setUtilities(value: number): void;
  setTransport(value: number): void;
  setFood(value: number): void;
  setDebtPayments(value: number): void;
  setMonthlySaving(value: number): void;
  setMonthlyCommitments(value: number): void;
  setSaved(value: number): void;
  addCost(): void;
  removeCost(id: number): void;
  setExtraCostName(id: number, value: string): void;
  setExtraCostAmount(id: number, value: number): void;
  savePlan(): void;
  selectCalculator(next: CalculatorMode | "results"): void;
};

export type WorkspaceController = WorkspaceDto & WorkspaceCommands;
