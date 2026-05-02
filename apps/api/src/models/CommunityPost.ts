import mongoose, { model, Schema, type Types } from "mongoose";

// Types de contenu communautaire
export type CommunityPostType = "discussion" | "question" | "post";

// États de viralité
export type ViralityStatus = "cold" | "warm" | "hot" | "viral" | "trending";

// Interface pour les réactions enrichies
export interface ReactionData {
  type: "like" | "love" | "insightful" | "disagree" | "celebrate";
  count: number;
  users: Types.ObjectId[];
}

// Interface pour les badges de communauté
export interface CommunityBadge {
  type: "trending" | "active" | "quality" | "viral" | "expert";
  earnedAt: Date;
  level: number;
}

// Interface pour les métriques d'engagement
export interface EngagementMetrics {
  views: number;
  shares: number;
  bookmarks: number;
  averageReadTime: number;
  bounceRate: number;
  conversionRate: number; // transformation vers feed
}

export interface CommunityPostDocument {
  _id: Types.ObjectId;
  type: CommunityPostType;
  title: string;
  content: string;
  author: Types.ObjectId | null;
  aiGenerated?: boolean;
  aiPersona?: string | null;
  tags: string[];
  
  // Métriques sociales
  upvotes: number;
  downvotes: number;
  reactions: ReactionData[];
  comments: Types.ObjectId[];
  participantCount: number;
  
  // État de viralité IA
  viralityStatus: ViralityStatus;
  viralityScore: number;
  trendPrediction: number; // prédiction IA 0-100
  
  // Badges et reconnaissance
  badges: CommunityBadge[];
  featuredAt: Date | null;
  pinnedUntil: Date | null;
  
  // Contenu enrichi
  mediaUrl?: string;
  mediaType?: "image" | "video" | "audio";
  linkPreview?: {
    url: string;
    title: string;
    description: string;
    image: string;
  };
  
  // IA et analyse
  aiSummary?: string;
  aiTopics: string[];
  sentiment: "positive" | "neutral" | "negative";
  controversy: number; // 0-1, mesure de controverse IA
  quality: number; // 0-1, score de qualité IA
  
  // Questions spécifiques
  bestAnswer?: Types.ObjectId;
  answerCount: number;
  
  // Métriques d'engagement avancées
  engagementMetrics: EngagementMetrics;
  
  // Transformation vers feed
  transformedToFeed: boolean;
  feedContentId?: Types.ObjectId;
  transformationScore: number;
  
  // Modération
  reports: number;
  isHidden: boolean;
  moderatedAt: Date | null;
  moderatedBy: Types.ObjectId | null;
  
  // Timestamps
  lastActivityAt: Date;
  bumpedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schéma pour les réactions
const reactionSchema = new Schema({
  type: {
    type: String,
    enum: ["like", "love", "insightful", "disagree", "celebrate"],
    required: true
  },
  count: { type: Number, default: 0 },
  users: [{ type: Schema.Types.ObjectId, ref: "User" }]
}, { _id: false });

// Schéma pour les badges
const badgeSchema = new Schema({
  type: {
    type: String,
    enum: ["trending", "active", "quality", "viral", "expert"],
    required: true
  },
  earnedAt: { type: Date, default: Date.now },
  level: { type: Number, default: 1, min: 1, max: 5 }
}, { _id: false });

// Schéma pour les métriques d'engagement
const engagementMetricsSchema = new Schema({
  views: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  bookmarks: { type: Number, default: 0 },
  averageReadTime: { type: Number, default: 0 },
  bounceRate: { type: Number, default: 1.0 },
  conversionRate: { type: Number, default: 0 }
}, { _id: false });

// Schéma pour les link previews
const linkPreviewSchema = new Schema({
  url: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String }
}, { _id: false });

