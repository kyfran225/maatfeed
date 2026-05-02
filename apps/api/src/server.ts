import { createServer } from "node:http";
import { loadEnv } from "./bootstrap/loadEnv.js";

loadEnv();

import { connectServices } from "./bootstrap/connectServices.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { createApp } from "./app.js";
import { createDiscussionTypingServer } from "./realtime/discussionTypingServer.js";

async function startServer() {
  await connectServices();

  const app = createApp();
  const server = createServer(app);
  const discussionTypingServer = createDiscussionTypingServer();

  server.on("upgrade", (request, socket, head) => {
    const handled = discussionTypingServer.handleUpgrade(request, socket, head);

    if (!handled) {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.destroy();
    }
  });

  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "MAAT API listening");
  });
}

startServer().catch((error) => {
  logger.error({ err: error }, "Failed to start MAAT API");
  process.exit(1);
});
