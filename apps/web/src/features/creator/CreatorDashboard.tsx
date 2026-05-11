import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Play,
  BarChart3,
  Settings,
  Download,
  RefreshCw
} from "lucide-react";
import { SEO } from "../../components/SEO";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

interface CreatorStats {
  totalFollowers: number;
  totalContent: number;
  totalViews: number;
  totalEngagement: number;
  avgWatchTime: number;
  followerGrowth: number;
}

interface AnalyticsData {
  content: {
    totalViews: number;
    uniqueViews: number;
    avgWatchTime: number;
    completionRate: number;
    shares: number;
    downloads: number;
  };
  engagement: {
    likes: number;
    comments: number;
    replies: number;
    mentions: number;
    newFollowers: number;
    unfollows: number;
  };
  audience: {
    totalFollowers: number;
    activeFollowers: number;
    newFollowers: number;
  };
  revenue: {
    total: number;
    fromSponsors: number;
    fromPremium: number;
    fromDonations: number;
    transactions: number;
  };
  growth: {
    followerGrowthRate: number;
    viewGrowthRate: number;
    engagementGrowthRate: number;
  };
}

interface TopContent {
  contentId: string;
  title: string;
  views: number;
  engagement: number;
  completionRate: number;
}

export default function CreatorDashboard() {
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [topContent, setTopContent] = useState<TopContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState(30); // days

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/creator/dashboard', {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) throw new Error("Failed to fetch dashboard data");

      const data = await response.json();
      setStats(data.data.stats);
      setAnalytics(data.data.recentAnalytics?.[0] || null);
      setTopContent(data.data.topContent || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <SEO 
        title="Creator Dashboard - MAATFEED"
        description="Manage your creator profile and track your performance"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
            <p className="text-gray-400">Track your content performance and audience growth</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-orange-500" />
                <span className={`text-sm font-medium ${
                  stats.followerGrowth >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stats.followerGrowth >= 0 ? '+' : ''}{stats.followerGrowth}%
                </span>
              </div>
              <div className="text-2xl font-bold mb-1">
                {stats.totalFollowers.toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">Total Followers</div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
              <div className="text-2xl font-bold mb-1">
                {stats.totalViews.toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">Total Views</div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <Heart className="w-8 h-8 text-red-500" />
              </div>
              <div className="text-2xl font-bold mb-1">
                {stats.totalEngagement.toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">Total Engagement</div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <Play className="w-8 h-8 text-purple-500" />
              </div>
              <div className="text-2xl font-bold mb-1">
                {Math.floor(stats.avgWatchTime / 60)}:{(stats.avgWatchTime % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-gray-400 text-sm">Avg Watch Time</div>
            </div>
          </motion.div>
        )}

        {/* Detailed Analytics */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          >
            {/* Content Performance */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-500" />
                Content Performance
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Views</span>
                  <span className="font-semibold">{analytics.content.totalViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Unique Views</span>
                  <span className="font-semibold">{analytics.content.uniqueViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Avg Watch Time</span>
                  <span className="font-semibold">
                    {Math.floor(analytics.content.avgWatchTime / 60)}:{(analytics.content.avgWatchTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Completion Rate</span>
                  <span className="font-semibold">{analytics.content.completionRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Shares</span>
                  <span className="font-semibold">{analytics.content.shares.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Downloads</span>
                  <span className="font-semibold">{analytics.content.downloads.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Engagement Metrics
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Likes</span>
                  <span className="font-semibold">{analytics.engagement.likes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Comments</span>
                  <span className="font-semibold">{analytics.engagement.comments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Replies</span>
                  <span className="font-semibold">{analytics.engagement.replies.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Mentions</span>
                  <span className="font-semibold">{analytics.engagement.mentions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">New Followers</span>
                  <span className="font-semibold text-green-500">
                    +{analytics.engagement.newFollowers.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Unfollows</span>
                  <span className="font-semibold text-red-500">
                    -{analytics.engagement.unfollows.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Top Content */}
        {topContent.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Top Performing Content
            </h2>
            
            <div className="space-y-4">
              {topContent.map((content, index) => (
                <div
                  key={content.contentId}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium">{content.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {content.views.toLocaleString()} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {content.engagement.toLocaleString()} engagement
                        </span>
                        <span className="flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          {content.completionRate.toFixed(1)}% completion
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="secondary" className="px-3 py-1">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8"
        >
          <Button className="flex items-center gap-2 justify-center">
            <Play className="w-4 h-4" />
            Create Content
          </Button>
          <Button variant="secondary" className="flex items-center gap-2 justify-center">
            <BarChart3 className="w-4 h-4" />
            View Analytics
          </Button>
          <Button variant="secondary" className="flex items-center gap-2 justify-center">
            <Users className="w-4 h-4" />
            Manage Followers
          </Button>
          <Button variant="secondary" className="flex items-center gap-2 justify-center">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
