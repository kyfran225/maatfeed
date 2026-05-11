import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  Calendar,
  MapPin,
  Link as LinkIcon,
  CheckCircle,
  TrendingUp,
  Play,
  MoreVertical,
  BarChart3,
  Settings,
  Sparkles,
  DollarSign,
  Zap,
  Target,
  Lightbulb,
  Download,
  Upload,
  Edit3,
  RefreshCw,
  Clock,
  Star,
  Award,
  Gift,
  Crown,
  FileText,
  Image,
  Tag
} from "lucide-react";
import { SEO } from "../../components/SEO";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";

interface CreatorData {
  _id: string;
  userId: string;
  displayName: string;
  bio: string;
  avatar?: string;
  coverImage?: string;
  socialLinks: {
    website?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };
  status: string;
  tier: string;
  verificationBadge: {
    isVerified: boolean;
    verifiedAt?: string;
    verificationMethod?: string;
  };
  stats: {
    totalFollowers: number;
    totalContent: number;
    totalViews: number;
    totalEngagement: number;
    avgWatchTime: number;
    followerGrowth: number;
  };
  monetization: {
    isEnabled: boolean;
    totalEarnings: number;
    monthlyEarnings: number;
    sponsorCount: number;
    subscriptionCount: number;
  };
  aiAssistance: {
    isEnabled: boolean;
    contentSuggestions: boolean;
    audienceInsights: boolean;
    autoSummaries: boolean;
  };
  isFollowing?: boolean;
  isOwner?: boolean;
}

interface ContentItem {
  _id: string;
  title: string;
  thumbnail?: string;
  duration?: number;
  views: number;
  engagement: number;
  createdAt: string;
  type: "video" | "audio";
  aiOptimized?: boolean;
}

interface AnalyticsData {
  period: "daily" | "weekly" | "monthly";
  views: number;
  engagement: number;
  revenue: number;
  followers: number;
  topContent: Array<{
    title: string;
    views: number;
    engagement: number;
  }>;
}

interface AISuggestion {
  type: "title" | "description" | "thumbnail" | "tags";
  suggestion: string;
  confidence: number;
  reason: string;
}

