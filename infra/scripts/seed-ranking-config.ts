import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const configDocument = {
  version: "ranking-v1",
  active: true,
  contentMix: {
    educational: 0.4,
    viral: 0.3,
    deep: 0.3
  },
  weights: {
    likes: 2,
    comments: 4,
    views: 0.05,
    debateScore: 10,
    userInterestMatch: 10
  },
  diversityRules: {
    maxSameSourceInWindow: 2,
    maxSameBucketRun: 2
  },
  updatedAt: new Date()
};

async function main() {
  const mongodbUri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/maat_feed";

  await mongoose.connect(mongodbUri);

  const collection = mongoose.connection.collection("rankingconfigs");

  const result = await collection.updateOne(
    { version: configDocument.version },
    {
      $set: configDocument
    },
    { upsert: true }
  );

  console.log(
    JSON.stringify(
      {
        status: "ok",
        upsertedId: result.upsertedId,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
