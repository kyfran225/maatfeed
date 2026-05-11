import { CommunityPostModel, type CommunityPostDocument } from "../models/CommunityPost.js";
import { CommentModel } from "../models/Comment.js";
import { ContentClassificationModel } from "../models/ContentClassification.js";
import { ContentEnrichmentModel } from "../models/ContentEnrichment.js";
import { ContentModel, type IContent } from "../models/Content.js";
import { ContentScoreModel } from "../models/ContentScore.js";
import { ProfileModel } from "../models/Profile.js";
import { cacheService } from "./cacheService.js";
import { notifyContentPublished } from "./notificationService.js";
import OpenAI from "openai";
import type { Types } from "mongoose";

// Interface pour les tendances détectées
export interface TrendingTopic {
  topic: string;
  score: number;
  posts: string[];
  growth: number; // croissance sur 24h
  sentiment: "positive" | "neutral" | "negative";
}

// Interface pour les contradictions détectées
export interface Contradiction {
  topic: string;
  arguments: {
    position: string;
    evidence: string;
    supporters: string[];
  }[];
  controversy: number;
  recommendation: string;
}

// Interface pour les suggestions de contenu
export interface ContentSuggestion {
  type: "video" | "article" | "debate" | "quiz";
  title: string;
  description: string;
  source: "community" | "ai" | "trending";
  relevanceScore: number;
  topics: string[];
}

type LeanTrendingPost = Pick<
  CommunityPostDocument,
  "_id" | "tags" | "aiTopics" | "upvotes" | "participantCount" | "sentiment" | "viralityScore" | "quality" | "controversy" | "mediaUrl" | "createdAt"
>;

type DiscussionSummaryPost = Pick<
  CommunityPostDocument,
  "_id" | "title" | "content" | "participantCount" | "sentiment"
> & {
  comments?: Array<{ body?: string; likeCount?: number }>;
};

type TopicAggregate = {
  topic: string;
  posts: string[];
  totalEngagement: number;
  sentiment: { positive: number; neutral: number; negative: number };
};

type FeedContentPayload = {
  title: string;
  description: string;
};

function profileInterestTopics(profile: { interests?: Map<string, number> | Record<string, number> | string[] | null }): string[] {
  const interests = profile.interests;

  if (!interests) {
    return [];
  }

  if (Array.isArray(interests)) {
    return interests;
  }

  if (interests instanceof Map) {
    return Array.from(interests.keys());
  }

  return Object.keys(interests);
}

class CommunityAIService {
  private openai: OpenAI | null;

  constructor() {
    this.openai = process.env.OPENAI_API_KEY
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;
  }

  private getOpenAI(): OpenAI {
    if (!this.openai) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    return this.openai;
  }

  /**
   * Détecte les sujets chauds en temps réel
   */
  async detectTrendingTopics(timeframe: "hour" | "day" | "week" = "day"): Promise<TrendingTopic[]> {
    try {
      const now = new Date();
      const timeAgo = new Date();
      
      switch (timeframe) {
        case "hour":
          timeAgo.setHours(now.getHours() - 1);
          break;
        case "day":
          timeAgo.setDate(now.getDate() - 1);
          break;
        case "week":
          timeAgo.setDate(now.getDate() - 7);
          break;
      }

      // Récupérer les posts récents avec engagement élevé
      const recentPosts = await CommunityPostModel.find({
        createdAt: { $gte: timeAgo },
        isHidden: false
      })
      .sort({ viralityScore: -1 })
      .limit(100)
      .lean() as unknown as LeanTrendingPost[];

      // Analyser les tags et contenu avec IA
      const topicAnalysis = await this.analyzeTopicsWithAI(recentPosts);
      
      // Calculer les tendances basées sur la croissance
      const trends = await this.calculateTopicGrowth(topicAnalysis, timeframe);
      
      // Mettre en cache pour 5 minutes
      await cacheService.set(
        `trending_topics_${timeframe}`,
        trends,
        300
      );

      return trends;
    } catch (error) {
      console.error("Error detecting trending topics:", error);
      return [];
    }
  }

