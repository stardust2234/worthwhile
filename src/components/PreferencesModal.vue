<script setup lang="ts">
import DialogShell from "./DialogShell.vue";
import NumericField from "./NumericField.vue";
const emit = defineEmits<{
  (e: "close"): void;
  (e: "save"): void;
  (
    e:
      | "update:income"
      | "update:rent"
      | "update:utilities"
      | "update:transport"
      | "update:food"
      | "update:debtPayments"
      | "update:monthlySaving"
      | "update:monthlyCommitments"
      | "update:saved",
    value: number,
  ): void;
}>();
defineProps<{
  open: boolean;
  income: number;
  rent: number;
  utilities: number;
  transport: number;
  food: number;
  debtPayments: number;
  monthlySaving: number;
  monthlyCommitments: number;
  saved: number;
}>();
</script>
<template>
  <DialogShell
    :open="open"
    close-label="Close preferences"
    aria-labelledby="preferences-title"
    panel-class="form-fields"
    @close="emit('close')"
  >
    <p class="eyebrow">YOUR DEFAULTS</p>
    <h2 id="preferences-title">Preferences</h2>
    <p class="dialog-copy">Set the figures used across every calculator.</p>
    <NumericField
      id="preference-income"
      label="Monthly take-home income"
      :value="income"
      suffix="£"
      @update:value="emit('update:income', $event)"
    /><NumericField
      id="preference-rent"
      label="Rent"
      :value="rent"
      suffix="£"
      @update:value="emit('update:rent', $event)"
    /><NumericField
      id="preference-utilities"
      label="Utilities"
      :value="utilities"
      suffix="£"
      @update:value="emit('update:utilities', $event)"
    /><NumericField
      id="preference-debt"
      label="Debt payments"
      :value="debtPayments"
      suffix="£"
      @update:value="emit('update:debtPayments', $event)"
    /><NumericField
      id="preference-transport"
      label="Transport"
      :value="transport"
      suffix="£"
      @update:value="emit('update:transport', $event)"
    /><NumericField
      id="preference-food"
      label="Food"
      :value="food"
      suffix="£"
      @update:value="emit('update:food', $event)"
    /><NumericField
      id="preference-saving"
      label="Monthly saving pace"
      :value="monthlySaving"
      suffix="£"
      @update:value="emit('update:monthlySaving', $event)"
    /><NumericField
      id="preference-commitments"
      label="Other commitments"
      :value="monthlyCommitments"
      suffix="£"
      @update:value="emit('update:monthlyCommitments', $event)"
    /><NumericField
      id="preference-saved"
      label="Already saved"
      :value="saved"
      suffix="£"
      @update:value="emit('update:saved', $event)"
    /><button class="save" @click="emit('save')">Save preferences</button>
  </DialogShell>
</template>
