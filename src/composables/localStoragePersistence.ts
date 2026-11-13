import {
  deserializePlanRecord,
  migratePlanRecord,
} from "./planPersistenceRecord";
import type { PlanPersistencePort } from "../types/plan";

export const createLocalStoragePersistence = (
  storageKey: string,
  storage: Storage = localStorage,
): PlanPersistencePort => ({
  load: () => {
    const stored = storage.getItem(storageKey);
    if (!stored) return null;
    const record = deserializePlanRecord(JSON.parse(stored));
    return record ? migratePlanRecord(record) : null;
  },
  save: (record) => storage.setItem(storageKey, JSON.stringify(record)),
  clear: () => storage.removeItem(storageKey),
});
