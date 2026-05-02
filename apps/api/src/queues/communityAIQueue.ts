import { createQueue } from "./queueFactory.js";
import { QUEUE_NAMES } from "./queueNames.js";

export const communityAIQueue = createQueue(QUEUE_NAMES.communityAI);
