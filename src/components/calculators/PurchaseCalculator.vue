<script setup lang="ts">
import { HandCoins } from "lucide-vue-next";
import NumericField from "../NumericField.vue";

defineProps<{
  purchaseType: "finance" | "cash";
  price: number;
  deposit: number;
  term: number;
  rate: number;
}>();

const emit = defineEmits<{
  (e: "update:purchaseType", value: "finance" | "cash"): void;
  (
    e: "update:price" | "update:deposit" | "update:term" | "update:rate",
    value: number,
  ): void;
}>();
</script>

<template>
  <div class="heading">
    <div>
      <h2><HandCoins :size="20" /> Can I afford this?</h2>
      <p>See how this purchase fits into your monthly life.</p>
    </div>
  </div>
  <div class="choice">
    <button
      :class="{ chosen: purchaseType === 'finance' }"
      @click="emit('update:purchaseType', 'finance')"
    >
      Finance
    </button>
    <button
      :class="{ chosen: purchaseType === 'cash' }"
      @click="emit('update:purchaseType', 'cash')"
    >
      Pay cash
    </button>
  </div>
  <NumericField
    id="purchase-price"
    label="Purchase price"
    :value="price"
    suffix="£"
    @update:value="emit('update:price', $event)"
  />
  <div v-if="purchaseType === 'finance'" class="two">
    <NumericField
      id="purchase-deposit"
      label="Deposit"
      :value="deposit"
      suffix="£"
      @update:value="emit('update:deposit', $event)"
    />
    <label for="purchase-term"
      >Term<select
        id="purchase-term"
        :value="term"
        @change="
          emit(
            'update:term',
            Number(($event.target as HTMLSelectElement).value),
          )
        "
      >
        <option :value="12">1 year</option>
        <option :value="24">2 years</option>
        <option :value="36">3 years</option>
        <option :value="48">4 years</option>
        <option :value="60">5 years</option>
      </select>
    </label>
  </div>
  <NumericField
    v-if="purchaseType === 'finance'"
    id="purchase-rate"
    label="Estimated interest rate"
    :value="rate"
    :step="0.1"
    :max="100"
    suffix="%"
    @update:value="emit('update:rate', $event)"
  />
</template>
