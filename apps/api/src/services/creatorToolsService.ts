import { CreatorModel, ICreator } from "../models/Creator";
import { ContentModel, IContent } from "../models/Content";
import OpenAI from "openai";
import { v2 as cloudinary } from "cloudinary";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface ThumbnailGenerationRequest {
  contentType: "video" | "audio";
  title: string;
  description?: string;
  style?: "modern" | "classic" | "bold" | "minimalist";
  colors?: string[];
  textOverlay?: boolean;
}

export interface GeneratedThumbnail {
  url: string;
  publicId: string;
  prompt: string;
  style: string;
  optimizedFor: string;
}

export interface DescriptionOptimization {
  original: string;
  optimized: string;
  improvements: string[];
  seoScore: number;
  engagementPrediction: number;
  suggestedHashtags: string[];
  characterCount: number;
}

export interface ContentIdea {
  title: string;
  description: string;
  category: string;
  estimatedEngagement: number;
  difficulty: "easy" | "medium" | "hard";
  resources: string[];
  trending: boolean;
}

export interface ThumbnailTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  style: string;
  elements: string[];
}

class CreatorToolsService {
  /**
   * Generate AI-powered thumbnail
   */
  async generateThumbnail(request: ThumbnailGenerationRequest, creatorId: string): Promise<GeneratedThumbnail> {
    try {
      const creator = await CreatorModel.findById(creatorId);
      if (!creator) {
        throw new Error("Creator not found");
      }

      // Generate AI prompt for thumbnail
      const prompt = await this.generateThumbnailPrompt(request, creator);

      // Generate image using DALL-E or similar
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        size: "1024x1024",
        quality: "standard",
        n: 1,
      });

      if (!imageResponse.data || !imageResponse.data[0]?.url) {
        throw new Error("Failed to generate image");
      }

      // Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(imageResponse.data[0].url, {
        folder: `creator-thumbnails/${creatorId}`,
        public_id: `thumbnail-${Date.now()}`,
        resource_type: "image",
        transformation: [
          { crop: "fill", width: 1280, height: 720 },
          { quality: "auto" }
        ]
      });

      return {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        prompt,
        style: request.style || "modern",
        optimizedFor: `${request.contentType} content`
      };
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      throw error;
    }
  }

  /**
   * Generate AI prompt for thumbnail creation
   */
  private async generateThumbnailPrompt(request: ThumbnailGenerationRequest, creator: ICreator): Promise<string> {
    try {
      const basePrompt = `
        Create a professional thumbnail for ${request.contentType} content titled "${request.title}".
        Creator: ${creator.displayName}
        Description: ${request.description || ''}
        Style: ${request.style || 'modern'}
        Colors: ${request.colors?.join(', ') || 'orange and black theme'}
        Text overlay: ${request.textOverlay ? 'Include title text' : 'No text overlay'}
        
        Requirements:
        - High resolution, professional quality
        - Eye-catching and visually appealing
        - Suitable for African audience
        - Mobile-optimized (16:9 aspect ratio)
        - Brand consistent with MAATFEED (orange #FF6B35 accent)
        - Clear focal point
        - Good contrast and readability
        
        Scene: ${this.generateThumbnailScene(request.contentType, request.title, creator.bio)}
      `;

      return basePrompt.trim();
    } catch (error) {
      console.error("Error generating thumbnail prompt:", error);
      throw error;
    }
  }

  /**
   * Generate thumbnail scene based on content type
   */
  private generateThumbnailScene(contentType: string, title: string, creatorBio: string): string {
    const scenes = {
      video: [
        "dynamic action scene with video elements",
        "professional studio setup with camera equipment",
        "engaging speaker or presenter",
        "cinematic scene related to the topic"
      ],
      audio: [
        "sound waves and audio visualization",
        "microphone and recording equipment",
        "musical instruments or podcast setup",
        "abstract sound patterns and frequencies"
      ]
    };

    const contentTypeScenes = scenes[contentType as keyof typeof scenes] || scenes.video;
    return contentTypeScenes[Math.floor(Math.random() * contentTypeScenes.length)];
  }

  /**
   * Optimize content description
   */
  async optimizeDescription(contentId: string, creatorId: string): Promise<DescriptionOptimization> {
    try {
      const content = await ContentModel.findById(contentId);
      if (!content) {
        throw new Error("Content not found");
      }

      const creator = await CreatorModel.findById(creatorId);
      if (!creator) {
        throw new Error("Creator not found");
      }

      const original = content.description || "";
      
      const prompt = `
        Optimize this content description for better engagement and SEO:
        
        Original: "${original}"
        Title: "${content.title}"
        Creator: ${creator.displayName}
        Creator bio: ${creator.bio}
        Content type: ${content.type}
        
        Requirements:
        - Keep under 300 characters for optimal mobile viewing
        - Include relevant keywords for SEO
        - Add compelling hook in first 2 lines
        - Include call-to-action
        - Use emojis appropriately
        - Add relevant hashtags
        - Maintain creator's authentic voice
        - Optimize for African audience
        
        Return JSON with:
        {
          "optimized": "optimized description",
          "improvements": ["list of improvements"],
          "seoScore": 0-100,
          "engagementPrediction": 0-100,
          "suggestedHashtags": ["hashtag1", "hashtag2"],
          "characterCount": number
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");

      return {
        original,
        optimized: result.optimized || original,
        improvements: result.improvements || [],
        seoScore: result.seoScore || 50,
        engagementPrediction: result.engagementPrediction || 50,
        suggestedHashtags: result.suggestedHashtags || [],
        characterCount: result.characterCount || original.length
      };
    } catch (error) {
      console.error("Error optimizing description:", error);
      throw error;
    }
  }

  /**
   * Generate content ideas based on trends and creator profile
   */
  async generateContentIdeas(creatorId: string, category?: string): Promise<ContentIdea[]> {
    try {
      const creator = await CreatorModel.findById(creatorId);
      if (!creator) {
        throw new Error("Creator not found");
      }

      const recentContent = await ContentModel.find({ 
        creatorId, 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      }).sort({ createdAt: -1 }).limit(10);

      const prompt = `
        Generate 5 content ideas for ${creator.displayName} based on their profile and recent content.
        
        Creator profile: ${creator.displayName} - ${creator.bio}
        Recent content: ${recentContent.map(c => c.title).join(', ')}
        Category filter: ${category || 'all categories'}
        
        Requirements:
        - Relevant to African audience and culture
        - Aligned with creator's niche and style
        - Based on current trending topics in Africa
        - Include estimated engagement potential
        - Specify difficulty level (resources needed)
        - Include trending topics where applicable
        
        Return JSON array with:
        [{
          "title": "content title",
          "description": "content description",
          "category": "content category",
          "estimatedEngagement": 0-100,
          "difficulty": "easy|medium|hard",
          "resources": ["resource1", "resource2"],
          "trending": true/false
        }]
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 1000,
      });

      const ideas = JSON.parse(response.choices[0].message.content || "[]");
      
      return ideas.map((idea: any) => ({
        title: idea.title,
        description: idea.description,
        category: idea.category,
        estimatedEngagement: idea.estimatedEngagement,
        difficulty: idea.difficulty,
        resources: idea.resources || [],
        trending: idea.trending || false
      }));
    } catch (error) {
      console.error("Error generating content ideas:", error);
      throw error;
    }
  }

  /**
   * Get thumbnail templates
   */
  async getThumbnailTemplates(): Promise<ThumbnailTemplate[]> {
    const templates: ThumbnailTemplate[] = [
      {
        id: "modern-bold",
        name: "Modern Bold",
        description: "Clean design with bold typography and vibrant colors",
        preview: "/templates/modern-bold.jpg",
        style: "modern",
        elements: ["Bold text", "Gradient background", "Geometric shapes"]
      },
      {
        id: "classic-elegant",
        name: "Classic Elegant",
        description: "Timeless design with elegant typography and subtle colors",
        preview: "/templates/classic-elegant.jpg",
        style: "classic",
        elements: ["Elegant text", "Soft gradients", "Minimalist design"]
      },
      {
        id: "trending-vibrant",
        name: "Trending Vibrant",
        description: "Eye-catching design with trending colors and dynamic elements",
        preview: "/templates/trending-vibrant.jpg",
        style: "bold",
        elements: ["Vibrant colors", "Dynamic text", "Trending patterns"]
      },
      {
        id: "minimalist-clean",
        name: "Minimalist Clean",
        description: "Simple and clean design focusing on typography",
        preview: "/templates/minimalist-clean.jpg",
        style: "minimalist",
        elements: ["Clean text", "White space", "Simple colors"]
      }
    ];

    return templates;
  }

  /**
   * Apply thumbnail template to content
   */
  async applyThumbnailTemplate(contentId: string, templateId: string, creatorId: string): Promise<GeneratedThumbnail> {
    try {
      const content = await ContentModel.findById(contentId);
      if (!content) {
        throw new Error("Content not found");
      }

      const templates = await this.getThumbnailTemplates();
      const template = templates.find(t => t.id === templateId);
      
      if (!template) {
        throw new Error("Template not found");
      }

      const request: ThumbnailGenerationRequest = {
        contentType: content.type,
        title: content.title,
        description: content.description,
        style: template.style as any,
        textOverlay: true
      };

      return await this.generateThumbnail(request, creatorId);
    } catch (error) {
      console.error("Error applying thumbnail template:", error);
      throw error;
    }
  }

  /**
   * Batch optimize multiple content items
   */
  async batchOptimizeContent(contentIds: string[], creatorId: string): Promise<DescriptionOptimization[]> {
    try {
      const optimizations = await Promise.all(
        contentIds.map(async (contentId) => {
          try {
            return await this.optimizeDescription(contentId, creatorId);
          } catch (error) {
            console.error(`Error optimizing content ${contentId}:`, error);
            return null;
          }
        })
      );

      return optimizations.filter(opt => opt !== null) as DescriptionOptimization[];
    } catch (error) {
      console.error("Error in batch optimization:", error);
      throw error;
    }
  }

  /**
   * Get trending topics for content ideas
   */
  async getTrendingTopics(region?: string): Promise<string[]> {
    try {
      // In a real implementation, this would integrate with Twitter API, Google Trends, etc.
      // For now, return mock trending topics for Africa
      const trendingTopics = [
        "Afrobeats Music",
        "African Fashion Week",
        "Tech Innovation in Africa",
        "African Cuisine",
        "Nollywood Movies",
        "Pan-African Business",
        "Sustainable Development",
        "African Art & Culture",
        "Mobile Banking Africa",
        "Renewable Energy Africa",
        "African Startups",
        "Digital Content Creation"
      ];

      return trendingTopics;
    } catch (error) {
      console.error("Error getting trending topics:", error);
      return [];
    }
  }

  /**
   * Analyze content performance and suggest improvements
   */
  async analyzeContentPerformance(contentId: string): Promise<{
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    overallScore: number;
  }> {
    try {
      const content = await ContentModel.findById(contentId).populate('creatorId');
      if (!content) {
        throw new Error("Content not found");
      }

      const prompt = `
        Analyze this content's performance and provide actionable insights:
        
        Title: ${content.title}
        Description: ${content.description || 'None'}
        Type: ${content.type}
        Views: ${content.views}
        Engagement: ${content.engagement || 0}
        Creator: ${(content.creatorId as any).displayName}
        
        Provide analysis in JSON format:
        {
          "strengths": ["strength1", "strength2"],
          "weaknesses": ["weakness1", "weakness2"],
          "suggestions": ["suggestion1", "suggestion2"],
          "overallScore": 0-100
        }
        
        Focus on:
        - Title effectiveness
        - Description quality
        - Engagement potential
        - SEO optimization
        - Audience appeal
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");

      return {
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        suggestions: analysis.suggestions || [],
        overallScore: analysis.overallScore || 50
      };
    } catch (error) {
      console.error("Error analyzing content performance:", error);
      throw error;
    }
  }
}

export const creatorToolsService = new CreatorToolsService();
