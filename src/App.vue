<script setup lang="ts">
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type Ref,
} from "vue";
import {
  AppHeader,
  CalculatorTabs,
  PreferencesModal,
  ResultsPage,
  AffordabilityResult,
} from "./components";
import PurchaseCalculator from "./components/calculators/PurchaseCalculator.vue";
import MoveCalculator from "./components/calculators/MoveCalculator.vue";
import SafetyCalculator from "./components/calculators/SafetyCalculator.vue";
import { ShieldCheck } from "lucide-vue-next";
import {
  useFinancialState,
  type CalculatorMode,
} from "./composables/useFinancialState";
import { useCalculations } from "./composables/useCalculations";
import { usePersistence } from "./composables/usePersistence";
import {
  sanitizeNumber,
  sanitizeRate,
  sanitizeTermMonths,
} from "./calculations";
const {
  mode,
  view,
  purchaseType,
  income,
  price,
  deposit,
  term,
  rate,
  rent,
  moving,
  furnishings,
  utilities,
  transport,
  food,
  monthlyCommitments,
  debtPayments,
  essentials,
  saved,
  monthlySaving,
  extraCosts,
} = useFinancialState();
const preferencesOpen = ref(false),
  menuOpen = ref(false),
  notice = ref("");
const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".menu-panel, .menu-button")) {
    menuOpen.value = false;
  }
};
onMounted(() => document.addEventListener("click", handleDocumentClick));
onBeforeUnmount(() =>
  document.removeEventListener("click", handleDocumentClick),
);
watch(
  [rent, utilities, transport, food, debtPayments, monthlyCommitments],
  () => {
    essentials.value =
      sanitizeNumber(rent.value) +
      sanitizeNumber(utilities.value) +
      sanitizeNumber(transport.value) +
      sanitizeNumber(food.value) +
      sanitizeNumber(debtPayments.value) +
      sanitizeNumber(monthlyCommitments.value);
  },
  { immediate: true },
);
const {
  housingRatio,
  comfortRatio,
  housingCost,
  monthlyPayment,
  interestCost,
  fullPurchasePrice,
  moveTotal,
  emergencyTarget,
  cashAvailable,
  disposableMargin,
  cashPurchaseMonths,
  cashAmountStillNeeded,
  emergencyGap,
  emergencyMonths,
  effectiveMonthlySaving,
  ratio,
  debtRepaymentRatio,
  score,
  verdict,
  formatCurrency: fmt,
  isWithinComfortRule,
  results: calculatedResults,
} = useCalculations({
  mode,
  purchaseType,
  income,
  price,
  deposit,
  term,
  rate,
  rent,
  moving,
  furnishings,
  utilities,
  transport,
  food,
  monthlyCommitments,
  debtPayments,
  essentials,
  saved,
  monthlySaving,
  extraCosts,
});
const storageKey = "worthwhile-calculator-state",
  persistedValues = {
    mode,
    view,
    purchaseType,
    price,
    deposit,
    term,
    rate,
    income,
    rent,
    utilities,
    transport,
    food,
    monthlyCommitments,
    debtPayments,
    saved,
    monthlySaving,
    moving,
    furnishings,
  };
const showNotice = (message: string) => {
    notice.value = message;
    setTimeout(() => (notice.value = ""), 4000);
  },
  menuButton = ref<HTMLElement | null>(null),
  closePreferences = () => {
    preferencesOpen.value = false;
    void nextTick(() => menuButton.value?.focus());
  },
  numericSetter = (target: Ref<number>) => (value: number) => {
    target.value = sanitizeNumber(value);
  },
  setIncome = numericSetter(income),
  setPrice = numericSetter(price),
  setDeposit = numericSetter(deposit),
  setRent = numericSetter(rent),
  setMoving = numericSetter(moving),
  setFurnishings = numericSetter(furnishings),
  setUtilities = numericSetter(utilities),
  setSaved = numericSetter(saved),
  setMonthlySaving = numericSetter(monthlySaving),
  setTerm = (value: number) => {
    term.value = sanitizeTermMonths(value);
  },
  persistence = usePersistence(
    storageKey,
    persistedValues,
    extraCosts,
    showNotice,
  ),
  addCost = () =>
    extraCosts.value.push({
      id: Date.now(),
      name: "New monthly cost",
      amount: 0,
    }),
  removeCost = (id: number) =>
    (extraCosts.value = extraCosts.value.filter((cost) => cost.id !== id)),
  savePlan = () => persistence.save(),
  clearSavedData = () => persistence.clear();
