import { onMounted, ref, watch, type Ref } from "vue";
import { serializePlanRecord } from "./planPersistenceCodec";
import { normalizePlanRecord } from "./planStateNormalization";
import { readPlanState, restorePlanState } from "./planStateRecordMapper";
import type { AppView, PlanPersistencePort } from "../types/plan";
import type { FinancialStateRefs } from "./useFinancialState";

export function usePersistence(
  port: PlanPersistencePort,
  state: FinancialStateRefs,
  view: Ref<AppView>,
  notify: (message: string) => void,
) {
  const skipNextSave = ref(false);
  const defaults = serializePlanRecord(readPlanState(state), view.value);
  const snapshot = () => serializePlanRecord(readPlanState(state), view.value);
  const restore = (record: Parameters<typeof normalizePlanRecord>[0]) => {
    restorePlanState(normalizePlanRecord(record, defaults), state, view);
  };
  const save = (message = "Plan saved on this device.") => {
    try {
      port.save(snapshot());
      notify(message);
    } catch {
      notify("Could not save on this device.");
    }
  };
  const clear = () => {
    try {
      port.clear();
      skipNextSave.value = true;
      restore(defaults);
      setTimeout(() => port.clear(), 0);
      notify("Saved data cleared from this device.");
    } catch {
      notify("Could not clear saved data.");
    }
  };
  onMounted(() => {
    try {
      const record = port.load();
      if (record) restore(record);
    } catch {
      notify("Saved data could not be loaded.");
    }
  });
  watch(
    [...Object.values(state), view],
    () => {
      if (skipNextSave.value) {
        skipNextSave.value = false;
        return;
      }
      try {
        port.save(snapshot());
      } catch {
        // Saving is retried on the next state change or explicit save.
      }
    },
    { deep: true },
  );
  return { save, clear };
}
