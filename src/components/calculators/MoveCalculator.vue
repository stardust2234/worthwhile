<script setup lang="ts">
import { Home } from "lucide-vue-next";
import NumericField from "../NumericField.vue";

defineProps<{
  rent: number;
  moving: number;
  furnishings: number;
  utilities: number;
}>();

const emit = defineEmits<{
  (
    e:
      | "update:rent"
      | "update:moving"
      | "update:furnishings"
      | "update:utilities",
    value: number,
  ): void;
}>();
</script>

<template>
  <div class="heading">
    <div>
      <h2><Home :size="20" /> What will moving cost?</h2>
      <p>Plan the upfront and ongoing cost of a new place.</p>
    </div>
  </div>
  <NumericField
    id="monthly-rent"
    label="Monthly rent"
    :value="rent"
    suffix="£"
    @update:value="emit('update:rent', $event)"
  />
  <div class="two">
    <NumericField
      id="moving-costs"
      label="Moving costs"
      :value="moving"
      suffix="£"
      @update:value="emit('update:moving', $event)"
    />
    <NumericField
      id="furniture-setup"
      label="Furniture & setup"
      :value="furnishings"
      suffix="£"
      @update:value="emit('update:furnishings', $event)"
    />
  </div>
  <NumericField
    id="monthly-utilities"
    label="Utilities & other monthly costs"
    :value="utilities"
    suffix="£"
    @update:value="emit('update:utilities', $event)"
  />
</template>
