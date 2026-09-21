<script setup lang="ts">
import { computed } from "vue";
import { ShieldCheck } from "lucide-vue-next";
import NumericField from "../NumericField.vue";
const props = defineProps<{
  essentials: number;
  saved: number;
  monthlySaving: number;
  availableMonthly: number;
  suggestedSaving: number;
  suggestedSavingRate: number;
  savingIsPossible: boolean;
  savingIsRealistic: boolean;
  formatCurrency: (value: number) => string;
}>();
const emit = defineEmits<{
  (e: "update:saved" | "update:monthlySaving", value: number): void;
}>();
const essentialSpendDisplay = computed(() => props.essentials.toFixed(2));
</script>
<template>
  <div class="heading">
    <div>
      <h2><ShieldCheck :size="20" /> Build a 6-month safety net</h2>
      <p>Build a buffer for the unexpected.</p>
    </div>
  </div>
  <NumericField
    id="essential-spend"
    label="Essential monthly spend"
    :value="essentialSpendDisplay"
    suffix="£"
    readonly
  />
  <small class="field-help"
    >Automatically calculated from your preferences.</small
  >
  <NumericField
    id="saved-amount"
    label="Already saved"
    :value="saved"
    suffix="£"
    @update:value="emit('update:saved', $event)"
  />
  <NumericField
    id="monthly-saving"
    label="Monthly saving pace"
    :value="monthlySaving"
    suffix="£"
    @update:value="emit('update:monthlySaving', $event)"
  />
  <div :class="['saving-check', { realistic: props.savingIsRealistic }]">
    <b>{{
      !props.savingIsPossible
        ? "Saving is not currently possible"
        : props.savingIsRealistic
          ? "Looks realistic"
          : "This saving pace needs adjusting"
    }}</b>
    <small>{{
      !props.savingIsPossible
        ? "Less than 10% of take-home income remains after listed monthly costs."
        : `You have ${props.formatCurrency(props.availableMonthly)} left after listed monthly costs. Suggested saving: ${props.formatCurrency(props.suggestedSaving)} per month (${props.suggestedSavingRate}%).`
    }}</small>
  </div>
</template>
