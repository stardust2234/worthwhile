export type CurrencyFormatter = (value: number) => string;

export type FinancialResults = {
  overallStatus: string;
  score: number;
  purchaseSummary: string;
  purchaseDetails?: string;
  emergencySummary: string;
  safetyTimeToGoal?: string;
  safetyProgress?: number;
  monthlyCosts: string;
  disposableMargin?: string;
  disposableMarginPercentage?: number;
  essentialCostRatio?: number;
  essentialCostPosition?: string;
  cashFlow: {
    income: string;
    rent: string;
    utilities: string;
    transport?: string;
    food?: string;
    debtPayments: string;
    otherCommitments: string;
    saving: string;
    remaining: string;
  };
  financeHealth?: Array<{
    label: string;
    percentage: number;
    status: "below" | "within" | "above";
    position?: string;
  }>;
};
