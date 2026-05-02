import { createQueue } from "./queueFactory.js";
import { QUEUE_NAMES } from "./queueNames.js";

export const enrichQueue = createQueue(QUEUE_NAMES.enrich);
