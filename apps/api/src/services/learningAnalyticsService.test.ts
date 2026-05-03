import test from "node:test";
import assert from "node:assert";
import * as analyticsService from "./learningAnalyticsService.js";
import { UserModel } from "../models/User.js";
import { ContentModel } from "../models/Content.js";
import { AudioTrackModel } from "../models/AudioTrack.js";
import { LearningProgressModel } from "../models/LearningProgress.js";
import { InteractionModel } from "../models/Interaction.js";
import { AudioInteractionModel } from "../models/AudioInteraction.js";

const originalUserCountDocuments = UserModel.countDocuments;
const originalContentCountDocuments = ContentModel.countDocuments;
const originalAudioTrackCountDocuments = AudioTrackModel.countDocuments;
const originalLearningProgressCountDocuments = LearningProgressModel.countDocuments;
const originalLearningProgressAggregate = LearningProgressModel.aggregate;
const originalInteractionCountDocuments = InteractionModel.countDocuments;
const originalAudioInteractionCountDocuments = AudioInteractionModel.countDocuments;
const originalAudioInteractionAggregate = AudioInteractionModel.aggregate;

test.after(() => {
  UserModel.countDocuments = originalUserCountDocuments;
  ContentModel.countDocuments = originalContentCountDocuments;
  AudioTrackModel.countDocuments = originalAudioTrackCountDocuments;
  LearningProgressModel.countDocuments = originalLearningProgressCountDocuments;
  LearningProgressModel.aggregate = originalLearningProgressAggregate;
  InteractionModel.countDocuments = originalInteractionCountDocuments;
  AudioInteractionModel.countDocuments = originalAudioInteractionCountDocuments;
  AudioInteractionModel.aggregate = originalAudioInteractionAggregate;
});

test("getAdminDashboardSummary returns computed dashboard metrics", async () => {
  UserModel.countDocuments = (async (filter: any = {}) => {
    if (!filter || Object.keys(filter).length === 0) {
      return 10;
    }

    if (filter.trustLevel) {
      return 4;
    }

    if (filter.createdAt && filter.updatedAt) {
      return 8;
    }

    if (filter.createdAt) {
      return 10;
    }

    return 0;
  }) as any;

  ContentModel.countDocuments = (async () => 12) as any;
  AudioTrackModel.countDocuments = (async () => 5) as any;
  LearningProgressModel.countDocuments = (async (filter: any = {}) => {
    if (filter.status === "review") {
      return 7;
    }
    if (filter.nextReviewAt) {
      return 4;
    }
    if (filter.status && filter.status.$in) {
      return 30;
    }
    return 0;
  }) as any;

  LearningProgressModel.aggregate = (async () => [{ avgReplayCount: 2.5 }]) as any;
  InteractionModel.countDocuments = (async (filter: any = {}) => {
    if (filter.actionType === "correction" && filter.engagedWith === true) {
      return 28;
    }
    if (filter.actionType === "correction") {
      return 40;
    }
    return 0;
  }) as any;

  AudioInteractionModel.countDocuments = (async (filter: any = {}) => {
    if (filter.interactionType === "complete") {
      return 15;
    }
    if (filter.interactionType === "play") {
      return 20;
    }
    return 0;
  }) as any;

  AudioInteractionModel.aggregate = (async () => [{ avgDuration: 120000 }]) as any;

  const dashboard = await analyticsService.getAdminDashboardSummary();

  assert.equal(dashboard.totals.users, 10);
  assert.equal(dashboard.totals.verifiedUsers, 4);
  assert.equal(dashboard.totals.contentItems, 12);
  assert.equal(dashboard.totals.audioTracks, 5);
  assert.equal(dashboard.reviewMetrics.contentInReview, 7);
  assert.equal(dashboard.reviewMetrics.dueForReview, 4);

  assert.equal(dashboard.overview.retention.totalUsers, 10);
  assert.equal(dashboard.overview.retention.activeAtDay7, 8);
  assert.equal(dashboard.overview.retention.retentionRate, 80);
  assert.equal(dashboard.overview.contentReplay.totalContentViewed, 30);
  assert.equal(dashboard.overview.contentReplay.contentReplayedForReview, 7);
  assert.equal(dashboard.overview.contentReplay.averageReplayCount, 2.5);
  assert.equal(dashboard.overview.contentReplay.replayRate, 23.33);
  assert.equal(dashboard.overview.corrections.totalCorrections, 40);
  assert.equal(dashboard.overview.corrections.correctionsAccepted, 28);
  assert.equal(dashboard.overview.corrections.acceptanceRate, 70);
  assert.equal(dashboard.overview.audioCompletion.totalAudioStarted, 20);
  assert.equal(dashboard.overview.audioCompletion.totalAudioCompleted, 15);
  assert.equal(dashboard.overview.audioCompletion.completionRate, 75);
  assert.equal(dashboard.overview.audioCompletion.averageListenDuration, 120);
});
