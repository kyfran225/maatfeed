import { CommunityPostModel } from "../models/CommunityPost.js";
import { ProfileModel } from "../models/Profile.js";
import { CommentModel } from "../models/Comment.js";
import { ContentModel } from "../models/Content.js";
import { communityAIService } from "./communityAIService.js";

// Interface pour les patterns d'apprentissage
interface LearningPattern {
  userId: string;
  categoryScores: Record<string, number>;
  interactionHistory: {
    type: "post" | "comment" | "upvote" | "share" | "save";
    topic: string;
    timestamp: Date;
    sentiment: "positive" | "neutral" | "negative";
    quality: number;
  }[];
  preferences: {
    contentTypes: Record<string, number>;
    engagementTimes: number[]; // Heures de la journée
    controversyTolerance: number;
    qualityThreshold: number;
  };
  evolution: {
    weekOverWeek: Record<string, number>;
    newInterests: string[];
    decliningInterests: string[];
  };
}

// Interface pour les recommandations d'apprentissage
interface LearningRecommendation {
  type: "content" | "topic" | "engagement" | "skill";
  title: string;
  description: string;
  confidence: number;
  reason: string;
  action: {
    type: "explore" | "create" | "engage" | "share";
    target: string;
  };
}

class CommunityLearningService {
  /**
   * Met à jour le profil d'apprentissage utilisateur basé sur les interactions
   */
  async updateUserLearningProfile(userId: string, interaction: {
    type: "post" | "comment" | "upvote" | "share" | "save";
    contentId: string;
    sentiment?: string;
    quality?: number;
  }): Promise<void> {
    try {
      // Récupérer le profil utilisateur
      const profile = await ProfileModel.findOne({ userId });
      if (!profile) return;

      // Récupérer le contenu pour l'analyse
      const content = await CommunityPostModel.findById(interaction.contentId);
      if (!content) return;

      // Analyser l'interaction
      const learningData = await this.analyzeInteraction(userId, content, interaction);
      
      // Mettre à jour les scores de catégories
      await this.updateCategoryScores(userId, learningData);
      
      // Mettre à jour les préférences
      await this.updateUserPreferences(userId, learningData);
      
      // Détecter de nouveaux intérêts
      await this.detectNewInterests(userId, learningData);
      
      // Mettre à jour l'évolution
      await this.updateLearningEvolution(userId);
      
    } catch (error) {
      console.error("Error updating user learning profile:", error);
    }
  }

  /**
   * Analyse une interaction pour en extraire des données d'apprentissage
   */
  private async analyzeInteraction(userId: string, content: any, interaction: any): Promise<any> {
    const topics = [...content.tags, ...(content.aiTopics || [])];
    const sentiment = content.sentiment || "neutral";
    const quality = content.quality || 0.5;
    const controversy = content.controversy || 0;

    // Pondération basée sur le type d'interaction
    const interactionWeights = {
      post: 1.0,
      comment: 0.8,
      upvote: 0.6,
      share: 0.7,
      save: 0.5
    };

    const weight = interactionWeights[interaction.type as keyof typeof interactionWeights] || 0.5;

    // Calculer l'impact sur chaque catégorie
    const categoryImpact: Record<string, number> = {};
    
    for (const topic of topics) {
      // Impact de base
      let impact = weight * 0.1;
      
      // Bonus pour les interactions positives
      if (sentiment === "positive") impact *= 1.2;
      if (sentiment === "negative") impact *= 0.8;
      
      // Bonus pour la qualité
      impact *= (0.5 + quality);
      
      // Ajustement basé sur la controverse (controverse modérée = plus d'apprentissage)
      if (controversy > 0.2 && controversy < 0.7) impact *= 1.1;
      
      categoryImpact[topic] = impact;
    }

    return {
      topics,
      categoryImpact,
      sentiment,
      quality,
      controversy,
      interactionType: interaction.type,
      timestamp: new Date()
    };
  }

  /**
   * Met à jour les scores de catégories dans le profil utilisateur
   */
  private async updateCategoryScores(userId: string, learningData: any): Promise<void> {
    const profile = await ProfileModel.findOne({ userId });
    if (!profile) return;

    // Initialiser categoryScores si inexistant
    if (!profile.categoryScores) {
      profile.categoryScores = {};
    }

    // Mettre à jour les scores
    for (const [topic, impact] of Object.entries(learningData.categoryImpact)) {
      const currentScore = profile.categoryScores[topic] || 0;
      profile.categoryScores[topic] = Math.min(1, currentScore + (impact as number));
    }

    // Appliquer la décroissance naturelle (oubli)
    await this.applyNaturalDecay(profile.categoryScores);

    await profile.save();
  }

