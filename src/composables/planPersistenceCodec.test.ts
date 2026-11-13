import { describe, expect, it } from "vitest";
import {
  deserializePlanRecord,
  migratePlanRecord,
  serializePlanRecord,
} from "./planPersistenceCodec";
import { PLAN_SCHEMA_VERSION } from "../types/plan";

describe("plan persistence codec", () => {
  it("writes the current schema version", () => {
    const record = serializePlanRecord(
      {
        mode: "purchase",
        purchaseType: "finance",
        income: 3000,
        price: 100000,
        deposit: 10000,
        term: 60,
        rate: 5,
        rent: 900,
        moving: 0,
        furnishings: 0,
        utilities: 150,
        transport: 100,
        food: 300,
        monthlyCommitments: 0,
        debtPayments: 0,
        saved: 5000,
        monthlySaving: 200,
        extraCosts: [],
      },
      "calculators",
    );

    expect(record.schemaVersion).toBe(PLAN_SCHEMA_VERSION);
  });

  it("migrates an unversioned legacy record", () => {
    const record = migratePlanRecord({ income: 3000 });

    expect(record?.schemaVersion).toBe(PLAN_SCHEMA_VERSION);
    expect(record?.income).toBe(3000);
  });

  it("rejects records from unsupported future versions", () => {
    const record = deserializePlanRecord({ schemaVersion: 99, income: 3000 });

    expect(record).toBeNull();
  });
});
