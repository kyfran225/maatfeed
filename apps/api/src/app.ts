import cors from "cors";
import express from "express";
import pinoHttp from "pino-http";
import { logger } from "./config/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFound.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: true,
      credentials: true
    })
  );
  app.use(
    express.json({
      limit: "2mb",
      verify: (request, _response, buffer) => {
        (request as any).rawBody = buffer.toString();
      }
    })
  );
  app.use(pinoHttp({ logger }));

  app.use("/api", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
