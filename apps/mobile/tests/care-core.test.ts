import { describe, it, expect } from "vitest";
import {
  parsePressure,
  createSyncQueue,
  type PendingOperation,
  type QueueStore,
} from "../src/lib/care-core";
import { reminderTimes, zonedTime } from "../src/lib/reminder-core";
describe("pressure confirmation inputs", () => {
  it("converts only unambiguous abbreviations and rejects mixed units", () => {
    expect(parsePressure("11", "7")).toEqual({
      systolic: 110,
      diastolic: 70,
      converted: true,
    });
    expect(parsePressure("110", "70").converted).toBe(false);
    expect(() => parsePressure("11", "70")).toThrow();
    expect(() => parsePressure("", "7")).toThrow();
  });
});
describe("protected queue contract", () => {
  it("keeps the operation UUID after a failed response, retries and isolates accounts", async () => {
    const map = new Map<string, PendingOperation>();
    const store: QueueStore = {
      async read(owner) {
        return [...map.values()].filter((x) => x.owner === owner);
      },
      async put(x) {
        map.set(x.id, x);
      },
      async remove(id) {
        map.delete(id);
      },
    };
    let now = 100;
    const queue = createSyncQueue(store, () => now);
    await queue.enqueue({
      id: "event-1",
      owner: "patient-a",
      path: "/patients/a/readings",
      body: { id: "event-1" },
    });
    const seen: unknown[] = [];
    await queue.sync("patient-a", async (_, body) => {
      seen.push(body);
      throw { status: 0 };
    });
    expect((await queue.read("patient-a"))[0]?.state).toBe("ERROR");
    await queue.sync("patient-b", async () => {
      throw new Error("must never send another account");
    });
    expect((await queue.read("patient-b")).length).toBe(0);
    now = 2000;
    await queue.sync("patient-a", async (_, body) => {
      seen.push(body);
    });
    expect(seen).toEqual([{ id: "event-1" }, { id: "event-1" }]);
    expect(await queue.read("patient-a")).toEqual([]);
  });
  it("does not automatically retry a permanent validation failure", async () => {
    let item: PendingOperation | undefined;
    const queue = createSyncQueue({
      async read() {
        return item ? [item] : [];
      },
      async put(x) {
        item = x;
      },
      async remove() {
        item = undefined;
      },
    });
    await queue.enqueue({ id: "e", owner: "a", path: "/readings", body: {} });
    let calls = 0;
    await queue.sync("a", async () => {
      calls++;
      throw { status: 409 };
    });
    await queue.sync("a", async () => {
      calls++;
    });
    expect(calls).toBe(1);
    expect(item?.state).toBe("ERROR");
  });
});
describe("local reminders", () => {
  it("respects time zone, validity and both reminder times", () => {
    const at = zonedTime("2026-10-16", "08:00", "America/Sao_Paulo");
    expect(new Date(at).toISOString()).toBe("2026-10-16T11:00:00.000Z");
    const list = reminderTimes(
      [
        {
          id: "p",
          name: "Synthetic",
          instruction: "Defined by professional",
          startsOn: "2026-10-16",
          endsOn: "2026-10-16",
          timeZone: "America/Sao_Paulo",
          schedules: ["08:00"],
          version: 1,
          active: true,
        },
      ],
      Date.parse("2026-10-16T10:00:00Z"),
    );
    expect(list.map((x) => new Date(x.date).toISOString())).toEqual([
      "2026-10-16T10:55:00.000Z",
      "2026-10-16T11:00:00.000Z",
    ]);
  });
});
