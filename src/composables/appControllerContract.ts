import type { ComputedRef } from "vue";
import type { PlanMetrics } from "../domain/financialResults";
import type { AffordabilityDisplayState } from "../viewModels/affordabilityDisplay";
import type { FinancialResults } from "../types/financial";
import type { WorkspaceCommands, WorkspaceState } from "./workspaceProps";

export type AppController = {
  state: WorkspaceState;
  metrics: ComputedRef<PlanMetrics>;
  affordabilityDisplay: ComputedRef<AffordabilityDisplayState>;
  calculatedResults: ComputedRef<FinancialResults>;
  commands: WorkspaceCommands;
};