  /**
   * Applique une décroissance naturelle aux scores (oubli avec le temps)
   */
  private async applyNaturalDecay(categoryScores: Record<string, number>): Promise<void> {
    const decayRate = 0.02; // 2% de décroissance par mise à jour
    
    for (const topic in categoryScores) {
      categoryScores[topic] *= (1 - decayRate);
      
      // Supprimer les scores trop faibles
      if (categoryScores[topic] < 0.01) {
        delete categoryScores[topic];
      }
    }
  }

  /**
   * Met à jour les préférences utilisateur
   */
  private async updateUserPreferences(userId: string, learningData: any): Promise<void> {
    const profile = await ProfileModel.findOne({ userId });
    if (!profile) return;

    // Initialiser les préférences
    if (!profile.preferences) {
      profile.preferences = {
        contentTypes: {},
        engagementTimes: [],
        controversyTolerance: 0.5,
        qualityThreshold: 0.5
      };
    }

    const prefs = profile.preferences;

    // Mettre à jour les préférences de types de contenu
    const contentType = learningData.topics.includes("debate") ? "debate" : 
                       learningData.topics.includes("question") ? "question" : "post";
    
    prefs.contentTypes[contentType] = (prefs.contentTypes[contentType] || 0) + 1;

    // Mettre à jour les heures d'engagement
    const currentHour = new Date().getHours();
    if (!prefs.engagementTimes.includes(currentHour)) {
      prefs.engagementTimes.push(currentHour);
      prefs.engagementTimes.sort();
    }

    // Mettre à jour la tolérance à la controverse
    const currentTolerance = prefs.controversyTolerance || 0.5;
    const targetControversy = learningData.controversy;
    prefs.controversyTolerance = (currentTolerance * 0.9) + (targetControversy * 0.1);

    // Mettre à jour le seuil de qualité
    const currentThreshold = prefs.qualityThreshold || 0.5;
    const targetQuality = learningData.quality;
    prefs.qualityThreshold = (currentThreshold * 0.9) + (targetQuality * 0.1);

    await profile.save();
  }

  /**
   * Détecte de nouveaux intérêts basés sur les patterns d'interaction
   */
  private async detectNewInterests(userId: string, learningData: any): Promise<void> {
    const profile = await ProfileModel.findOne({ userId });
    if (!profile) return;

    const currentInterests = new Set(profile.interests || []);
    const newInterests: string[] = [];

    // Analyser les topics de l'interaction
    for (const topic of learningData.topics) {
      // Si le topic n'est pas dans les intérêts actuels mais a un impact positif
      if (!currentInterests.has(topic) && learningData.categoryImpact[topic] > 0.05) {
        newInterests.push(topic);
      }
    }

    // Ajouter les nouveaux intérêts s'ils sont suffisamment forts
    if (newInterests.length > 0) {
      profile.interests = [...currentInterests, ...newInterests];
      await profile.save();
    }
  }

  /**
   * Met à jour l'évolution de l'apprentissage
   */
  private async updateLearningEvolution(userId: string): Promise<void> {
    const profile = await ProfileModel.findOne({ userId });
    if (!profile) return;

    // Calculer l'évolution sur la dernière semaine
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Récupérer les interactions récentes
    const recentInteractions = await this.getRecentInteractions(userId, oneWeekAgo);
    
    // Analyser l'évolution
    const evolution = await this.analyzeLearningEvolution(recentInteractions);
    
    // Stocker l'évolution
    if (!profile.learningEvolution) {
      profile.learningEvolution = {};
    }
    
    profile.learningEvolution.lastWeek = evolution;
    await profile.save();
  }

