import { motion } from "framer-motion";
import { Users, Clock, TrendingUp, Calendar } from "lucide-react";
import type { RetentionMetrics } from "../../services/analyticsDashboardService";

interface RetentionMetricsCardProps {
  metrics: RetentionMetrics;
}

export function RetentionMetricsCard({ metrics }: RetentionMetricsCardProps) {
  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Retention Metrics</h2>
        <Users className="w-5 h-5 text-orange-500" />
      </div>

      {/* Active Users */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">Daily Active</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(metrics.dailyActiveUsers)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Weekly Active</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(metrics.weeklyActiveUsers)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-400">Monthly Active</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(metrics.monthlyActiveUsers)}</p>
        </motion.div>
      </div>

      {/* Retention Rates */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-400">Retention Rates</h3>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-300">7-Day Retention</span>
              <span className="text-sm font-medium text-white">{metrics.userRetentionRate7d}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(metrics.userRetentionRate7d, 100)}%` }}
                transition={{ duration: 1, delay: 0.6 }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-300">30-Day Retention</span>
              <span className="text-sm font-medium text-white">{metrics.userRetentionRate30d}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(metrics.userRetentionRate30d, 100)}%` }}
                transition={{ duration: 1, delay: 0.7 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Session Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-800 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-400">Avg Session</span>
          </div>
          <p className="text-xl font-bold text-white">{Math.round(metrics.averageSessionDuration)}s</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gray-800 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Sessions/User</span>
          </div>
          <p className="text-xl font-bold text-white">{metrics.averageSessionsPerUser}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