  /**
   * Détecte les contradictions dans les discussions
   */
  async detectContradictions(topic: string): Promise<Contradiction[]> {
    try {
      // Récupérer les discussions sur le sujet
      const posts = await CommunityPostModel.find({
        tags: { $in: [topic] },
        type: "discussion",
        isHidden: false
      })
      .sort({ participantCount: -1 })
      .limit(20)
      .populate("comments")
      .lean() as unknown as Array<{ title: string; content: string; comments?: unknown[] }>;

      if (posts.length < 2) return [];

      // Utiliser l'IA pour analyser les contradictions
      const contradictions = await this.analyzeContradictionsWithAI(posts);
      
      return contradictions;
    } catch (error) {
      console.error("Error detecting contradictions:", error);
      return [];
    }
  }

  /**
   * Génère un résumé de discussion avec IA
   */
  async generateDiscussionSummary(postId: string): Promise<string> {
    try {
      const post = await CommunityPostModel.findById(postId)
        .populate("comments")
        .lean() as unknown as DiscussionSummaryPost | null;

      if (!post) throw new Error("Post not found");

      // Préparer le contexte pour l'IA
      const context = {
        title: post.title || "Discussion",
        mainContent: post.content || "",
        topComments: (post.comments || [])
          .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
          .slice(0, 10)
          .map((c) => c.body || "")
          .join("\n"),
        participantCount: post.participantCount || 0,
        sentiment: post.sentiment || "neutral"
      };

      // Générer le résumé avec GPT
      const completion = await this.getOpenAI().chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Tu es un expert en synthèse de discussions pour MAAT FEED. Génère un résumé concis et percutant qui capture les points clés et les différentes perspectives d'une discussion. Le résumé doit être en français, engageant et maximum 300 caractères."
          },
          {
            role: "user",
            content: `Génère un résumé pour cette discussion:
            
Titre: ${context.title}
Contenu principal: ${context.mainContent}
Participants: ${context.participantCount}
Sentiment: ${context.sentiment}

Top commentaires:
${context.topComments}`
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      const summary = completion.choices[0]?.message?.content?.trim() || "";
      
      // Mettre à jour le post avec le résumé
      await CommunityPostModel.findByIdAndUpdate(postId, {
        aiSummary: summary
      });

      return summary;
    } catch (error) {
      console.error("Error generating discussion summary:", error);
      return "";
    }
  }

