import { AudioTrackModel } from "../models/AudioTrack.js";
import { AudioInteractionModel } from "../models/AudioInteraction.js";
import { AuditLog } from "../models/AuditLog.js";
import { CommentModel } from "../models/Comment.js";
import { ContentClassificationModel } from "../models/ContentClassification.js";
import { ContentEnrichmentModel } from "../models/ContentEnrichment.js";
import { ContentModel } from "../models/Content.js";
import { ContentScoreModel } from "../models/ContentScore.js";
import { DebateThreadModel } from "../models/DebateThread.js";
import { EmailVerificationTokenModel } from "../models/EmailVerificationToken.js";
import { InteractionModel } from "../models/Interaction.js";
import { JobFailure } from "../models/JobFailure.js";
import { PasswordResetTokenModel } from "../models/PasswordResetToken.js";
import { PlaylistModel } from "../models/Playlist.js";
import { ProfileModel } from "../models/Profile.js";
import { RankingConfigModel } from "../models/RankingConfig.js";
import { ReplyModel } from "../models/Reply.js";
import { SessionModel } from "../models/Session.js";
import { TrendSignal } from "../models/TrendSignal.js";
import { UserModel } from "../models/User.js";

const indexedModels = [
  UserModel,
  ProfileModel,
  SessionModel,
  EmailVerificationTokenModel,
  PasswordResetTokenModel,
  ContentModel,
  ContentClassificationModel,
  ContentEnrichmentModel,
  ContentScoreModel,
  InteractionModel,
  CommentModel,
  ReplyModel,
  DebateThreadModel,
  AudioTrackModel,
  AudioInteractionModel,
  PlaylistModel,
  RankingConfigModel,
  JobFailure,
  AuditLog,
  TrendSignal
];

export async function ensureIndexes() {
  await Promise.all(indexedModels.map((indexedModel) => indexedModel.syncIndexes()));
}
