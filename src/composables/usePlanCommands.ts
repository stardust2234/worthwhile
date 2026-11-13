import type { Ref } from "vue";
import {
  sanitizeNumber,
  sanitizeRate,
  sanitizeTermMonths,
} from "../calculations";
import type { AppView, CalculatorMode, PurchaseType } from "../types/plan";
import type { FinancialStateRefs } from "./useFinancialState";

type PersistenceCommands = {
  save(): void;
  clear(): void;
};

export function usePlanCommands(
  state: FinancialStateRefs,
  view: Ref<AppView>,
  persistence: PersistenceCommands,
) {
  const numericSetter = (target: Ref<number>) => (value: number) => {
    target.value = sanitizeNumber(value);
  };
  const setIncome = numericSetter(state.income);
  const setPrice = numericSetter(state.price);
  const setDeposit = numericSetter(state.deposit);
  const setRate = (value: number) => {
    state.rate.value = sanitizeRate(value);
  };
  const setPurchaseType = (value: PurchaseType) => {
    state.purchaseType.value = value;
  };
  const setRent = numericSetter(state.rent);
  const setMoving = numericSetter(state.moving);
  const setFurnishings = numericSetter(state.furnishings);
  const setUtilities = numericSetter(state.utilities);
  const setTransport = numericSetter(state.transport);
  const setFood = numericSetter(state.food);
  const setDebtPayments = numericSetter(state.debtPayments);
  const setMonthlySaving = numericSetter(state.monthlySaving);
  const setMonthlyCommitments = numericSetter(state.monthlyCommitments);
  const setSaved = numericSetter(state.saved);
  const setTerm = (value: number) => {
    state.term.value = sanitizeTermMonths(value);
  };
  const addCost = () =>
    state.extraCosts.value.push({
      id: Date.now(),
      name: "New monthly cost",
      amount: 0,
    });
  const removeCost = (id: number) =>
    (state.extraCosts.value = state.extraCosts.value.filter(
      (cost) => cost.id !== id,
    ));
  const setExtraCostAmount = (id: number, value: number) => {
    const cost = state.extraCosts.value.find((item) => item.id === id);
    if (cost) cost.amount = sanitizeNumber(value);
  };
  const setExtraCostName = (id: number, value: string) => {
    const cost = state.extraCosts.value.find((item) => item.id === id);
    if (cost) cost.name = value;
  };
  const savePlan = () => persistence.save();
  const clearSavedData = () => persistence.clear();
  const selectCalculator = (next: CalculatorMode | "results") => {
    if (next === "results") {
      view.value = "results";
      return;
    }
    state.mode.value = next;
    view.value = "calculators";
  };

  return {
    setIncome,
    setPrice,
    setDeposit,
    setRate,
    setTerm,
    setPurchaseType,
    setRent,
    setMoving,
    setFurnishings,
    setUtilities,
    setTransport,
    setFood,
    setDebtPayments,
    setMonthlySaving,
    setMonthlyCommitments,
    setSaved,
    addCost,
    removeCost,
    setExtraCostName,
    setExtraCostAmount,
    savePlan,
    clearSavedData,
    selectCalculator,
  };
}
