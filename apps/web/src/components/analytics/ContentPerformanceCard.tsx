import { motion } from "framer-motion";
import { TrendingUp, Play, Eye, BarChart3, PieChart } from "lucide-react";
import type { ContentPerformance } from "../../services/analyticsDashboardService";

interface ContentPerformanceCardProps {
  performance: ContentPerformance;
}

export function ContentPerformanceCard({ performance }: ContentPerformanceCardProps) {
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatNumber = (num: number) => num.toLocaleString();

  const bucketColors = {
    viral: "text-red-400 bg-red-500/20 border-red-500/30",
    educational: "text-blue-400 bg-blue-500/20 border-blue-500/30",
    deep: "text-purple-400 bg-purple-500/20 border-purple-500/30",
  };

  const totalContent = performance.bucketDistribution.viral + 
                     performance.bucketDistribution.educational + 
                     performance.bucketDistribution.deep;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Content Performance</h2>
        <BarChart3 className="w-5 h-5 text-orange-500" />
      </div>

      {/* Top Performing Content */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-400">Top Performing Content</h3>
        
        <div className="space-y-3">
          {performance.topPerformingContent.slice(0, 5).map((content, index) => (
            <motion.div
              key={content.contentId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="bg-gray-800 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white truncate mb-2">
                    {content.title}
                  </h4>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{formatNumber(content.views)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Play className="w-3 h-3" />
                      <span>{formatTime(content.avgWatchTime)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{content.engagementScore}</span>
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  <span className="text-lg font-bold text-orange-400">#{index + 1}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Content Distribution */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-400">Content Distribution</h3>
        
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(performance.bucketDistribution).map(([bucket, count]) => (
            <motion.div
              key={bucket}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 + Object.keys(performance.bucketDistribution).indexOf(bucket) * 0.1 }}
              className={`rounded-lg p-4 border ${bucketColors[bucket as keyof typeof bucketColors]}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium capitalize">{bucket}</span>
                <PieChart className="w-3 h-3" />
              </div>
              <p className="text-xl font-bold">{formatNumber(count)}</p>
              <p className="text-xs opacity-75">
                {totalContent > 0 ? Math.round((count / totalContent) * 100) : 0}% of total
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="bg-gray-800 rounded-lg p-4"
      >
        <h3 className="text-sm font-medium text-gray-300 mb-3">Performance Insights</h3>
        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>{performance.bucketDistribution.viral} viral content pieces</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>{performance.bucketDistribution.educational} educational pieces</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>{performance.bucketDistribution.deep} deep-dive pieces</span>
          </div>
          {performance.topPerformingContent.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>
                Top content: {performance.topPerformingContent[0].title.slice(0, 30)}...
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Content Quality Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
        className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-lg p-4 border border-orange-500/30"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-orange-400">Content Quality Score</h3>
            <p className="text-xs text-gray-400 mt-1">Based on engagement and performance</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-orange-400">
              {performance.topPerformingContent.length > 0 
                ? Math.round(performance.topPerformingContent.reduce((sum, content) => sum + content.engagementScore, 0) / performance.topPerformingContent.length)
                : 0}
            </p>
            <p className="text-xs text-gray-400">avg score</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