  /**
   * Transforme une discussion populaire en contenu feed
   */
  async transformDiscussionToFeed(postId: string): Promise<string | null> {
    try {
      const post = await CommunityPostModel.findById(postId);
      
      if (!post || post.transformedToFeed) {
        return null;
      }

      // Vérifier si le post est suffisamment populaire
      if (post.viralityScore < 50 || post.participantCount < 5) {
        return null;
      }

      // Générer le contenu feed avec IA
      const feedContent = await this.generateFeedContentFromDiscussion(post);
      
      // Créer le contenu dans la collection Content
      const newContent = new ContentModel({
        externalId: `community-${post._id.toString()}`,
        canonicalUrl: `/community/${post._id.toString()}`,
        title: feedContent.title,
        description: feedContent.description,
        sourceProvider: "community",
        sourceUrl: `/community/${post._id.toString()}`,
        mediaType: "video",
        mediaUrl: post.mediaUrl || `/community/${post._id.toString()}`,
        creatorName: "MAAT Community",
        thumbnailUrl: post.mediaUrl || null,
        processingStatus: "published",
        publishedAt: new Date(),
        metadata: {
          communityPostId: post._id,
          originalAuthor: post.author,
          transformationScore: post.transformationScore,
          viralityStatus: post.viralityStatus
        },
        tags: [...post.tags, "community-generated"],
        contentType: post.mediaType === "video" ? "video" : "article",
        duration: post.mediaType === "video" ? 120 : null, // 2min par défaut
        language: "fr"
      });

      const savedContent = await newContent.save();
      await notifyContentPublished(savedContent._id.toString());

      await Promise.all([
        ContentClassificationModel.findOneAndUpdate(
          { contentId: savedContent._id },
          {
            $set: {
              bucket: "deep",
              debateScore: Math.min(100, Math.max(55, post.viralityScore)),
              emotionScore: Math.round((post.controversy || 0) * 100),
              educationScore: Math.min(88, 45 + post.participantCount * 4),
              confidence: 0.78
            }
          },
          { upsert: true, new: true }
        ),
        ContentEnrichmentModel.findOneAndUpdate(
          { contentId: savedContent._id },
          {
            $set: {
              summary: feedContent.description,
              keyIdeas: post.tags.slice(0, 5),
              debatePrompt: `Quelle position faut-il défendre ou contester sur "${feedContent.title}" ?`,
              thematicTags: [...post.tags, "community-generated"]
            }
          },
          { upsert: true, new: true }
        ),
        ContentScoreModel.findOneAndUpdate(
          { contentId: savedContent._id },
          {
            $set: {
              likes: Math.max(0, post.upvotes || 0),
              comments: Math.max(0, post.participantCount || 0),
              views: Math.max(0, (post.engagementMetrics?.views || 0) + post.participantCount * 8),
              debateScore: Math.min(100, Math.max(20, post.viralityScore || 0)),
              recencyBoost: 15,
              finalScore: Math.min(1000, Math.round((post.viralityScore || 0) * 2 + post.participantCount * 12)),
              scoreVersion: "community-feed-v1"
            }
          },
          { upsert: true, new: true }
        )
      ]);

      // Mettre à jour le post communautaire
      await CommunityPostModel.findByIdAndUpdate(postId, {
        transformedToFeed: true,
        feedContentId: savedContent._id,
        transformationScore: post.transformationScore
      });

      // Invalider les caches feed
      await cacheService.deletePattern("feed:*");

      return savedContent._id.toString();
    } catch (error) {
      console.error("Error transforming discussion to feed:", error);
      return null;
    }
  }

  /**
   * Met à jour les scores de viralité en temps réel
   */
  async updateViralityScores(): Promise<void> {
    try {
      // Récupérer tous les posts actifs
      const posts = await CommunityPostModel.find({
        isHidden: false,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // 7 derniers jours
      });

      for (const post of posts) {
        const score = await this.calculateViralityScore(post);
        const status = this.determineViralityStatus(score);
        
        await CommunityPostModel.findByIdAndUpdate(post._id, {
          viralityScore: score,
          viralityStatus: status,
          trendPrediction: await this.predictTrendContinuation(post)
        });
      }
    } catch (error) {
      console.error("Error updating virality scores:", error);
    }
  }

  /**
   * Suggère du contenu personnalisé basé sur l'activité communauté
   */
  async suggestPersonalizedContent(userId: string): Promise<ContentSuggestion[]> {
    try {
      // Récupérer le profil utilisateur
      const profile = await ProfileModel.findOne({ userId }).lean() as { interests?: Map<string, number> | Record<string, number> | string[] | null } | null;
      if (!profile) return [];

      // Analyser les intérêts et l'activité récente
      const userInterests = profileInterestTopics(profile);
      const recentActivity = await this.getUserRecentActivity(userId);

      // Détecter les tendances pertinentes
      const trends = await this.detectTrendingTopics("day");
      const relevantTrends = trends.filter(trend => 
        userInterests.some((interest) => 
          trend.topic.toLowerCase().includes(interest.toLowerCase())
        )
      );

      // Générer des suggestions avec IA
      const suggestions = await this.generateContentSuggestions(
        userInterests,
        recentActivity,
        relevantTrends
      );

      return suggestions;
    } catch (error) {
      console.error("Error suggesting personalized content:", error);
      return [];
    }
  }

  // === MÉTHODES PRIVÉES ===

