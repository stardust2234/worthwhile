<script setup lang="ts">
import AppNavigation from "./components/AppNavigation.vue";
import CalculatorWorkspace from "./components/CalculatorWorkspace.vue";
import PreferencesModal from "./components/PreferencesModal.vue";
import { ShieldCheck } from "lucide-vue-next";
import { useAppController } from "./composables/useAppController";
import { createLocalStoragePersistence } from "./composables/localStoragePersistence";

const app = useAppController(
  createLocalStoragePersistence("worthwhile-calculator-state"),
);
const { state, metrics, affordabilityDisplay, calculatedResults, commands } =
  app;
</script>

<template>
  <div class="shell">
    <main>
      <AppNavigation
        :preferences-open="state.preferencesOpen"
        @open-preferences="commands.openPreferences"
        @show-notice="commands.showNotice"
        @clear-saved-data="commands.clearSavedData"
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
        :open="state.preferencesOpen"
        :income="state.income"
        :rent="state.rent"
        :utilities="state.utilities"
        :transport="state.transport"
        :food="state.food"
        :debt-payments="state.debtPayments"
        :monthly-saving="state.monthlySaving"
        :monthly-commitments="state.monthlyCommitments"
        :saved="state.saved"
        @close="commands.closePreferences"
        @save="commands.savePreferences"
        @update:income="commands.setIncome"
        @update:rent="commands.setRent"
        @update:utilities="commands.setUtilities"
        @update:transport="commands.setTransport"
        @update:food="commands.setFood"
        @update:debt-payments="commands.setDebtPayments"
        @update:monthly-saving="commands.setMonthlySaving"
        @update:monthly-commitments="commands.setMonthlyCommitments"
        @update:saved="commands.setSaved"
      />
      <div
        v-if="state.notice"
        class="notice"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ state.notice }}
      </div>
      <CalculatorWorkspace
        :state="state"
        :metrics="metrics"
        :affordability-display="affordabilityDisplay"
        :calculated-results="calculatedResults"
        :commands="commands"
      />
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
