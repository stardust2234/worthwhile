<script setup lang="ts">
import {
  computed,
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
import NumericField from "./components/NumericField.vue";
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
import { buildAffordabilityDisplayState } from "./viewModels/affordabilityDisplay";
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
  availableMonthly,
  suggestedSaving,
  suggestedSavingRate,
  savingIsPossible,
  savingIsRealistic,
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
const affordabilityDisplay = computed(() =>
  buildAffordabilityDisplayState({
    mode: mode.value,
    purchaseType: purchaseType.value,
    verdict: verdict.value,
    score: score.value,
    emergencyTarget: emergencyTarget.value,
    emergencyGap: emergencyGap.value,
    emergencyMonths: emergencyMonths.value,
    effectiveMonthlySaving: effectiveMonthlySaving.value,
    fullPurchasePrice: fullPurchasePrice.value,
    cashAmountStillNeeded: cashAmountStillNeeded.value,
    cashPurchaseMonths: cashPurchaseMonths.value,
    moveTotal: moveTotal.value,
    housingCost: housingCost.value,
    housingRatio: housingRatio.value,
    ratio: ratio.value,
    monthlyPayment: monthlyPayment.value,
    debtRepaymentRatio: debtRepaymentRatio.value,
    cashAvailable: cashAvailable.value,
    interestCost: interestCost.value,
    rent: rent.value,
    income: income.value,
    comfortRatio: comfortRatio.value,
    formatCurrency: fmt,
  }),
);
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
              <NumericField
                id="monthly-income"
                label="Monthly take-home income"
                :value="income"
                suffix="£"
                @update:value="setIncome($event)"
              /><PurchaseCalculator
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
                :available-monthly="availableMonthly"
                :suggested-saving="suggestedSaving"
                :suggested-saving-rate="suggestedSavingRate"
                :saving-is-possible="savingIsPossible"
                :saving-is-realistic="savingIsRealistic"
                :format-currency="fmt"
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
              :title="affordabilityDisplay.title"
              :score="affordabilityDisplay.score"
              :copy="affordabilityDisplay.copy"
              :primary-label="affordabilityDisplay.primaryLabel"
              :primary-value="affordabilityDisplay.primaryValue"
              :secondary-label="affordabilityDisplay.secondaryLabel"
              :secondary-value="affordabilityDisplay.secondaryValue"
              :rule-title="affordabilityDisplay.ruleTitle"
              :rule-copy="affordabilityDisplay.ruleCopy"
              :warning-title="affordabilityDisplay.warningTitle"
              :warning="affordabilityDisplay.warning"
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
