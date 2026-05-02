import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

async function main() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/maat-feed";
  
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  if (!db) {
    console.error("Failed to get database connection");
    process.exit(1);
  }

  // Check for duplicates in Content collection
  console.log("\n--- Checking Content collection for duplicates ---");
  
  const duplicates = await db.collection("contents").aggregate([
    {
      $group: {
        _id: { sourceProvider: "$sourceProvider", externalId: "$externalId" },
        count: { $sum: 1 },
        ids: { $push: "$_id" }
      }
    },
    {
      $match: {
        count: { $gt: 1 }
      }
    }
  ]).toArray();

  if (duplicates.length === 0) {
    console.log("✅ No duplicates found in Content collection");
  } else {
    console.log(`⚠️ Found ${duplicates.length} duplicate groups:`);
    for (const dup of duplicates) {
      console.log(`  - ${dup._id.sourceProvider}/${dup._id.externalId}: ${dup.count} duplicates`);
      console.log(`    IDs: ${dup.ids.join(", ")}`);
    }
  }

  // Check total counts
  const totalContent = await db.collection("contents").countDocuments();
  const publishedContent = await db.collection("contents").countDocuments({ processingStatus: "published" });
  const classifiedContent = await db.collection("contents").countDocuments({ 
    processingStatus: { $in: ["classified", "enriched", "published"] }
  });

  console.log("\n--- Content Statistics ---");
  console.log(`Total content: ${totalContent}`);
  console.log(`Published: ${publishedContent}`);
  console.log(`Ready for feed: ${classifiedContent}`);

  // Check classifications
  const totalClassifications = await db.collection("contentclassifications").countDocuments();
  console.log(`\nTotal classifications: ${totalClassifications}`);

  await mongoose.disconnect();
  console.log("\nDisconnected from MongoDB");
}

main().catch(console.error);