  /**
   * Récupère les interactions récentes d'un utilisateur
   */
  private async getRecentInteractions(userId: string, since: Date): Promise<any[]> {
    const interactions: any[] = [];

    // Posts créés
    const posts = await CommunityPostModel.find({
      author: userId,
      createdAt: { $gte: since }
    }).lean();

    posts.forEach(post => {
      interactions.push({
        type: "post",
        topics: [...post.tags, ...(post.aiTopics || [])],
        timestamp: post.createdAt,
        sentiment: post.sentiment,
        quality: post.quality
      });
    });

    // Commentaires
    const comments = await CommentModel.find({
      userId,
      createdAt: { $gte: since }
    }).populate("contentId").lean();

    comments.forEach(comment => {
      const content = comment.contentId as any;
      if (content) {
        interactions.push({
          type: "comment",
          topics: content.tags || [],
          timestamp: comment.createdAt,
          sentiment: content.sentiment,
          quality: content.quality
        });
      }
    });

    return interactions.sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Analyse l'évolution de l'apprentissage
   */
  private async analyzeLearningEvolution(interactions: any[]): Promise<any> {
    const topicFrequency: Record<string, number> = {};
    const sentimentEvolution: Record<string, { positive: number; negative: number }> = {};
    const qualityEvolution: number[] = [];

    interactions.forEach(interaction => {
      // Fréquence des topics
      interaction.topics.forEach((topic: string) => {
        topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
      });

      // Évolution du sentiment
      interaction.topics.forEach((topic: string) => {
        if (!sentimentEvolution[topic]) {
          sentimentEvolution[topic] = { positive: 0, negative: 0 };
        }
        
        if (interaction.sentiment === "positive") sentimentEvolution[topic].positive++;
        if (interaction.sentiment === "negative") sentimentEvolution[topic].negative++;
      });

      // Évolution de la qualité
      if (interaction.quality) {
        qualityEvolution.push(interaction.quality);
      }
    });

    // Calculer les tendances
    const trendingTopics = Object.entries(topicFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);

    const avgQuality = qualityEvolution.length > 0 
      ? qualityEvolution.reduce((sum, q) => sum + q, 0) / qualityEvolution.length 
      : 0.5;

    return {
      trendingTopics,
      topicFrequency,
      sentimentEvolution,
      averageQuality: avgQuality,
      totalInteractions: interactions.length
    };
  }

  /**
   * Génère des recommandations d'apprentissage personnalisées
   */
  async generateLearningRecommendations(userId: string): Promise<LearningRecommendation[]> {
    try {
      const profile = await ProfileModel.findOne({ userId });
      if (!profile) return [];

      const recommendations: LearningRecommendation[] = [];

      // Analyser les patterns actuels
      const patterns = await this.analyzeUserPatterns(userId);
      
      // Recommandations de contenu
      const contentRecs = await this.generateContentRecommendations(patterns);
      recommendations.push(...contentRecs);

      // Recommandations de topics
      const topicRecs = await this.generateTopicRecommendations(patterns);
      recommendations.push(...topicRecs);

      // Recommandations d'engagement
      const engagementRecs = await this.generateEngagementRecommendations(patterns);
      recommendations.push(...engagementRecs);

      // Recommandations de compétences
      const skillRecs = await this.generateSkillRecommendations(patterns);
      recommendations.push(...skillRecs);

      return recommendations.sort((a, b) => b.confidence - a.confidence).slice(0, 10);
    } catch (error) {
      console.error("Error generating learning recommendations:", error);
      return [];
    }
  }

  /**
   * Analyse les patterns utilisateur
   */
  private async analyzeUserPatterns(userId: string): Promise<any> {
    const profile = await ProfileModel.findOne({ userId });
    if (!profile) return null;

    const patterns = {
      categoryScores: profile.categoryScores || {},
      interests: profile.interests || [],
      preferences: profile.preferences || {},
      evolution: profile.learningEvolution || {},
      recentActivity: await this.getRecentInteractions(userId, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    };

    return patterns;
  }

  /**
   * Génère des recommandations de contenu
   */
  private async generateContentRecommendations(patterns: any): Promise<LearningRecommendation[]> {
    const recommendations: LearningRecommendation[] = [];

    // Basé sur les scores de catégories élevés
    const topCategories = Object.entries(patterns.categoryScores)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([category]) => category);

    for (const category of topCategories) {
      recommendations.push({
        type: "content",
        title: `Explore ${category}`,
        description: `Découvre plus de contenu sur ${category} basé sur tes intérêts`,
        confidence: patterns.categoryScores[category],
        reason: `Score élevé dans la catégorie ${category}`,
        action: {
          type: "explore",
          target: category
        }
      });
    }

    return recommendations;
  }

  /**
   * Génère des recommandations de topics
   */
  private async generateTopicRecommendations(patterns: any): Promise<LearningRecommendation[]> {
    const recommendations: LearningRecommendation[] = [];

    // Topics liés aux intérêts actuels
    const relatedTopics = await this.findRelatedTopics(patterns.interests);
    
    for (const topic of relatedTopics) {
      recommendations.push({
        type: "topic",
        title: `Découvre ${topic}`,
        description: `Nouveau topic lié à tes intérêts actuels`,
        confidence: 0.7,
        reason: `Lié à tes intérêts: ${patterns.interests.slice(0, 2).join(", ")}`,
        action: {
          type: "explore",
          target: topic
        }
      });
    }

    return recommendations;
  }

  /**
   * Génère des recommandations d'engagement
   */
  private async generateEngagementRecommendations(patterns: any): Promise<LearningRecommendation[]> {
    const recommendations: LearningRecommendation[] = [];

    // Si l'utilisateur est principalement consommateur
    const postCount = patterns.recentActivity.filter((i: any) => i.type === "post").length;
    const commentCount = patterns.recentActivity.filter((i: any) => i.type === "comment").length;
    const totalInteractions = patterns.recentActivity.length;

    if (postCount < totalInteractions * 0.1) {
      recommendations.push({
        type: "engagement",
        title: "Crée ton premier post",
        description: "Partage tes connaissances avec la communauté",
        confidence: 0.8,
        reason: "Tu es principalement consommateur de contenu",
        action: {
          type: "create",
          target: "post"
        }
      });
    }

    if (commentCount < totalInteractions * 0.2) {
      recommendations.push({
        type: "engagement",
        title: "Participe aux discussions",
        description: "Ajoute ton point de vue aux conversations",
        confidence: 0.7,
        reason: "Peu de commentaires récents",
        action: {
          type: "engage",
          target: "comment"
        }
      });
    }

    return recommendations;
  }

  /**
   * Génère des recommandations de compétences
   */
  private async generateSkillRecommendations(patterns: any): Promise<LearningRecommendation[]> {
    const recommendations: LearningRecommendation[] = [];

    // Basé sur la qualité moyenne des interactions
    const avgQuality = patterns.evolution?.averageQuality || 0.5;

    if (avgQuality < 0.6) {
      recommendations.push({
        type: "skill",
        title: "Améliore la qualité de tes posts",
        description: "Apprends à structurer mieux tes arguments",
        confidence: 0.8,
        reason: "Qualité moyenne des posts inférieure à la moyenne",
        action: {
          type: "explore",
          target: "quality-guide"
        }
      });
    }

    return recommendations;
  }

  /**
   * Trouve des topics liés aux intérêts actuels
   */
  private async findRelatedTopics(interests: string[]): Promise<string[]> {
    // Pour l'instant, retourne une liste prédéfinie
    // À l'avenir, utiliser l'IA pour trouver des relations sémantiques
    const relatedTopics: Record<string, string[]> = {
      "kemet": ["egypt", "pharaon", "pyramides", "hiéroglyphes"],
      "philosophy": ["sagesse", "éthique", "logique", "métaphysique"],
      "spirituality": ["méditation", "conscience", "énergie", "spirituel"],
      "history": ["civilisation", "ancien", "archéologie", "culture"]
    };

    const related: string[] = [];
    
    for (const interest of interests) {
      if (relatedTopics[interest]) {
        related.push(...relatedTopics[interest]);
      }
    }

    return [...new Set(related)].slice(0, 5);
  }

  /**
   * Calcule le score d'apprentissage global d'un utilisateur
   */
  async calculateLearningScore(userId: string): Promise<number> {
    try {
      const profile = await ProfileModel.findOne({ userId });
      if (!profile) return 0;

      let score = 0;

      // Score basé sur la diversité des intérêts
      const diversityScore = (profile.interests?.length || 0) * 0.1;
      score += Math.min(0.3, diversityScore);

      // Score basé sur la profondeur des catégories
      const categoryScores = Object.values(profile.categoryScores || {}) as number[];
      const avgCategoryScore = categoryScores.length > 0 
        ? categoryScores.reduce((sum: number, score: number) => sum + score, 0) / categoryScores.length 
        : 0;
      score += avgCategoryScore * 0.4;

      // Score basé sur l'évolution
      const evolutionScore = profile.learningEvolution?.lastWeek?.totalInteractions || 0;
      score += Math.min(0.3, evolutionScore * 0.05);

      return Math.min(1, score);
    } catch (error) {
      console.error("Error calculating learning score:", error);
      return 0;
    }
  }

  /**
   * Synchronise l'apprentissage avec le système de recommandations principal
   */
  async syncLearningWithRecommendations(userId: string): Promise<void> {
    try {
      // Calculer le score d'apprentissage
      const learningScore = await this.calculateLearningScore(userId);
      
      // Mettre à jour le profil principal
      await ProfileModel.findByIdAndUpdate(
        { userId },
        { 
          $set: { 
            learningScore,
            lastLearningUpdate: new Date()
          }
        }
      );

      // Générer des recommandations
      const recommendations = await this.generateLearningRecommendations(userId);
      
      // Stocker les recommandations pour utilisation future
      await ProfileModel.findByIdAndUpdate(
        { userId },
        { 
          $set: { 
            learningRecommendations: recommendations,
            lastRecommendationUpdate: new Date()
          }
        }
      );
    } catch (error) {
      console.error("Error syncing learning with recommendations:", error);
    }
  }
}

export const communityLearningService = new CommunityLearningService();
