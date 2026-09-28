export type CalculatorMode = "purchase" | "move" | "safety";
export type PurchaseType = "finance" | "cash";
export type AppView = "calculators" | "results";
export type ExtraCost = { id: number; name: string; amount: number };

export type FinancialPlanState = {
  mode: CalculatorMode;
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
};

export type PlanStorageRecord = FinancialPlanState & {
  view: AppView;
};

export type PartialPlanStorageRecord = Partial<FinancialPlanState> & {
  view?: AppView;
};

export interface PlanPersistencePort {
  load(): PartialPlanStorageRecord | null;
  save(record: PlanStorageRecord): void;
  clear(): void;
}
