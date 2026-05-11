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
  MoreVertical
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
  isFollowing?: boolean;
}

interface ContentItem {
  _id: string;
  title: string;
  thumbnail?: string;
  duration?: number;
  views: number;
  createdAt: string;
  type: "video" | "audio";
}

export default function CreatorProfilePage() {
  const { creatorId } = useParams<{ creatorId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [creator, setCreator] = useState<CreatorData | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!creatorId) return;
    
    fetchCreatorData();
    fetchCreatorContent();
  }, [creatorId]);

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
                </div>
              </div>

              {/* Name and Bio */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{creator.displayName}</h1>
                  {creator.verificationBadge.isVerified && (
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-4">{creator.bio}</p>
                
                {/* Tier Badge */}
                <div className="inline-flex items-center gap-2 bg-orange-500/20 px-3 py-1 rounded-full text-orange-400 text-sm">
                  {creator.tier === "premium" ? "⭐ Premium" : 
                   creator.tier === "pro" ? "💎 Pro" : "🎯 Basic"}
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

              {/* Follow Button */}
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

          {/* Right Column - Content */}
          <div className="lg:w-2/3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Content</h2>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" className="px-3 py-1">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                  <Button variant="secondary" className="px-3 py-1">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
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
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
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
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
