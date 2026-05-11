import { motion } from "framer-motion";
import { Users, TrendingUp, Play, Eye, Heart, Bookmark, Share2 } from "lucide-react";

interface CreatorAnalyticsProps {
  creatorId?: string;
  // Basic creator metrics - this would be expanded with real data
  metrics?: {
    totalFollowers: number;
    totalContent: number;
    totalViews: number;
    totalEngagement: number;
    avgWatchTime: number;
    followerGrowth: number;
  };
}

export function CreatorAnalyticsCard({ creatorId, metrics }: CreatorAnalyticsProps) {
  // Mock data for now - this would come from API
  const mockMetrics = metrics || {
    totalFollowers: 1250,
    totalContent: 24,
    totalViews: 45680,
    totalEngagement: 2340,
    avgWatchTime: 180, // seconds
    followerGrowth: 12.5, // percentage
  };

  const formatNumber = (num: number) => num.toLocaleString();
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Creator Analytics</h2>
        <Users className="w-5 h-5 text-orange-500" />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-800 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">Followers</span>
          </div>
          <p className="text-xl font-bold text-white">{formatNumber(mockMetrics.totalFollowers)}</p>
          <p className="text-xs text-green-400">+{mockMetrics.followerGrowth}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-800 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Play className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Content</span>
          </div>
          <p className="text-xl font-bold text-white">{mockMetrics.totalContent}</p>
          <p className="text-xs text-gray-500">total pieces</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
          className="bg-gray-800 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-400">Total Views</span>
          </div>
          <p className="text-xl font-bold text-white">{formatNumber(mockMetrics.totalViews)}</p>
          <p className="text-xs text-gray-500">all time</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0 }}
          className="bg-gray-800 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-gray-400">Engagement</span>
          </div>
          <p className="text-xl font-bold text-white">{formatNumber(mockMetrics.totalEngagement)}</p>
          <p className="text-xs text-gray-500">total actions</p>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-400">Performance Metrics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1 }}
            className="bg-gray-800 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2 mb-3">
              <Play className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Avg Watch Time</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatTime(mockMetrics.avgWatchTime)}</p>
            <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((mockMetrics.avgWatchTime / 300) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 1.2 }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1 }}
            className="bg-gray-800 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-400">Follower Growth</span>
            </div>
            <p className="text-2xl font-bold text-white">{mockMetrics.followerGrowth}%</p>
            <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(mockMetrics.followerGrowth, 100)}%` }}
                transition={{ duration: 1, delay: 1.2 }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Engagement Breakdown */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-400">Engagement Breakdown</h3>
        
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="bg-gray-800 rounded-lg p-3 text-center"
          >
            <Heart className="w-5 h-5 text-red-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-white">
              {formatNumber(Math.floor(mockMetrics.totalEngagement * 0.4))}
            </p>
            <p className="text-xs text-gray-400">Likes</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="bg-gray-800 rounded-lg p-3 text-center"
          >
            <Bookmark className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-white">
              {formatNumber(Math.floor(mockMetrics.totalEngagement * 0.3))}
            </p>
            <p className="text-xs text-gray-400">Saves</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="bg-gray-800 rounded-lg p-3 text-center"
          >
            <Share2 className="w-5 h-5 text-green-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-white">
              {formatNumber(Math.floor(mockMetrics.totalEngagement * 0.3))}
            </p>
            <p className="text-xs text-gray-400">Shares</p>
          </motion.div>
        </div>
      </div>

      {/* Creator Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
        className="bg-gray-800 rounded-lg p-4"
      >
        <h3 className="text-sm font-medium text-gray-300 mb-3">Creator Insights</h3>
        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{mockMetrics.followerGrowth}% follower growth this month</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Avg {formatTime(mockMetrics.avgWatchTime)} watch time per content</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>{formatNumber(mockMetrics.totalViews)} total views across all content</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>{mockMetrics.totalContent} pieces of content created</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
