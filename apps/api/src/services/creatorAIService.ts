import { CreatorModel } from "../models/Creator";
import { ContentModel } from "../models/Content";
import { OpenAI } from "openai";

interface ContentSummary {
  contentId: string;
  title: string;
  summary: string;
  keyPoints: string[];
  suggestedTags: string[];
  suggestedCategories: string[];
  estimatedReadTime: number;
  engagementPrediction: {
    likes: number;
    comments: number;
    shares: number;
  };
}

interface ContentSuggestion {
  type: "topic" | "format" | "timing" | "collaboration";
  title: string;
  description: string;
  reasoning: string;
  priority: "high" | "medium" | "low";
  estimatedImpact: string;
}

interface AudienceInsight {
  demographics: {
    ageGroups: Record<string, number>;
    gender: Record<string, number>;
    locations: Record<string, number>;
  };
  interests: Record<string, number>;
  engagementPatterns: {
    bestPostingTimes: string[];
    preferredContentTypes: Record<string, number>;
    peakEngagementDays: string[];
  };
  recommendations: string[];
}

class CreatorAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate AI summary for content
   */
  async generateContentSummary(contentId: string): Promise<ContentSummary> {
    try {
      const content = await ContentModel.findById(contentId).populate("creatorId");
      if (!content) {
        throw new Error("Content not found");
      }

      const prompt = `
        Analyze this content and provide a comprehensive summary and insights:
        
        Title: ${content.title}
        Description: ${content.description || ""}
        Transcript: ${content.transcript || ""}
        Tags: ${content.tags?.join(", ") || ""}
        
        Please provide:
        1. A concise summary (2-3 sentences)
        2. Key points (3-5 bullet points)
        3. Suggested tags (5-7 relevant tags)
        4. Suggested categories (2-3 categories)
        5. Estimated read/watch time in minutes
        6. Engagement prediction (likes, comments, shares)
        
        Format as JSON.
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert content analyst for a cultural platform focused on African content. Provide insightful, culturally aware analysis."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error("No response from AI");
      }

      const aiAnalysis = JSON.parse(response);

      return {
        contentId: content._id.toString(),
        title: content.title,
        summary: aiAnalysis.summary || "",
        keyPoints: aiAnalysis.keyPoints || [],
        suggestedTags: aiAnalysis.suggestedTags || [],
        suggestedCategories: aiAnalysis.suggestedCategories || [],
        estimatedReadTime: aiAnalysis.estimatedReadTime || 5,
        engagementPrediction: aiAnalysis.engagementPrediction || {
          likes: 0,
          comments: 0,
          shares: 0
        }
      };
    } catch (error) {
      console.error("Error generating content summary:", error);
      throw error;
    }
  }

  /**
   * Generate content suggestions for creator
   */
  async generateContentSuggestions(creatorId: string): Promise<ContentSuggestion[]> {
    try {
      const creator = await CreatorModel.findById(creatorId).populate({
        path: "userId",
        populate: {
          path: "profile"
        }
      });

      if (!creator) {
        throw new Error("Creator not found");
      }

      // Get creator's recent content
      const recentContent = await ContentModel.find({ creatorId })
        .sort({ createdAt: -1 })
        .limit(10);

      // Get creator's performance data
      const topPerformingContent = await ContentModel.find({ creatorId })
        .sort({ views: -1, engagement: -1 })
        .limit(5);

      const prompt = `
        Based on this creator's profile and content history, provide personalized content suggestions:
        
        Creator Profile:
        - Display Name: ${creator.displayName}
        - Bio: ${creator.bio}
        - Tier: ${creator.tier}
        - Total Content: ${creator.stats.totalContent}
        - Total Followers: ${creator.stats.totalFollowers}
        
        Recent Content Topics:
        ${recentContent.map(c => `- ${c.title}: ${c.description || "No description"}`).join("\n")}
        
        Top Performing Content:
        ${topPerformingContent.map(c => `- ${c.title} (${c.views} views, ${c.engagement} engagement)`).join("\n")}
        
        Creator Interests (from profile):
        ${creator.userId?.profile?.interests ? Object.keys(creator.userId.profile.interests).join(", ") : "Not specified"}
        
        Please provide 5-7 content suggestions covering:
        1. Topic ideas based on their audience and performance
        2. Format suggestions (video, audio, debate, etc.)
        3. Optimal posting timing
        4. Collaboration opportunities
        
        For each suggestion, include:
        - type (topic/format/timing/collaboration)
        - title (catchy headline)
        - description (detailed explanation)
        - reasoning (why this would work)
        - priority (high/medium/low)
        - estimated impact (expected outcome)
        
        Format as JSON array.
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert content strategist for African creators. Provide actionable, culturally relevant suggestions that align with the MAATFEED platform's focus on African culture, philosophy, and knowledge sharing."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1500,
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error("No response from AI");
      }

      return JSON.parse(response);
    } catch (error) {
      console.error("Error generating content suggestions:", error);
      throw error;
    }
  }

  /**
   * Generate audience insights for creator
   */
  async generateAudienceInsights(creatorId: string): Promise<AudienceInsight> {
    try {
      const creator = await CreatorModel.findById(creatorId);
      if (!creator) {
        throw new Error("Creator not found");
      }

      // Get creator's content engagement data
      const contentAnalytics = await ContentModel.aggregate([
        { $match: { creatorId: creator._id } },
        {
          $group: {
            _id: null,
            totalViews: { $sum: "$views" },
            totalEngagement: { $sum: "$engagement" },
            avgViewsPerContent: { $avg: "$views" },
            contentByType: {
              $push: {
                type: "$type",
                views: "$views",
                engagement: "$engagement",
                createdAt: "$createdAt"
              }
            }
          }
        }
      ]);

      const prompt = `
        Analyze this creator's audience data and provide insights:
        
        Creator Stats:
        - Total Followers: ${creator.stats.totalFollowers}
        - Total Content: ${creator.stats.totalContent}
        - Total Views: ${creator.stats.totalViews}
        - Total Engagement: ${creator.stats.totalEngagement}
        - Avg Watch Time: ${creator.stats.avgWatchTime} seconds
        - Follower Growth: ${creator.stats.followerGrowth}%
        
        Content Performance:
        ${JSON.stringify(contentAnalytics[0] || {}, null, 2)}
        
        Creator Categories/Interests:
        ${creator.userId?.profile?.interests ? Object.keys(creator.userId.profile.interests).join(", ") : "Not specified"}
        
        Please provide detailed audience insights including:
        1. Demographics breakdown (age, gender, location estimates)
        2. Interest analysis (what topics resonate most)
        3. Engagement patterns (best posting times, preferred content types, peak days)
        4. Actionable recommendations (3-5 specific recommendations)
        
        Format as JSON with the structure: demographics, interests, engagementPatterns, recommendations.
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert audience analyst for digital content platforms. Provide data-driven insights with practical recommendations for content creators."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 1200,
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error("No response from AI");
      }

      return JSON.parse(response);
    } catch (error) {
      console.error("Error generating audience insights:", error);
      throw error;
    }
  }

  /**
   * Generate optimal posting schedule
   */
  async generateOptimalSchedule(creatorId: string): Promise<{
    bestDays: string[];
    bestTimes: string[];
    reasoning: string;
    recommendations: string[];
  }> {
    try {
      const creator = await CreatorModel.findById(creatorId);
      if (!creator) {
        throw new Error("Creator not found");
      }

      // Get content performance by day/time
      const contentByTime = await ContentModel.aggregate([
        { $match: { creatorId: creator._id } },
        {
          $group: {
            _id: {
              dayOfWeek: { $dayOfWeek: "$createdAt" },
              hour: { $hour: "$createdAt" }
            },
            avgViews: { $avg: "$views" },
            avgEngagement: { $avg: "$engagement" },
            contentCount: { $sum: 1 }
          }
        },
        { $sort: { avgViews: -1, avgEngagement: -1 } },
        { $limit: 10 }
      ]);

      const prompt = `
        Analyze this creator's posting schedule data and recommend optimal times:
        
        Creator: ${creator.displayName}
        Followers: ${creator.stats.totalFollowers}
        Timezone: Assume UTC+1 (West Africa Time)
        
        Content Performance by Day/Time:
        ${JSON.stringify(contentByTime, null, 2)}
        
        Please provide:
        1. Best days to post (3-4 days)
        2. Best times to post (specific hours)
        3. Reasoning for recommendations
        4. Specific scheduling recommendations (3-4 actionable tips)
        
        Consider African audience patterns, mobile usage, and content consumption habits.
        Format as JSON.
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert in social media scheduling for African audiences. Consider mobile-first usage patterns, internet access times, and cultural factors."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error("No response from AI");
      }

      return JSON.parse(response);
    } catch (error) {
      console.error("Error generating optimal schedule:", error);
      throw error;
    }
  }

  /**
   * Generate content title suggestions
   */
  async generateTitleSuggestions(
    creatorId: string,
    contentDescription: string,
    contentType: "video" | "audio" | "debate" | "article"
  ): Promise<string[]> {
    try {
      const creator = await CreatorModel.findById(creatorId);
      if (!creator) {
        throw new Error("Creator not found");
      }

      const prompt = `
        Generate 5-7 compelling titles for this content:
        
        Creator: ${creator.displayName}
        Bio: ${creator.bio}
        Content Type: ${contentType}
        Description: ${contentDescription}
        
        Guidelines:
        - Titles should be engaging and clickable
        - Include relevant keywords for discoverability
        - Reflect African cultural context when appropriate
        - Keep titles under 60 characters when possible
        - Use numbers, questions, or emotional triggers when suitable
        
        Return as a JSON array of strings.
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert copywriter for digital content. Create titles that are engaging, SEO-friendly, and culturally appropriate for African audiences."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 400,
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error("No response from AI");
      }

      return JSON.parse(response);
    } catch (error) {
      console.error("Error generating title suggestions:", error);
      throw error;
    }
  }
}

export const creatorAIService = new CreatorAIService();
