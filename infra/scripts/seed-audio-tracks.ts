import mongoose from "mongoose";
import { syncConfiguredAudioSources } from "../../apps/api/src/services/audioCatalogSyncService.js";

async function seedAudioTracks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/maat_feed");
    console.log("Connected to MongoDB");

    const result = await syncConfiguredAudioSources();
    console.log("Audio sync completed", result);
  } catch (error) {
    console.error("Error syncing audio data:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seedAudioTracks();
