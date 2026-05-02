import mongoose from "mongoose";
import { syncConfiguredAudioSources } from "../../apps/api/src/services/audioCatalogSyncService.js";

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/maat_feed");
    const result = await syncConfiguredAudioSources();
    console.log("Audio sources synchronized:", result);
  } catch (error) {
    console.error("Audio source sync failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