const selectCalculator = (next: CalculatorMode | "results") => {
  if (next === "results") {
    view.value = "results";
    menuOpen.value = false;
    return;
  }
  mode.value = next;
  view.value = "calculators";
};
</script>
<template>
  <div class="shell">
    <main>
      <div class="top-bar">
        <div class="app-brand">
          <span><ShieldCheck :size="17" /></span>worthwhile
        </div>
        <AppHeader />
        <button
          class="menu-button"
          ref="menuButton"
          type="button"
          aria-label="Open menu"
          :aria-expanded="menuOpen"
          @click="menuOpen = !menuOpen"
        >
          <span class="menu-icon" aria-hidden="true">☰</span>
        </button>
        <div v-if="menuOpen" class="menu-panel">
          <button
            @click="
              preferencesOpen = true;
              menuOpen = false;
            "
          >
            Preferences
          </button>
          <button
            @click="
              showNotice(
                'Enter your numbers in any calculator, then review Results.',
              );
              menuOpen = false;
            "
          >
            How it works
          </button>
          <button
            @click="
              clearSavedData();
              menuOpen = false;
            "
          >
            Clear saved data
          </button>
        </div>
      </div>
      <PreferencesModal
        :open="preferencesOpen"
        :income="income"
        :rent="rent"
        :utilities="utilities"
        :transport="transport"
        :food="food"
        :debt-payments="debtPayments"
        :monthly-saving="monthlySaving"
        :monthly-commitments="monthlyCommitments"
        :saved="saved"
        @close="closePreferences"
        @save="
          closePreferences();
          showNotice('Preferences saved on this device.');
        "
        @update:income="income = sanitizeNumber($event)"
        @update:rent="rent = sanitizeNumber($event)"
        @update:utilities="utilities = sanitizeNumber($event)"
        @update:transport="transport = sanitizeNumber($event)"
        @update:food="food = sanitizeNumber($event)"
        @update:debt-payments="debtPayments = sanitizeNumber($event)"
        @update:monthly-saving="monthlySaving = sanitizeNumber($event)"
        @update:monthly-commitments="
          monthlyCommitments = sanitizeNumber($event)
        "
        @update:saved="saved = sanitizeNumber($event)"
      />
      <div v-if="notice" class="notice" role="status">{{ notice }} ×</div>
      <CalculatorTabs
        :model-value="view === 'results' ? 'results' : mode"
        @update:model-value="selectCalculator"
      />
      <div
        id="calculator-panel"
        role="tabpanel"
        :aria-labelledby="`calculator-tab-${view === 'results' ? 'results' : mode}`"
        tabindex="0"
      >
        <template v-if="view === 'calculators'"
          ><div class="grid">
            <section class="card inputs">
              <label for="monthly-income"
                >Monthly take-home income<input
                  id="monthly-income"
                  :value="income"
                  type="number"
                  min="0"
                  max="1000000000"
                  @input="
                    setIncome(Number(($event.target as HTMLInputElement).value))
                  "
                /><span>£</span></label
              ><PurchaseCalculator
                v-if="mode === 'purchase'"
                v-model:purchase-type="purchaseType"
                :price="price"
                :deposit="deposit"
                :term="term"
                :rate="rate"
                @update:price="setPrice($event)"
                @update:deposit="setDeposit($event)"
                @update:term="setTerm($event)"
                @update:rate="rate = sanitizeRate($event)"
                :cash-available="cashAvailable"
              /><MoveCalculator
                v-else-if="mode === 'move'"
                :rent="rent"
                :moving="moving"
                :furnishings="furnishings"
                :utilities="utilities"
                @update:rent="setRent($event)"
                @update:moving="setMoving($event)"
                @update:furnishings="setFurnishings($event)"
                @update:utilities="setUtilities($event)"
              /><SafetyCalculator
                v-else
                :essentials="essentials"
                :saved="saved"
                :monthly-saving="monthlySaving"
                @update:saved="setSaved($event)"
                @update:monthly-saving="setMonthlySaving($event)"
                :available-monthly="Math.max(0, disposableMargin)"
                :income="income"
              /><button v-if="mode !== 'safety'" class="add" @click="addCost">
                ＋ Add another cost
              </button>
              <div v-for="cost in extraCosts" :key="cost.id" class="extra-cost">
                <input
                  v-model="cost.name"
                  :aria-label="`${cost.name} name`"
                /><input
                  :value="cost.amount"
                  type="number"
                  min="0"
                  aria-label="Monthly cost amount"
                  @input="
                    cost.amount = sanitizeNumber(
                      Number(($event.target as HTMLInputElement).value),
                    )
                  "
                /><button
                  class="remove-cost"
                  type="button"
                  @click="removeCost(cost.id)"
                  :aria-label="`Remove ${cost.name}`"
                >
                  ×
                </button>
              </div>
            </section>
            <AffordabilityResult
              :title="mode === 'safety' ? 'Preparedness plan' : verdict"
              :score="score"
              :copy="
                mode === 'safety'
                  ? `Your target is ${fmt(emergencyTarget)}. You need ${fmt(emergencyGap)} to reach your goal. ${emergencyGap === 0 ? 'Your target is reached.' : emergencyMonths === Infinity ? 'Increase your monthly saving pace to calculate a finish date.' : `At ${fmt(effectiveMonthlySaving)} per month, you have ${emergencyMonths} month${emergencyMonths === 1 ? '' : 's'} to go.`}`
                  : mode === 'purchase' && purchaseType === 'cash'
                    ? cashAmountStillNeeded === 0
                      ? `The full purchase price is ${fmt(fullPurchasePrice)}. It is covered without borrowing.`
                      : cashPurchaseMonths === Infinity
                        ? `The full purchase price is ${fmt(fullPurchasePrice)}. It cannot currently be funded from your available monthly surplus.`
                        : `The full purchase price is ${fmt(fullPurchasePrice)}. At your planned saving pace, you can afford this without borrowing in approximately ${cashPurchaseMonths} month${cashPurchaseMonths === 1 ? '' : 's'} if your current income and essential expenses remain unchanged.`
                    : mode === 'move'
                      ? `Your first-month move-in cost is ${fmt(moveTotal)}. Housing is ${fmt(housingCost)} per month (${Math.round(housingRatio * 100)}% of income); housing and listed commitments together use ${Math.round(ratio * 100)}%.`
                      : `Your estimated monthly purchase payment is ${fmt(monthlyPayment)} per month (${Math.round(housingRatio * 100)}% of take-home income). Debt repayments use ${Math.round(debtRepaymentRatio * 100)}% of take-home income.`
              "
              :primary-label="
                mode === 'safety'
                  ? 'Emergency fund target'
                  : mode === 'purchase' && purchaseType === 'cash'
                    ? 'Starting cash'
                    : mode === 'purchase'
                      ? 'Monthly payment'
                      : 'Monthly rent'
              "
              :primary-value="
                fmt(
                  mode === 'safety'
                    ? emergencyTarget
                    : mode === 'purchase'
                      ? purchaseType === 'cash'
                        ? cashAvailable
                        : monthlyPayment
                      : rent,
                )
              "
              :secondary-label="
                mode === 'purchase' && purchaseType === 'cash'
                  ? 'Time to save'
                  : mode === 'purchase'
                    ? 'Interest cost'
                    : mode === 'safety'
                      ? 'Time to save'
                      : 'Suggested housing max'
              "
              :secondary-value="
                mode === 'purchase' && purchaseType === 'cash'
                  ? cashAmountStillNeeded === 0
                    ? 'Covered this month'
                    : cashPurchaseMonths === Infinity
                      ? 'Not possible'
                      : `${cashPurchaseMonths} month${cashPurchaseMonths === 1 ? '' : 's'}`
                  : mode === 'purchase'
                    ? fmt(interestCost)
                    : mode === 'safety'
                      ? emergencyGap === 0
                        ? 'Target reached'
                        : emergencyMonths === Infinity
                          ? 'Not possible'
                          : `${(emergencyMonths / 12).toFixed(1)} years`
                      : fmt(income * 0.3)
              "
              :rule-title="
                mode === 'safety'
                  ? 'Safety-net plan'
                  : mode === 'purchase'
                    ? 'Within the 20% debt repayment threshold'
                    : 'Under the 30% comfort rule'
              "
              :rule-copy="
                mode === 'safety'
                  ? 'Your saving plan is building toward your emergency fund target.'
                  : mode === 'purchase'
                    ? 'Your purchase debt repayments stay within 20% of take-home income.'
                    : 'Your rent stays within 30% of take-home income.'
              "
              :warning-title="
                mode === 'purchase'
                  ? 'Above the 20% debt repayment threshold'
                  : undefined
              "
              :warning="
                mode === 'purchase' && debtRepaymentRatio > 0.2
                  ? `Debt repayments use ${Math.round(debtRepaymentRatio * 100)}% of take-home income.`
                  : mode === 'move' && !isWithinComfortRule(comfortRatio)
                    ? `Minimum income for rent: ${fmt(rent / 0.3)} / month. Rent currently uses ${Math.round(comfortRatio * 100)}% of take-home income.`
                    : undefined
              "
              @save="savePlan"
            /></div></template
        ><ResultsPage
          v-else
          :results="calculatedResults"
          @back="view = 'calculators'"
        />
      </div>
      <footer>
        <span class="privacy-note"
          ><ShieldCheck :size="14" /> Privacy: your figures are stored only in
          this browser and are not uploaded.</span
        >
        <span class="footer-links">
          <a
            class="ko-fi-button"
            href="https://ko-fi.com/E3P624TYVL"
            target="_blank"
            rel="noopener noreferrer"
          >
            Support me on Ko-fi
          </a>
          <a href="mailto:contact@libranode.dev">Contact me</a>
        </span>
        <span>Built for real life, not perfect spreadsheets.</span>
      </footer>
    </main>
  </div>
</template>
