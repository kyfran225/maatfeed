import { motion } from "framer-motion";
import { BookOpen, Target, Clock, CheckCircle, RotateCcw, TrendingUp } from "lucide-react";
import type { LearningAnalytics } from "../../services/analyticsDashboardService";

interface LearningAnalyticsCardProps {
  analytics: LearningAnalytics;
}

export function LearningAnalyticsCard({ analytics }: LearningAnalyticsCardProps) {
  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Learning Analytics</h2>
        <BookOpen className="w-5 h-5 text-orange-500" />
      </div>

      {/* Quiz Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">Total Quizzes</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(analytics.totalQuizzesTaken)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Avg Score</span>
          </div>
          <p className="text-2xl font-bold text-white">{analytics.averageQuizScore}%</p>
        </motion.div>
      </div>

      {/* Completion Rate */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-300">Completion Rate</span>
          <span className="text-sm font-medium text-white">{analytics.completionRate}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <motion.div
            className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(analytics.completionRate, 100)}%` }}
            transition={{ duration: 1, delay: 0.6 }}
          />
        </div>
      </div>

      {/* Content Progress */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-400">Content Progress</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-800 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-400">Mastered</span>
            </div>
            <p className="text-xl font-bold text-white">{formatNumber(analytics.contentMasteredCount)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gray-800 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2 mb-2">
              <RotateCcw className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-400">In Review</span>
            </div>
            <p className="text-xl font-bold text-white">{formatNumber(analytics.contentInReviewCount)}</p>
          </motion.div>
        </div>
      </div>

      {/* Learning Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gray-800 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-400">Avg Time to Mastery</span>
          </div>
          <p className="text-xl font-bold text-white">{analytics.averageTimeToMastery} days</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-gray-800 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-gray-400">Review Adherence</span>
          </div>
          <p className="text-xl font-bold text-white">{analytics.spacedRepetitionAdherence}%</p>
        </motion.div>
      </div>

      {/* Learning Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="bg-gray-800 rounded-lg p-4"
      >
        <h3 className="text-sm font-medium text-gray-300 mb-3">Learning Insights</h3>
        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{analytics.contentMasteredCount} items successfully mastered</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>{analytics.contentInReviewCount} items need review</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Avg {analytics.averageTimeToMastery} days to master content</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>{analytics.spacedRepetitionAdherence}% review adherence rate</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
