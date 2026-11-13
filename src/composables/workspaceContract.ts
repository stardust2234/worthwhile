import type { ComputedRef } from "vue";
import type { AffordabilityDisplayState } from "../viewModels/affordabilityDisplay";
import type { PlanMetrics } from "../domain/financialResults";
import type { FinancialResults } from "../types/financial";
import type {
  AppView,
  CalculatorMode,
  ExtraCost,
  PurchaseType,
} from "../types/plan";

export type WorkspaceState = {
  mode: CalculatorMode;
  view: AppView;
  purchaseType: PurchaseType;
  income: number;
  price: number;
  deposit: number;
  term: number;
  rate: number;
  rent: number;
  moving: number;
  furnishings: number;
  utilities: number;
  transport: number;
  food: number;
  monthlyCommitments: number;
  debtPayments: number;
  saved: number;
  monthlySaving: number;
  extraCosts: ExtraCost[];
  preferencesOpen: boolean;
  notice: string;
};

export type WorkspaceCommands = {
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
  openPreferences(): void;
  closePreferences(): void;
  savePreferences(): void;
  clearSavedData(): void;
  showNotice(message: string): void;
  formatCurrency(value: number): string;
};

export type WorkspaceController = {
  state: WorkspaceState;
  metrics: ComputedRef<PlanMetrics>;
  affordabilityDisplay: ComputedRef<AffordabilityDisplayState>;
  calculatedResults: ComputedRef<FinancialResults>;
  commands: WorkspaceCommands;
};
