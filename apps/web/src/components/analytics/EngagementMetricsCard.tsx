import { motion } from "framer-motion";
import { Heart, Bookmark, Share2, MessageCircle, Play, Clock } from "lucide-react";
import type { EngagementMetrics } from "../../services/analyticsDashboardService";

interface EngagementMetricsCardProps {
  metrics: EngagementMetrics;
}

export function EngagementMetricsCard({ metrics }: EngagementMetricsCardProps) {
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const engagementItems = [
    { label: "Like Rate", value: metrics.likeRate, icon: Heart, color: "text-red-400" },
    { label: "Save Rate", value: metrics.saveRate, icon: Bookmark, color: "text-blue-400" },
    { label: "Share Rate", value: metrics.shareRate, icon: Share2, color: "text-green-400" },
    { label: "Comment Rate", value: metrics.commentRate, icon: MessageCircle, color: "text-purple-400" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Engagement Metrics</h2>
        <Heart className="w-5 h-5 text-orange-500" />
      </div>

      {/* Watch Time & Completion */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">Avg Watch Time</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatTime(metrics.averageWatchTimeSeconds)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Play className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">75%+ Completion</span>
          </div>
          <p className="text-2xl font-bold text-white">{metrics.completionRate75}%</p>
        </motion.div>
      </div>

      {/* Engagement Rates */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-400">Engagement Rates</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {engagementItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="bg-gray-800 rounded-lg p-4"
            >
              <div className="flex items-center space-x-2 mb-3">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-sm text-gray-400">{item.label}</span>
              </div>
              
              <div className="space-y-2">
                <p className="text-xl font-bold text-white">{item.value}%</p>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${
                      item.label === "Like Rate" ? "bg-gradient-to-r from-red-500 to-red-400" :
                      item.label === "Save Rate" ? "bg-gradient-to-r from-blue-500 to-blue-400" :
                      item.label === "Share Rate" ? "bg-gradient-to-r from-green-500 to-green-400" :
                      "bg-gradient-to-r from-purple-500 to-purple-400"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(item.value * 10, 100)}%` }}
                    transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Engagement Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="bg-gray-800 rounded-lg p-4"
      >
        <h3 className="text-sm font-medium text-gray-300 mb-3">Engagement Insights</h3>
        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Users watch {formatTime(metrics.averageWatchTimeSeconds)} on average</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{metrics.completionRate75}% complete 75%+ of content</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>{metrics.likeRate}% like content they view</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>{metrics.saveRate}% save content for later</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{metrics.shareRate}% share content with others</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>{metrics.commentRate}% engage in discussions</span>
          </div>
        </div>
      </motion.div>

      {/* Engagement Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.3 }}
        className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-lg p-4 border border-orange-500/30"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-orange-400">Overall Engagement Score</h3>
            <p className="text-xs text-gray-400 mt-1">Combined engagement metrics</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-orange-400">
              {Math.round((metrics.likeRate + metrics.saveRate + metrics.shareRate + metrics.commentRate) / 4)}
            </p>
            <p className="text-xs text-gray-400">average</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
