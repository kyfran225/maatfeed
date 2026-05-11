import { CreatorModel, ICreator } from "../models/Creator";
import { ContentModel, IContent } from "../models/Content";
import { CreatorAnalyticsModel } from "../models/CreatorAnalytics";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AISuggestion {
  type: "title" | "description" | "thumbnail" | "tags" | "content_idea";
  suggestion: string;
  confidence: number;
  reason: string;
  metadata?: {
    targetAudience?: string;
    keywords?: string[];
    category?: string;
  };
}

export interface ContentOptimization {
  optimizedTitle?: string;
  optimizedDescription?: string;
  suggestedTags?: string[];
  thumbnailPrompt?: string;
  seoScore?: number;
  engagementPrediction?: number;
}

export interface AudienceInsight {
  demographics: {
    ageGroups: Record<string, number>;
    gender: Record<string, number>;
    locations: Record<string, number>;
  };
  interests: Record<string, number>;
  peakActivityTimes: Array<{
    day: string;
    hour: number;
    engagement: number;
  }>;
  contentPreferences: {
    formats: Record<string, number>;
    topics: Record<string, number>;
    duration: {
      short: number; // < 5 min
      medium: number; // 5-15 min
      long: number; // > 15 min
    };
  };
  growthOpportunities: Array<{
    opportunity: string;
    potential: number;
    difficulty: "low" | "medium" | "high";
  }>;
}

