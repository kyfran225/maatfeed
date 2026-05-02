import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();

async function main() {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error("REDIS_URL is required.");
  }

  const redis = new Redis(redisUrl);
  const patterns = ["feed:global:v1", "feed:user:*", "feed:session:*", "trends:viral:v1"];
  let deletedKeys = 0;

  for (const pattern of patterns) {
    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      deletedKeys += await redis.del(...keys);
    }
  }

  await redis.quit();

  console.log(
    JSON.stringify(
      {
        status: "ok",
        deletedKeys
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
