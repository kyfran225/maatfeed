import { useState } from "react";
import { motion } from "framer-motion";
import { useAnalyticsDashboard } from "../hooks/useAnalyticsDashboard";
import { RetentionMetricsCard } from "../components/analytics/RetentionMetricsCard";
import { LearningAnalyticsCard } from "../components/analytics/LearningAnalyticsCard";
import { EngagementMetricsCard } from "../components/analytics/EngagementMetricsCard";
import { ContentPerformanceCard } from "../components/analytics/ContentPerformanceCard";
import { AnalyticsHeader } from "../components/analytics/AnalyticsHeader";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

export default function AnalyticsDashboard() {
  const [days, setDays] = useState(30);
  const { data, loading, error, refresh } = useAnalyticsDashboard(days);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Analytics Error</h2>
          <p className="text-gray-400 mb-4">{error.message}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <AnalyticsHeader 
        days={days}
        onDaysChange={setDays}
        onRefresh={refresh}
        loading={loading}
        dateRange={data.dateRange}
      />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800"
          >
            <h3 className="text-sm font-medium text-gray-400 mb-2">Daily Active Users</h3>
            <p className="text-3xl font-bold text-white">{data.retention.dailyActiveUsers.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800"
          >
            <h3 className="text-sm font-medium text-gray-400 mb-2">Avg Session Duration</h3>
            <p className="text-3xl font-bold text-white">{Math.round(data.retention.averageSessionDuration)}s</p>
            <p className="text-xs text-gray-500 mt-1">Per user</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800"
          >
            <h3 className="text-sm font-medium text-gray-400 mb-2">Completion Rate</h3>
            <p className="text-3xl font-bold text-white">{data.engagement.completionRate75}%</p>
            <p className="text-xs text-gray-500 mt-1">75%+ watched</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800"
          >
            <h3 className="text-sm font-medium text-gray-400 mb-2">Content Mastered</h3>
            <p className="text-3xl font-bold text-white">{data.learning.contentMasteredCount}</p>
            <p className="text-xs text-gray-500 mt-1">Total items</p>
          </motion.div>
        </motion.div>

        {/* Detailed Analytics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RetentionMetricsCard metrics={data.retention} />
          <LearningAnalyticsCard analytics={data.learning} />
          <EngagementMetricsCard metrics={data.engagement} />
          <ContentPerformanceCard performance={data.content} />
        </div>
      </div>
    </div>
  );
}
