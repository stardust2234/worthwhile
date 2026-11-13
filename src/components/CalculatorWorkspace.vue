<script setup lang="ts">
import { toRefs } from "vue";
import CalculatorTabs from "./CalculatorTabs.vue";
import ResultsPage from "./results/ResultsPage.vue";
import AffordabilityResult from "./results/AffordabilityResult.vue";
import NumericField from "./NumericField.vue";
import PurchaseCalculator from "./calculators/PurchaseCalculator.vue";
import MoveCalculator from "./calculators/MoveCalculator.vue";
import SafetyCalculator from "./calculators/SafetyCalculator.vue";
import type {
  WorkspaceCommands,
  WorkspaceState,
} from "../composables/workspaceContract";
import type { PlanMetrics } from "../domain/financialResults";
import type { FinancialResults } from "../types/financial";
import type { AffordabilityDisplayState } from "../viewModels/affordabilityDisplay";

const props = defineProps<{
  state: WorkspaceState;
  metrics: PlanMetrics;
  affordabilityDisplay: AffordabilityDisplayState;
  calculatedResults: FinancialResults;
  commands: WorkspaceCommands;
}>();
const { state, metrics, affordabilityDisplay, calculatedResults, commands } =
  toRefs(props);
</script>

<template>
  <CalculatorTabs
    :model-value="state.view === 'results' ? 'results' : state.mode"
    @update:model-value="commands.selectCalculator"
  />
  <div
    id="calculator-panel"
    role="tabpanel"
    :aria-labelledby="`calculator-tab-${state.view === 'results' ? 'results' : state.mode}`"
    tabindex="0"
  >
    <template v-if="state.view === 'calculators'"
      ><div class="grid">
        <section class="card inputs form-fields">
          <NumericField
            id="monthly-income"
            label="Monthly take-home income"
            :value="state.income"
            suffix="£"
            @update:value="commands.setIncome"
          /><PurchaseCalculator
            v-if="state.mode === 'purchase'"
            :purchase-type="state.purchaseType"
            :price="state.price"
            :deposit="state.deposit"
            :term="state.term"
            :rate="state.rate"
            @update:price="commands.setPrice"
            @update:deposit="commands.setDeposit"
            @update:term="commands.setTerm"
            @update:rate="commands.setRate"
            @update:purchase-type="commands.setPurchaseType"
          /><MoveCalculator
            v-else-if="state.mode === 'move'"
            :rent="state.rent"
            :moving="state.moving"
            :furnishings="state.furnishings"
            :utilities="state.utilities"
            @update:rent="commands.setRent"
            @update:moving="commands.setMoving"
            @update:furnishings="commands.setFurnishings"
            @update:utilities="commands.setUtilities"
          /><SafetyCalculator
            v-else
            :essentials="metrics.essentials"
            :saved="state.saved"
            :monthly-saving="state.monthlySaving"
            @update:saved="commands.setSaved"
            @update:monthly-saving="commands.setMonthlySaving"
            :available-monthly="metrics.availableMonthly"
            :suggested-saving="metrics.suggestedSaving"
            :suggested-saving-rate="metrics.suggestedSavingRate"
            :saving-is-possible="metrics.savingIsPossible"
            :saving-is-realistic="metrics.savingIsRealistic"
            :format-currency="commands.formatCurrency"
          /><button
            v-if="state.mode !== 'safety'"
            class="add"
            @click="commands.addCost"
          >
            ＋ Add another cost
          </button>
          <div
            v-for="cost in state.extraCosts"
            :key="cost.id"
            class="extra-cost"
          >
            <input
              :value="cost.name"
              :aria-label="`${cost.name} name`"
              @input="
                commands.setExtraCostName(
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
                commands.setExtraCostAmount(
                  cost.id,
                  Number(($event.target as HTMLInputElement).value),
                )
              "
            /><button
              class="remove-cost"
              type="button"
              @click="commands.removeCost(cost.id)"
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
          @save="commands.savePlan"
        /></div></template
    ><ResultsPage
      v-else
      :results="calculatedResults"
      @back="commands.selectCalculator(state.mode)"
    />
  </div>
</template>
