<script setup lang="ts">
import CalculatorTabs from "./CalculatorTabs.vue";
import ResultsPage from "./results/ResultsPage.vue";
import AffordabilityResult from "./results/AffordabilityResult.vue";
import NumericField from "./NumericField.vue";
import PurchaseCalculator from "./calculators/PurchaseCalculator.vue";
import MoveCalculator from "./calculators/MoveCalculator.vue";
import SafetyCalculator from "./calculators/SafetyCalculator.vue";
import type { WorkspaceController } from "../composables/workspaceContract";

const props = defineProps<{ controller: WorkspaceController }>();
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
  essentials,
  saved,
  monthlySaving,
  extraCosts,
  affordabilityDisplay,
  calculatedResults,
  availableMonthly,
  suggestedSaving,
  suggestedSavingRate,
  savingIsPossible,
  savingIsRealistic,
  fmt,
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
  setMonthlySaving,
  setSaved,
  addCost,
  removeCost,
  setExtraCostName,
  setExtraCostAmount,
  savePlan,
  selectCalculator,
} = props.controller;
</script>

<template>
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
        <section class="card inputs form-fields">
          <NumericField
            id="monthly-income"
            label="Monthly take-home income"
            :value="income"
            suffix="£"
            @update:value="setIncome"
          /><PurchaseCalculator
            v-if="mode === 'purchase'"
            :purchase-type="purchaseType"
            :price="price"
            :deposit="deposit"
            :term="term"
            :rate="rate"
            @update:price="setPrice"
            @update:deposit="setDeposit"
            @update:term="setTerm"
            @update:rate="setRate"
            @update:purchase-type="setPurchaseType"
          /><MoveCalculator
            v-else-if="mode === 'move'"
            :rent="rent"
            :moving="moving"
            :furnishings="furnishings"
            :utilities="utilities"
            @update:rent="setRent"
            @update:moving="setMoving"
            @update:furnishings="setFurnishings"
            @update:utilities="setUtilities"
          /><SafetyCalculator
            v-else
            :essentials="essentials"
            :saved="saved"
            :monthly-saving="monthlySaving"
            @update:saved="setSaved"
            @update:monthly-saving="setMonthlySaving"
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
              :value="cost.name"
              :aria-label="`${cost.name} name`"
              @input="
                setExtraCostName(
                  cost.id,
                  ($event.target as HTMLInputElement).value,
                )
              "
            /><input
              :value="cost.amount"
              type="number"
              min="0"
              aria-label="Monthly cost amount"
              @input="
                setExtraCostAmount(
                  cost.id,
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
      @back="selectCalculator(mode)"
    />
  </div>
</template>
