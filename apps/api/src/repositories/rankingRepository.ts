import { RankingConfigModel } from "../models/RankingConfig.js";

export async function getActiveConfig() {
  return RankingConfigModel.findOne({ active: true }).sort({ updatedAt: -1 });
}

export async function createConfigVersion(configData: any) {
  const latestConfig = await RankingConfigModel.findOne().sort({ version: -1 });
  const nextVersion = (latestConfig?.version || 0) + 1;
  
  // Deactivate all previous configs
  await RankingConfigModel.updateMany({}, { active: false });
  
  // Create new config version
  const newConfig = new RankingConfigModel({
    ...configData,
    version: nextVersion,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  return await newConfig.save();
}

export async function rollbackToVersion(version: number) {
  // Deactivate all configs
  await RankingConfigModel.updateMany({}, { active: false });
  
  // Activate specified version
  await RankingConfigModel.updateOne(
    { version },
    { 
      active: true,
      updatedAt: new Date()
    }
  );
  
  return await RankingConfigModel.findOne({ version });
}

export async function getConfigHistory(limit = 10) {
  return await RankingConfigModel.find()
    .sort({ version: -1 })
    .limit(limit)
    .select('version contentMix scoreWeights recencyDecay active createdAt updatedAt');
}

export async function updateConfigWeights(version: number, weights: any) {
  return await RankingConfigModel.findOneAndUpdate(
    { version },
    { 
      $set: {
        scoreWeights: weights,
        updatedAt: new Date()
      }
    },
    { new: true }
  );
}