export default function CreatorProfilePageAdvanced() {
  const { creatorId } = useParams<{ creatorId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [creator, setCreator] = useState<CreatorData | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "analytics" | "tools" | "monetization">("content");
  const [showDropdown, setShowDropdown] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");

  useEffect(() => {
    if (!creatorId) return;
    
    fetchCreatorData();
    fetchCreatorContent();
    fetchAnalytics();
    fetchAISuggestions();
  }, [creatorId, analyticsPeriod]);

  const fetchCreatorData = async () => {
    try {
      const response = await fetch(`/api/creator/${creatorId}`);
      if (!response.ok) throw new Error("Creator not found");
      
      const data = await response.json();
      setCreator(data.data);
      setFollowing(data.data.isFollowing || false);
    } catch (error) {
      console.error("Error fetching creator:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchCreatorContent = async () => {
    try {
      const response = await fetch(`/api/content/creator/${creatorId}`);
      if (!response.ok) return;
      
      const data = await response.json();
      setContent(data.data || []);
    } catch (error) {
      console.error("Error fetching content:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/creator/${creatorId}/analytics?period=${analyticsPeriod}`);
      if (!response.ok) return;
      
      const data = await response.json();
      setAnalytics(data.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const fetchAISuggestions = async () => {
    try {
      const response = await fetch(`/api/creator/${creatorId}/ai-suggestions`);
      if (!response.ok) return;
      
      const data = await response.json();
      setAiSuggestions(data.data || []);
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
    }
  };

  const handleFollow = async () => {
    if (!profile) {
      navigate("/auth/login");
      return;
    }

    try {
      const response = await fetch(`/api/creator/${creatorId}/follow`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.ok) {
        setFollowing(true);
        setCreator(prev => prev ? {
          ...prev,
          stats: {
            ...prev.stats,
            totalFollowers: prev.stats.totalFollowers + 1
          }
        } : null);
      }
    } catch (error) {
      console.error("Error following creator:", error);
    }
  };

  const handleUnfollow = async () => {
    try {
      const response = await fetch(`/api/creator/${creatorId}/follow`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.ok) {
        setFollowing(false);
        setCreator(prev => prev ? {
          ...prev,
          stats: {
            ...prev.stats,
            totalFollowers: prev.stats.totalFollowers - 1
          }
        } : null);
      }
    } catch (error) {
      console.error("Error unfollowing creator:", error);
    }
  };

  const handleAISuggestion = async (suggestion: AISuggestion) => {
    try {
      const response = await fetch(`/api/creator/${creatorId}/apply-ai-suggestion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ suggestion })
      });

      if (response.ok) {
        setAiSuggestions(prev => prev.filter(s => s !== suggestion));
        fetchCreatorContent(); // Refresh content
      }
    } catch (error) {
      console.error("Error applying AI suggestion:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Creator not found</h1>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <SEO 
        title={`${creator.displayName} - MAATFEED Creator`}
        description={creator.bio}
      />

      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-orange-500/20 to-orange-600/20">
        {creator.coverImage && (
          <img
            src={creator.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Action Buttons */}
        {creator.isOwner && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="secondary" className="bg-black/50 px-3 py-2">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="secondary" className="bg-black/50 px-3 py-2">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className="container mx-auto px-4 -mt-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:w-1/3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 rounded-xl p-6 border border-gray-800"
            >
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  {creator.avatar ? (
                    <img
                      src={creator.avatar}
                      alt={creator.displayName}
                      className="w-32 h-32 rounded-full border-4 border-orange-500"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-700 border-4 border-gray-800 flex items-center justify-center">
                      <span className="text-4xl font-bold text-gray-400">
                        {creator.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {creator.verificationBadge.isVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  )}
                  
                  {/* AI Badge */}
                  {creator.aiAssistance.isEnabled && (
                    <div className="absolute -top-2 -right-2 bg-purple-500 rounded-full p-2">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Name and Bio */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{creator.displayName}</h1>
                  {creator.verificationBadge.isVerified && (
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  )}
                  {creator.aiAssistance.isEnabled && (
                    <Sparkles className="w-5 h-5 text-purple-500" />
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-4">{creator.bio}</p>
                
                {/* Tier Badge */}
                <div className="inline-flex items-center gap-2 bg-orange-500/20 px-3 py-1 rounded-full text-orange-400 text-sm">
                  {creator.tier === "premium" ? "⭐ Premium Creator" : 
                   creator.tier === "pro" ? "💎 Pro Creator" : "🎯 Basic Creator"}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-400">
                    {creator.stats.totalFollowers.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-400">
                    {creator.stats.totalContent}
                  </div>
                  <div className="text-xs text-gray-400">Content</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-400">
                    {creator.stats.totalViews.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Views</div>
                </div>
              </div>

              {/* Growth Indicator */}
              <div className="mb-6 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-400">Growth Rate</span>
                  <span className="text-sm font-bold text-green-400">
                    +{creator.stats.followerGrowth}%
                  </span>
                </div>
              </div>

              {/* Follow Button */}
              {!creator.isOwner && (
                <div className="mb-6">
                  {following ? (
                    <Button
                      onClick={handleUnfollow}
                      variant="secondary"
                      className="w-full"
                    >
                      Following
                    </Button>
                  ) : (
                    <Button
                      onClick={handleFollow}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      Follow
                    </Button>
                  )}
                </div>
              )}

              {/* Monetization Status */}
              {creator.monetization.isEnabled && (
                <div className="mb-6 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-yellow-400">Monthly Earnings</span>
                    <DollarSign className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="text-lg font-bold text-yellow-400">
                    ₣{creator.monetization.monthlyEarnings.toLocaleString()}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>{creator.monetization.sponsorCount} sponsors</span>
                    <span>{creator.monetization.subscriptionCount} subscribers</span>
                  </div>
                </div>
              )}

              {/* Social Links */}
              {Object.values(creator.socialLinks).some(link => link) && (
                <div className="space-y-2">
                  {creator.socialLinks.website && (
                    <a
                      href={creator.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-colors"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span className="text-sm">Website</span>
                    </a>
                  )}
                  {creator.socialLinks.twitter && (
                    <a
                      href={`https://twitter.com/${creator.socialLinks.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-colors"
                    >
                      <span className="text-sm">Twitter</span>
                    </a>
                  )}
                  {creator.socialLinks.youtube && (
                    <a
                      href={`https://youtube.com/${creator.socialLinks.youtube}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-colors"
                    >
                      <span className="text-sm">YouTube</span>
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Content and Tools */}
          <div className="lg:w-2/3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Navigation Tabs */}
              <div className="flex border-b border-gray-800 mb-6">
                {[
                  { id: "content", label: "Content", icon: Play },
                  { id: "analytics", label: "Analytics", icon: BarChart3 },
                  ...(creator.isOwner ? [
                    { id: "tools", label: "AI Tools", icon: Sparkles },
                    { id: "monetization", label: "Monetization", icon: DollarSign }
                  ] : [])
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-orange-500 text-orange-400"
                        : "border-transparent text-gray-400 hover:text-white"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Content Tab */}
              {activeTab === "content" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Content</h2>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" className="px-3 py-1">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Sort by Performance
                      </Button>
                      {creator.isOwner && (
                        <Button className="px-3 py-1 bg-orange-500 hover:bg-orange-600">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Content Grid */}
                  {content.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {content.map((item) => (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.05 }}
                          className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-orange-500 transition-colors cursor-pointer"
                          onClick={() => navigate(`/content/${item._id}`)}
                        >
                          {/* Thumbnail */}
                          <div className="relative aspect-video bg-gray-800">
                            {item.thumbnail ? (
                              <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Play className="w-12 h-12 text-gray-600" />
                              </div>
                            )}
                            
                            {/* AI Optimized Badge */}
                            {item.aiOptimized && (
                              <div className="absolute top-2 left-2 bg-purple-500 px-2 py-1 rounded text-xs flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                AI Optimized
                              </div>
                            )}
                            
                            {/* Duration */}
                            {item.duration && (
                              <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs">
                                {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                              </div>
                            )}
                          </div>

                          {/* Content Info */}
                          <div className="p-4">
                            <h3 className="font-medium text-sm mb-2 line-clamp-2">
                              {item.title}
                            </h3>
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <span>{item.views.toLocaleString()} views</span>
                              <span>{item.engagement}% engagement</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-900 rounded-xl p-12 border border-gray-800 text-center">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Play className="w-8 h-8 text-gray-600" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No content yet</h3>
                      <p className="text-gray-400 text-sm">
                        This creator hasn't published any content yet.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === "analytics" && analytics && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Analytics</h2>
                    <div className="flex gap-2">
                      {["daily", "weekly", "monthly"].map((period) => (
                        <Button
                          key={period}
                          variant={analyticsPeriod === period ? "primary" : "secondary"}
                          className={`px-3 py-1 ${analyticsPeriod === period ? "bg-orange-500" : ""}`}
                          onClick={() => setAnalyticsPeriod(period as any)}
                        >
                          {period.charAt(0).toUpperCase() + period.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Analytics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <Eye className="w-5 h-5 text-blue-400" />
                        <span className="text-xs text-gray-400">Views</span>
                      </div>
                      <div className="text-2xl font-bold">{analytics.views.toLocaleString()}</div>
                    </div>
                    
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <Heart className="w-5 h-5 text-red-400" />
                        <span className="text-xs text-gray-400">Engagement</span>
                      </div>
                      <div className="text-2xl font-bold">{analytics.engagement}%</div>
                    </div>
                    
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <Users className="w-5 h-5 text-green-400" />
                        <span className="text-xs text-gray-400">Followers</span>
                      </div>
                      <div className="text-2xl font-bold">+{analytics.followers}</div>
                    </div>
                    
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-5 h-5 text-yellow-400" />
                        <span className="text-xs text-gray-400">Revenue</span>
                      </div>
                      <div className="text-2xl font-bold">₣{analytics.revenue.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Top Content */}
                  <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                    <h3 className="text-lg font-semibold mb-4">Top Performing Content</h3>
                    <div className="space-y-3">
                      {analytics.topContent.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                          <div>
                            <h4 className="font-medium">{item.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>{item.views.toLocaleString()} views</span>
                              <span>{item.engagement}% engagement</span>
                            </div>
                          </div>
                          <div className="text-orange-400">
                            #{index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* AI Tools Tab */}
              {activeTab === "tools" && creator.isOwner && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">AI Assistant Tools</h2>
                    <Button variant="secondary" className="px-3 py-1">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Suggestions
                    </Button>
                  </div>

                  {/* AI Suggestions */}
                  {aiSuggestions.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-4">AI Suggestions</h3>
                      <div className="space-y-3">
                        {aiSuggestions.map((suggestion, index) => (
                          <div key={index} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {suggestion.type === "title" && <Edit3 className="w-4 h-4 text-blue-400" />}
                                {suggestion.type === "description" && <FileText className="w-4 h-4 text-green-400" />}
                                {suggestion.type === "thumbnail" && <Image className="w-4 h-4 text-purple-400" />}
                                {suggestion.type === "tags" && <Tag className="w-4 h-4 text-orange-400" />}
                                <span className="text-sm font-medium capitalize">{suggestion.type}</span>
                                <span className="text-xs text-gray-400">{Math.round(suggestion.confidence * 100)}% confidence</span>
                              </div>
                              <Button
                                onClick={() => handleAISuggestion(suggestion)}
                                className="bg-purple-500 hover:bg-purple-600 px-3 py-1"
                              >
                                Apply
                              </Button>
                            </div>
                            <p className="text-sm text-gray-300 mb-2">{suggestion.suggestion}</p>
                            <p className="text-xs text-gray-500">{suggestion.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Tools Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <Lightbulb className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">Title Optimizer</h3>
                          <p className="text-sm text-gray-400">AI-powered title suggestions</p>
                        </div>
                      </div>
                      <Button className="w-full bg-blue-500 hover:bg-blue-600">
                        Generate Titles
                      </Button>
                    </div>

                    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <Target className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">Audience Insights</h3>
                          <p className="text-sm text-gray-400">Understand your audience better</p>
                        </div>
                      </div>
                      <Button className="w-full bg-green-500 hover:bg-green-600">
                        View Insights
                      </Button>
                    </div>

                    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <Image className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">Thumbnail Generator</h3>
                          <p className="text-sm text-gray-400">AI-generated thumbnails</p>
                        </div>
                      </div>
                      <Button className="w-full bg-purple-500 hover:bg-purple-600">
                        Create Thumbnail
                      </Button>
                    </div>

                    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                          <Zap className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">Content Ideas</h3>
                          <p className="text-sm text-gray-400">Trending topics for your niche</p>
                        </div>
                      </div>
                      <Button className="w-full bg-orange-500 hover:bg-orange-600">
                        Get Ideas
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Monetization Tab */}
              {activeTab === "monetization" && creator.isOwner && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Monetization</h2>
                    <Button className="px-3 py-1 bg-green-500 hover:bg-green-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Setup Payouts
                    </Button>
                  </div>

                  {/* Revenue Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                          <Crown className="w-5 h-5 text-yellow-400" />
                        </div>
                        <span className="text-xs text-green-400">+12%</span>
                      </div>
                      <div className="text-2xl font-bold mb-1">₣{creator.monetization.monthlyEarnings.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">Monthly Revenue</div>
                    </div>

                    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-xs text-green-400">+8%</span>
                      </div>
                      <div className="text-2xl font-bold mb-1">{creator.monetization.sponsorCount}</div>
                      <div className="text-sm text-gray-400">Active Sponsors</div>
                    </div>

                    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <Star className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-xs text-green-400">+15%</span>
                      </div>
                      <div className="text-2xl font-bold mb-1">{creator.monetization.subscriptionCount}</div>
                      <div className="text-sm text-gray-400">Subscribers</div>
                    </div>
                  </div>

                  {/* Monetization Options */}
                  <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                    <h3 className="text-lg font-semibold mb-4">Monetization Options</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium">Sponsorships</h4>
                          <p className="text-sm text-gray-400">Accept sponsorships from fans</p>
                        </div>
                        <Button variant="secondary">Configure</Button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium">Premium Subscriptions</h4>
                          <p className="text-sm text-gray-400">Offer exclusive content to subscribers</p>
                        </div>
                        <Button variant="secondary">Setup</Button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium">Donations</h4>
                          <p className="text-sm text-gray-400">Receive one-time donations</p>
                        </div>
                        <Button variant="secondary">Enable</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