const communityPostSchema = new Schema({
  type: {
    type: String,
    enum: ["discussion", "question", "post"],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: function(this: { aiGenerated?: boolean }) { return !this.aiGenerated; },
    index: true
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiPersona: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 30
  }],
  
  // Métriques sociales
  upvotes: { type: Number, default: 0, index: true },
  downvotes: { type: Number, default: 0 },
  reactions: [reactionSchema],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  participantCount: { type: Number, default: 0, index: true },
  
  // État de viralité IA
  viralityStatus: {
    type: String,
    enum: ["cold", "warm", "hot", "viral", "trending"],
    default: "cold",
    index: true
  },
  viralityScore: { type: Number, default: 0, min: 0, max: 100, index: true },
  trendPrediction: { type: Number, default: 0, min: 0, max: 100 },
  
  // Badges et reconnaissance
  badges: [badgeSchema],
  featuredAt: { type: Date, default: null },
  pinnedUntil: { type: Date, default: null },
  
  // Contenu enrichi
  mediaUrl: { type: String, default: null },
  mediaType: {
    type: String,
    enum: ["image", "video", "audio"],
    default: null
  },
  linkPreview: linkPreviewSchema,
  
  // IA et analyse
  aiSummary: { type: String, maxlength: 500 },
  aiTopics: [{ type: String, trim: true }],
  sentiment: {
    type: String,
    enum: ["positive", "neutral", "negative"],
    default: "neutral"
  },
  controversy: { type: Number, default: 0, min: 0, max: 1 },
  quality: { type: Number, default: 0, min: 0, max: 1 },
  
  // Questions spécifiques
  bestAnswer: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
  answerCount: { type: Number, default: 0 },
  
  // Métriques d'engagement avancées
  engagementMetrics: engagementMetricsSchema,
  
  // Transformation vers feed
  transformedToFeed: { type: Boolean, default: false, index: true },
  feedContentId: { type: Schema.Types.ObjectId, ref: "Content", default: null },
  transformationScore: { type: Number, default: 0, min: 0, max: 100 },
  
  // Modération
  reports: { type: Number, default: 0 },
  isHidden: { type: Boolean, default: false, index: true },
  moderatedAt: { type: Date, default: null },
  moderatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  
  // Timestamps
  lastActivityAt: { type: Date, default: Date.now, index: true },
  bumpedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  // Optimisation pour les gros volumes
  collection: "community_posts"
});

// Indexes pour performance maximale
communityPostSchema.index({ type: 1, viralityStatus: 1, createdAt: -1 });
communityPostSchema.index({ author: 1, createdAt: -1 });
communityPostSchema.index({ tags: 1, viralityScore: -1 });
communityPostSchema.index({ viralityStatus: 1, viralityScore: -1, createdAt: -1 });
communityPostSchema.index({ transformedToFeed: 1, transformationScore: -1 });
communityPostSchema.index({ featuredAt: 1, pinnedUntil: 1 });
communityPostSchema.index({ lastActivityAt: -1 });
communityPostSchema.index({ participantCount: -1, createdAt: -1 });

// Text index pour recherche
communityPostSchema.index({
  title: "text",
  content: "text",
  tags: "text",
  aiTopics: "text"
}, {
  weights: {
    title: 10,
    content: 5,
    tags: 8,
    aiTopics: 7
  },
  name: "idx_community_search"
});

// Middleware pour mettre à jour lastActivityAt
communityPostSchema.pre("save", function(next) {
  if (this.isModified("upvotes") || this.isModified("comments") || this.isModified("participantCount")) {
    this.lastActivityAt = new Date();
  }
  next();
});

// Méthodes virtuelles
communityPostSchema.virtual("score").get(function() {
  return this.upvotes - this.downvotes + (this.participantCount * 0.5) + (this.viralityScore * 0.1);
});

communityPostSchema.virtual("isTrending").get(function() {
  return this.viralityStatus === "trending" || this.viralityStatus === "viral";
});

export const CommunityPostModel = mongoose.models.CommunityPost || model("CommunityPost", communityPostSchema);