  private async analyzeTopicsWithAI(posts: LeanTrendingPost[]): Promise<TopicAggregate[]> {
    // Implémentation de l'analyse de sujets avec IA
    const topicMap = new Map<string, TopicAggregate>();

    for (const post of posts) {
      // Combiner tags et IA topics
      const allTopics = [...post.tags, ...(post.aiTopics || [])];
      
      for (const topic of allTopics) {
        if (!topicMap.has(topic)) {
          topicMap.set(topic, {
            topic,
            posts: [],
            totalEngagement: 0,
            sentiment: { positive: 0, neutral: 0, negative: 0 }
          });
        }
        
        const topicData = topicMap.get(topic);
        if (!topicData) continue;
        topicData.posts.push(post._id.toString());
        topicData.totalEngagement += post.upvotes + post.participantCount;
        topicData.sentiment[post.sentiment]++;
      }
    }

    return Array.from(topicMap.values());
  }

  private async calculateTopicGrowth(topics: TopicAggregate[], timeframe: string): Promise<TrendingTopic[]> {
    // Calculer la croissance basée sur les données historiques
    const trends: TrendingTopic[] = [];

    for (const topic of topics) {
      const growth = await this.calculateTopicGrowthRate(topic.topic, timeframe);
      const sentiment = this.getDominantSentiment(topic.sentiment);

      trends.push({
        topic: topic.topic,
        score: topic.totalEngagement,
        posts: topic.posts,
        growth,
        sentiment
      });
    }

    return trends.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  private async calculateTopicGrowthRate(topic: string, timeframe: string): Promise<number> {
    // Implémentation du calcul de croissance
    const now = new Date();
    const current = new Date();
    const previous = new Date();

    switch (timeframe) {
      case "hour":
        current.setHours(now.getHours() - 1);
        previous.setHours(now.getHours() - 2);
        break;
      case "day":
        current.setDate(now.getDate() - 1);
        previous.setDate(now.getDate() - 2);
        break;
      case "week":
        current.setDate(now.getDate() - 7);
        previous.setDate(now.getDate() - 14);
        break;
    }

    const currentCount = await CommunityPostModel.countDocuments({
      tags: topic,
      createdAt: { $gte: current }
    });

    const previousCount = await CommunityPostModel.countDocuments({
      tags: topic,
      createdAt: { $gte: previous, $lt: current }
    });

    if (previousCount === 0) return currentCount > 0 ? 100 : 0;
    
    return ((currentCount - previousCount) / previousCount) * 100;
  }

  private getDominantSentiment(sentiment: { positive: number; neutral: number; negative: number }): "positive" | "neutral" | "negative" {
    const max = Math.max(sentiment.positive, sentiment.neutral, sentiment.negative);
    
    if (max === sentiment.positive) return "positive";
    if (max === sentiment.negative) return "negative";
    return "neutral";
  }

  private async analyzeContradictionsWithAI(posts: Array<{ title: string; content: string; comments?: unknown[] }>): Promise<Contradiction[]> {
    // Préparer les données pour l'IA
    const discussions = posts.map(post => ({
      title: post.title,
      content: post.content,
      comments: post.comments || []
    }));

    try {
      const completion = await this.getOpenAI().chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Tu es un expert en analyse de controverses pour MAAT FEED. Analyse les discussions et identifie les contradictions principales. Retourne un JSON avec les contradictions détectées."
          },
          {
            role: "user",
            content: `Analyse ces discussions et identifie les contradictions:
            ${JSON.stringify(discussions, null, 2)}`
          }
        ],
        temperature: 0.3
      });

      // Parser et traiter la réponse de l'IA
      const analysis = JSON.parse(completion.choices[0]?.message?.content || "[]") as Contradiction[];
      
      return analysis;
    } catch (error) {
      console.error("Error analyzing contradictions with AI:", error);
      return [];
    }
  }

  private async generateFeedContentFromDiscussion(post: CommunityPostDocument): Promise<FeedContentPayload> {
    try {
      const completion = await this.getOpenAI().chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Tu es un créateur de contenu pour MAAT FEED. Transforme une discussion communautaire en contenu feed engageant. Génère un titre accrocheur et une description percutante."
          },
          {
            role: "user",
            content: `Transforme cette discussion en contenu feed:
            
Titre: ${post.title}
Contenu: ${post.content}
Résumé IA: ${post.aiSummary || ""}
Participants: ${post.participantCount}
Score de viralité: ${post.viralityScore}`
          }
        ],
        temperature: 0.8
      });

      const result = JSON.parse(completion.choices[0]?.message?.content || "{}") as Partial<FeedContentPayload>;
      
      return {
        title: result.title || post.title,
        description: result.description || post.aiSummary || post.content
      };
    } catch (error) {
      console.error("Error generating feed content:", error);
      return {
        title: post.title,
        description: post.aiSummary || post.content
      };
    }
  }

  private async calculateViralityScore(post: CommunityPostDocument): Promise<number> {
    let score = 0;

    // Facteur d'engagement (40%)
    const engagementScore = (post.upvotes * 2) + (post.participantCount * 5) + (post.comments.length * 3);
    score += engagementScore * 0.4;

    // Facteur de temps (20%) - posts récents ont plus de poids
    const hoursSinceCreation = (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60);
    const timeScore = Math.max(0, 100 - hoursSinceCreation);
    score += timeScore * 0.2;

    // Facteur de qualité IA (20%)
    score += (post.quality * 100) * 0.2;

    // Facteur de controverse (10%) - controverse modérée augmente la viralité
    const controversyScore = post.controversy > 0.3 && post.controversy < 0.7 ? 50 : post.controversy * 30;
    score += controversyScore * 0.1;

    // Facteur de média (10%)
    if (post.mediaUrl) score += 10;

    return Math.min(100, Math.round(score));
  }

  private determineViralityStatus(score: number): "cold" | "warm" | "hot" | "viral" | "trending" {
    if (score >= 80) return "viral";
    if (score >= 60) return "trending";
    if (score >= 40) return "hot";
    if (score >= 20) return "warm";
    return "cold";
  }

  private async predictTrendContinuation(post: CommunityPostDocument): Promise<number> {
    // Prédiction simple basée sur les tendances actuelles
    const recentGrowth = await this.calculateRecentGrowthRate(post._id.toString());
    const quality = post.quality;
    const controversy = post.controversy;

    // Facteurs de prédiction
    const growthFactor = recentGrowth * 0.4;
    const qualityFactor = quality * 30;
    const controversyFactor = (controversy > 0.3 && controversy < 0.7) ? 20 : controversy * 10;

    const prediction = growthFactor + qualityFactor + controversyFactor;
    
    return Math.min(100, Math.max(0, prediction));
  }

  private async calculateRecentGrowthRate(postId: string): Promise<number> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const post = await CommunityPostModel.findById(postId);
    if (!post) return 0;

    // Simulation de croissance (à implémenter avec des données réelles)
    return Math.random() * 20; // 0-20% de croissance par heure
  }

  private async getUserRecentActivity(userId: string): Promise<LeanTrendingPost[]> {
    // Récupérer l'activité récente de l'utilisateur
    const recentPosts = await CommunityPostModel.find({
      author: userId,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean() as unknown as LeanTrendingPost[];

    return recentPosts;
  }

  private async generateContentSuggestions(
    interests: string[],
    activity: any[],
    trends: TrendingTopic[]
  ): Promise<ContentSuggestion[]> {
    const suggestions: ContentSuggestion[] = [];

    // Suggestions basées sur les tendances
    for (const trend of trends.slice(0, 3)) {
      suggestions.push({
        type: "debate",
        title: `Débat: ${trend.topic}`,
        description: `Rejoins la discussion sur ${trend.topic} - ${trend.posts.length} participants`,
        source: "trending",
        relevanceScore: trend.score,
        topics: [trend.topic]
      });
    }

    // Suggestions basées sur les intérêts
    for (const interest of interests.slice(0, 2)) {
      suggestions.push({
        type: "article",
        title: `Explore ${interest}`,
        description: `Découvre plus sur ${interest} dans la communauté MAAT`,
        source: "ai",
        relevanceScore: 75,
        topics: [interest]
      });
    }

    return suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}

export const communityAIService = new CommunityAIService();
