import dotenv from "dotenv";
import mongoose from "mongoose";
import Redis from "ioredis";

dotenv.config();

async function main() {
  const mongodbUri = process.env.MONGODB_URI;
  const redisUrl = process.env.REDIS_URL;

  if (!mongodbUri || !redisUrl) {
    throw new Error("MONGODB_URI and REDIS_URL are required.");
  }

  const redis = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });
  let mongoStatus = "not_ready";
  let redisStatus = "not_ready";

  try {
    await mongoose.connect(mongodbUri);
    mongoStatus = mongoose.connection.readyState === 1 ? "ready" : "not_ready";
  } finally {
    await mongoose.disconnect();
  }

  try {
    await redis.connect();
    await redis.ping();
    redisStatus = "ready";
  } finally {
    await redis.quit();
  }

  const overall = mongoStatus === "ready" && redisStatus === "ready" ? "ready" : "degraded";

  console.log(
    JSON.stringify(
      {
        status: overall,
        checks: {
          mongo: mongoStatus,
          redis: redisStatus
        },
        timestamp: new Date().toISOString()
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
