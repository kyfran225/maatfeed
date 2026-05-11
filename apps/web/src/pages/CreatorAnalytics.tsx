import { useState } from "react";
import { motion } from "framer-motion";
import { CreatorAnalyticsCard } from "../components/analytics/CreatorAnalyticsCard";
import { AnalyticsHeader } from "../components/analytics/AnalyticsHeader";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

// Mock creator data - this would come from API or props
const mockCreatorData = {
  totalFollowers: 1250,
  totalContent: 24,
  totalViews: 45680,
  totalEngagement: 2340,
  avgWatchTime: 180,
  followerGrowth: 12.5,
};

const mockDateRange = {
  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  end: new Date().toISOString(),
};

export default function CreatorAnalytics() {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <AnalyticsHeader 
        days={days}
        onDaysChange={setDays}
        onRefresh={handleRefresh}
        loading={loading}
        dateRange={mockDateRange}
      />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Creator Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-xl p-6 border border-orange-500/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Creator Dashboard</h1>
              <p className="text-gray-400">Track your content performance and audience growth</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Creator Status</p>
              <p className="text-lg font-semibold text-orange-400">Active</p>
            </div>
          </div>
        </motion.div>

        {/* Creator Analytics Card */}
        <CreatorAnalyticsCard metrics={mockCreatorData} />

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-left hover:border-orange-500 transition-colors"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Create Content</h3>
            <p className="text-sm text-gray-400">Upload new video or audio content</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-left hover:border-orange-500 transition-colors"
          >
            <h3 className="text-lg font-semibold text-white mb-2">View Analytics</h3>
            <p className="text-sm text-gray-400">Detailed performance insights</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0 }}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-left hover:border-orange-500 transition-colors"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Engage Audience</h3>
            <p className="text-sm text-gray-400">Connect with your followers</p>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