class CreatorAIAssistantService {
  /**
   * Generate AI suggestions for a creator's content
   */
  async generateSuggestions(creatorId: string, contentType?: string): Promise<AISuggestion[]> {
    try {
      const creator = await CreatorModel.findById(creatorId).populate('userId');
      if (!creator || !creator.aiAssistance.isEnabled) {
        return [];
      }

      const recentContent = await ContentModel.find({ 
        creatorId, 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      }).sort({ createdAt: -1 }).limit(10);

      const analytics = await CreatorAnalyticsModel.find({ 
        creatorId, 
        date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      }).sort({ date: -1 });

      const suggestions: AISuggestion[] = [];

      // Generate title suggestions
      if (!contentType || contentType === 'title') {
        const titleSuggestions = await this.generateTitleSuggestions(creator, recentContent, analytics);
        suggestions.push(...titleSuggestions);
      }

      // Generate description suggestions
      if (!contentType || contentType === 'description') {
        const descSuggestions = await this.generateDescriptionSuggestions(creator, recentContent, analytics);
        suggestions.push(...descSuggestions);
      }

      // Generate thumbnail prompts
      if (!contentType || contentType === 'thumbnail') {
        const thumbnailSuggestions = await this.generateThumbnailSuggestions(creator, recentContent, analytics);
        suggestions.push(...thumbnailSuggestions);
      }

      // Generate tag suggestions
      if (!contentType || contentType === 'tags') {
        const tagSuggestions = await this.generateTagSuggestions(creator, recentContent, analytics);
        suggestions.push(...tagSuggestions);
      }

      // Generate content ideas
      if (!contentType || contentType === 'content_idea') {
        const contentIdeas = await this.generateContentIdeas(creator, recentContent, analytics);
        suggestions.push(...contentIdeas);
      }

      return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 10);
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      return [];
    }
  }

  /**
   * Generate title suggestions based on performance data
   */
  private async generateTitleSuggestions(
    creator: ICreator, 
    recentContent: IContent[], 
    analytics: any[]
  ): Promise<AISuggestion[]> {
    try {
      const topPerformingContent = recentContent
        .filter(content => content.views > 0)
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      const prompt = `
        As a content strategy expert for African creators, analyze the following data:
        
        Creator: ${creator.displayName}
        Bio: ${creator.bio}
        Top performing content: ${topPerformingContent.map(c => `- ${c.title} (${c.views} views)`).join('\n')}
        
        Generate 3 compelling title suggestions that would perform well for this creator's audience.
        Consider:
        - African cultural context and trends
        - Creator's niche and style
        - Engagement patterns
        - SEO best practices
        
        Return as JSON array with: { title, confidence (0-1), reason }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      });

      const suggestions = JSON.parse(response.choices[0].message.content || "[]");
      
      return suggestions.map((s: any) => ({
        type: "title" as const,
        suggestion: s.title,
        confidence: s.confidence,
        reason: s.reason,
        metadata: {
          keywords: this.extractKeywords(s.title),
          category: this.categorizeContent(s.title, creator.bio)
        }
      }));
    } catch (error) {
      console.error("Error generating title suggestions:", error);
      return [];
    }
  }

  /**
   * Generate description suggestions
   */
  private async generateDescriptionSuggestions(
    creator: ICreator, 
    recentContent: IContent[], 
    analytics: any[]
  ): Promise<AISuggestion[]> {
    try {
      const prompt = `
        Create engaging description templates for ${creator.displayName}'s content.
        
        Creator profile: ${creator.displayName} - ${creator.bio}
        Content style: Analyze from their recent content
        
        Generate 3 description templates that:
        - Hook viewers in the first 2 lines
        - Include relevant hashtags
        - Encourage engagement
        - Are optimized for African audience
        - Are 150-300 characters long
        
        Return as JSON array with: { description, confidence, reason }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      });

      const suggestions = JSON.parse(response.choices[0].message.content || "[]");
      
      return suggestions.map((s: any) => ({
        type: "description" as const,
        suggestion: s.description,
        confidence: s.confidence,
        reason: s.reason
      }));
    } catch (error) {
      console.error("Error generating description suggestions:", error);
      return [];
    }
  }

  /**
   * Generate thumbnail prompts
   */
  private async generateThumbnailSuggestions(
    creator: ICreator, 
    recentContent: IContent[], 
    analytics: any[]
  ): Promise<AISuggestion[]> {
    try {
      const prompt = `
        Generate 3 AI image prompts for thumbnails that would perform well for ${creator.displayName}.
        
        Creator: ${creator.displayName} - ${creator.bio}
        Style: Modern, engaging, African cultural elements
        
        Each prompt should be:
        - Detailed and specific
        - Include color schemes (mention orange/black MAATFEED theme)
        - Suitable for content thumbnails
        - 50-100 characters
        
        Return as JSON array with: { prompt, confidence, reason }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 400,
      });

      const suggestions = JSON.parse(response.choices[0].message.content || "[]");
      
      return suggestions.map((s: any) => ({
        type: "thumbnail" as const,
        suggestion: s.prompt,
        confidence: s.confidence,
        reason: s.reason
      }));
    } catch (error) {
      console.error("Error generating thumbnail suggestions:", error);
      return [];
    }
  }

  /**
   * Generate tag suggestions
   */
  private async generateTagSuggestions(
    creator: ICreator, 
    recentContent: IContent[], 
    analytics: any[]
  ): Promise<AISuggestion[]> {
    try {
      const prompt = `
        Generate relevant hashtag suggestions for ${creator.displayName}'s content.
        
        Creator: ${creator.displayName} - ${creator.bio}
        Target: African audience, trending topics
        
        Suggest 15 hashtags that include:
        - 5 broad/trending tags
        - 5 niche-specific tags
        - 5 creator brand tags
        
        Return as JSON array with: { tags, confidence, reason }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
        max_tokens: 300,
      });

      const suggestions = JSON.parse(response.choices[0].message.content || "[]");
      
      return suggestions.map((s: any) => ({
        type: "tags" as const,
        suggestion: s.tags.join(', '),
        confidence: s.confidence,
        reason: s.reason
      }));
    } catch (error) {
      console.error("Error generating tag suggestions:", error);
      return [];
    }
  }

  /**
   * Generate content ideas
   */
  private async generateContentIdeas(
    creator: ICreator, 
    recentContent: IContent[], 
    analytics: any[]
  ): Promise<AISuggestion[]> {
    try {
      const prompt = `
        Generate 5 content ideas for ${creator.displayName} based on their performance and audience.
        
        Creator: ${creator.displayName} - ${creator.bio}
        Recent content topics: ${recentContent.map(c => c.title).join(', ')}
        
        Ideas should be:
        - Relevant to African audience
        - Aligned with creator's brand
        - Based on trending topics in Africa
        - Engaging and shareable
        
        Return as JSON array with: { idea, confidence, reason, category }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 600,
      });

      const suggestions = JSON.parse(response.choices[0].message.content || "[]");
      
      return suggestions.map((s: any) => ({
        type: "content_idea" as const,
        suggestion: s.idea,
        confidence: s.confidence,
        reason: s.reason,
        metadata: {
          category: s.category,
          keywords: this.extractKeywords(s.idea)
        }
      }));
    } catch (error) {
      console.error("Error generating content ideas:", error);
      return [];
    }
  }

  /**
   * Optimize existing content
   */
  async optimizeContent(contentId: string): Promise<ContentOptimization> {
    try {
      const content = await ContentModel.findById(contentId).populate('creatorId');
      if (!content) {
        throw new Error("Content not found");
      }

      const creator = content.creatorId as any;
      if (!creator.aiAssistance.isEnabled) {
        throw new Error("AI assistance not enabled");
      }

      const prompt = `
        Optimize this content for better performance:
        
        Current title: ${content.title}
        Current description: ${content.description || 'None'}
        Creator: ${creator.displayName} - ${creator.bio}
        
        Provide optimized versions that:
        - Improve SEO and discoverability
        - Increase engagement
        - Appeal to African audience
        - Maintain creator's authentic voice
        
        Return as JSON with: {
          optimizedTitle,
          optimizedDescription,
          suggestedTags: [array],
          seoScore (0-100),
          engagementPrediction (0-100)
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 800,
      });

      const optimization = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        optimizedTitle: optimization.optimizedTitle,
        optimizedDescription: optimization.optimizedDescription,
        suggestedTags: optimization.suggestedTags || [],
        seoScore: optimization.seoScore,
        engagementPrediction: optimization.engagementPrediction
      };
    } catch (error) {
      console.error("Error optimizing content:", error);
      throw error;
    }
  }

  /**
   * Generate audience insights
   */
  async generateAudienceInsights(creatorId: string): Promise<AudienceInsight> {
    try {
      const creator = await CreatorModel.findById(creatorId);
      if (!creator || !creator.aiAssistance.audienceInsights) {
        throw new Error("Audience insights not enabled");
      }

      const analytics = await CreatorAnalyticsModel.find({ 
        creatorId, 
        date: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } 
      }).sort({ date: -1 });

      const prompt = `
        Analyze this creator's audience data and provide insights:
        
        Creator: ${creator.displayName}
        Analytics data: ${JSON.stringify(analytics.slice(0, 10))}
        Creator stats: ${JSON.stringify(creator.stats)}
        
        Provide detailed insights about:
        - Audience demographics
        - Peak activity times
        - Content preferences
        - Growth opportunities
        
        Return as JSON with detailed audience insights structure.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const insights = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        demographics: insights.demographics || {
          ageGroups: {},
          gender: {},
          locations: {}
        },
        interests: insights.interests || {},
        peakActivityTimes: insights.peakActivityTimes || [],
        contentPreferences: insights.contentPreferences || {
          formats: {},
          topics: {},
          duration: { short: 0, medium: 0, long: 0 }
        },
        growthOpportunities: insights.growthOpportunities || []
      };
    } catch (error) {
      console.error("Error generating audience insights:", error);
      throw error;
    }
  }

  /**
   * Apply AI suggestion to content
   */
  async applySuggestion(creatorId: string, suggestion: AISuggestion, contentId?: string): Promise<void> {
    try {
      const creator = await CreatorModel.findById(creatorId);
      if (!creator || creator.userId.toString() !== creatorId) {
        throw new Error("Unauthorized");
      }

      if (contentId) {
        const content = await ContentModel.findById(contentId);
        if (!content || content.creatorId.toString() !== creatorId) {
          throw new Error("Content not found or unauthorized");
        }

        // Apply suggestion based on type
        switch (suggestion.type) {
          case "title":
            content.title = suggestion.suggestion;
            break;
          case "description":
            content.description = suggestion.suggestion;
            break;
          case "tags":
            content.tags = suggestion.suggestion.split(',').map(tag => tag.trim());
            break;
        }

        content.aiOptimized = true;
        await content.save();
      }
    } catch (error) {
      console.error("Error applying AI suggestion:", error);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  private extractKeywords(text: string): string[] {
    // Simple keyword extraction - in production, use NLP library
    const words = text.toLowerCase().split(' ');
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return words.filter(word => word.length > 3 && !stopWords.includes(word)).slice(0, 5);
  }

  private categorizeContent(title: string, bio: string): string {
    const text = (title + ' ' + bio).toLowerCase();
    
    if (text.includes('music') || text.includes('song') || text.includes('audio')) return 'music';
    if (text.includes('comedy') || text.includes('funny') || text.includes('joke')) return 'comedy';
    if (text.includes('education') || text.includes('learn') || text.includes('tutorial')) return 'education';
    if (text.includes('news') || text.includes('politics') || text.includes('current')) return 'news';
    if (text.includes('fashion') || text.includes('style') || text.includes('beauty')) return 'fashion';
    if (text.includes('food') || text.includes('cooking') || text.includes('recipe')) return 'food';
    if (text.includes('tech') || text.includes('technology') || text.includes('digital')) return 'technology';
    
    return 'general';
  }
}

export const creatorAIAssistantService = new CreatorAIAssistantService();
