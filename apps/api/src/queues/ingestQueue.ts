import { createQueue } from "./queueFactory.js";
import { QUEUE_NAMES } from "./queueNames.js";

export const ingestQueue = createQueue(QUEUE_NAMES.ingest);
