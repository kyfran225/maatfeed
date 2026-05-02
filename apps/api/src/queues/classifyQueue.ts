import { createQueue } from "./queueFactory.js";
import { QUEUE_NAMES } from "./queueNames.js";

export const classifyQueue = createQueue(QUEUE_NAMES.classify);
