import { createSyncQueue } from "./care-core";
import { queueStore } from "./queue-store";
export { queueStorageDescription } from "./queue-store";
export const writeQueue = createSyncQueue(queueStore);
