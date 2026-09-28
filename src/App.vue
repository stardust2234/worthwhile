<script setup lang="ts">
import AppNavigation from "./components/AppNavigation.vue";
import CalculatorWorkspace from "./components/CalculatorWorkspace.vue";
import PreferencesModal from "./components/PreferencesModal.vue";
import { ShieldCheck } from "lucide-vue-next";
import { useAppController } from "./composables/useAppController";
import { createLocalStoragePersistence } from "./composables/usePersistence";

const app = useAppController(
  createLocalStoragePersistence("worthwhile-calculator-state"),
);
const {
  preferencesOpen,
  income,
  rent,
  utilities,
  transport,
  food,
  debtPayments,
  monthlySaving,
  monthlyCommitments,
  saved,
  notice,
  setIncome,
  setRent,
  setUtilities,
  setTransport,
  setFood,
  setDebtPayments,
  setMonthlySaving,
  setMonthlyCommitments,
  setSaved,
  closePreferences,
  savePreferences,
} = app;
</script>

<template>
  <div class="shell">
    <main>
      <AppNavigation
        :preferences-open="preferencesOpen"
        @open-preferences="preferencesOpen = true"
        @show-notice="app.showNotice"
        @clear-saved-data="app.clearSavedData"
      />
      <header>
        <div>
          <p class="eyebrow">YOUR MONEY, YOUR CALL</p>
          <h1>Make bigger decisions<br /><em>feel smaller.</em></h1>
          <p class="intro">
            A clear-eyed view of what you can afford, before you commit.
          </p>
        </div>
      </header>
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
        @save="savePreferences"
        @update:income="setIncome"
        @update:rent="setRent"
        @update:utilities="setUtilities"
        @update:transport="setTransport"
        @update:food="setFood"
        @update:debt-payments="setDebtPayments"
        @update:monthly-saving="setMonthlySaving"
        @update:monthly-commitments="setMonthlyCommitments"
        @update:saved="setSaved"
      />
      <div
        v-if="notice"
        class="notice"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ notice }}
      </div>
      <CalculatorWorkspace :controller="app" />
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
