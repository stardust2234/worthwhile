const MAX_FINANCIAL_VALUE = 1_000_000_000;

export const sanitizeNumber = (value: number | string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? Math.min(MAX_FINANCIAL_VALUE, Math.max(0, parsed))
    : 0;
};
export const sanitizeRate = (value: number | string): number =>
  Math.min(100, sanitizeNumber(value));
export const sanitizeAggregate = (value: number): number =>
  Number.isFinite(value) ? Math.max(0, value) : 0;
export const sanitizeTermMonths = (termMonths: number): number =>
  Math.min(60, Math.max(1, sanitizeNumber(termMonths)));
export const normalizePurchaseTerm = (termMonths: number): number => {
  const supportedTerms = [12, 24, 36, 48, 60];
  const boundedTerm = sanitizeTermMonths(termMonths);
  return supportedTerms.reduce((nearest, candidate) =>
    Math.abs(candidate - boundedTerm) < Math.abs(nearest - boundedTerm)
      ? candidate
      : nearest,
  );
};
const calculateUnroundedMonthlyPayment = (
  price: number,
  deposit: number,
  termMonths: number,
  annualRate: number,
): number => {
  const principal = Math.max(
    0,
    sanitizeNumber(price) - sanitizeNumber(deposit),
  );
  const months = sanitizeTermMonths(termMonths);
  const monthlyRate = sanitizeRate(annualRate) / 1200;
  if (monthlyRate === 0) return principal / months;
  return (
    (principal * monthlyRate * (1 + monthlyRate) ** months) /
    ((1 + monthlyRate) ** months - 1)
  );
};
export function calculateMonthlyPayment(
  price: number,
  deposit: number,
  termMonths: number,
  annualRate: number,
): number {
  return Math.round(
    calculateUnroundedMonthlyPayment(price, deposit, termMonths, annualRate),
  );
}
export const calculateInterestCost = (
  price: number,
  deposit: number,
  termMonths: number,
  annualRate: number,
): number =>
  Math.max(
    0,
    Math.round(
      calculateUnroundedMonthlyPayment(price, deposit, termMonths, annualRate) *
        sanitizeTermMonths(termMonths) -
        Math.max(0, sanitizeNumber(price) - sanitizeNumber(deposit)),
    ),
  );
export const calculateCashPurchase = (price: number): number =>
  sanitizeNumber(price);
export const calculateMoveInTotal = (
  rent: number,
  moving: number,
  furnishings: number,
): number =>
  sanitizeNumber(rent) + sanitizeNumber(moving) + sanitizeNumber(furnishings);
export const calculateEmergencyTarget = (
  essentialMonthlySpend: number,
): number => sanitizeAggregate(essentialMonthlySpend) * 6;
export const calculateEmergencyMonths = (
  target: number,
  saved: number,
  monthlySaving: number,
): number => {
  const safeTarget = Number.isFinite(target) ? Math.max(0, target) : 0;
  const gap = Math.max(0, safeTarget - sanitizeNumber(saved));
  const pace = sanitizeNumber(monthlySaving);
  return gap === 0 ? 0 : pace > 0 ? Math.ceil(gap / pace) : Infinity;
};
export const calculateSuggestedSaving = (
  income: number,
  availableMonthly: number,
): number => {
  const takeHome = sanitizeNumber(income);
  const available = sanitizeNumber(availableMonthly);
  if (takeHome === 0 || available / takeHome < 0.1) return 0;
  return takeHome * (available / takeHome > 0.2 ? 0.15 : 0.1);
};
export const calculateHousingRatio = (
  monthlyCosts: number,
  income: number,
): number =>
  sanitizeNumber(income) > 0
    ? sanitizeAggregate(monthlyCosts) / sanitizeNumber(income)
    : 1;
export const isWithinComfortRule = (ratio: number): boolean => ratio <= 0.3;

type Guideline = {
  min?: number;
  max?: number;
};

export type GuidelineStatus = "below" | "within" | "above";

export const calculateBudgetRatio = (amount: number, income: number): number =>
  calculateHousingRatio(amount, income);

export const getGuidelineStatus = (
  ratio: number,
  guideline: Guideline,
): GuidelineStatus => {
  if (guideline.min !== undefined && ratio < guideline.min) return "below";
  if (guideline.max !== undefined && ratio > guideline.max) return "above";
  return "within";
};

export const evaluateGuideline = (
  amount: number,
  income: number,
  guideline: Guideline,
) => {
  const ratio = calculateBudgetRatio(amount, income);
  return {
    ratio,
    percentage: Math.round(ratio * 100),
    status: getGuidelineStatus(ratio, guideline),
  };
};

export type EssentialCostPosition =
  | "comfortable"
  | "manageable"
  | "constrained"
  | "vulnerable"
  | "little-flexibility"
  | "fragile"
  | "structurally-unaffordable";

export const getEssentialCostPosition = (
  ratio: number,
): EssentialCostPosition =>
  ratio >= 1
    ? "structurally-unaffordable"
    : ratio > 0.9
      ? "fragile"
      : ratio > 0.8
        ? "little-flexibility"
        : ratio > 0.7
          ? "vulnerable"
          : ratio > 0.6
            ? "constrained"
            : ratio > 0.5
              ? "manageable"
              : "comfortable";
