import { motion } from "framer-motion";
import { RefreshCw, Calendar } from "lucide-react";

interface DateRange {
  start: string;
  end: string;
}

interface AnalyticsHeaderProps {
  days: number;
  onDaysChange: (days: number) => void;
  onRefresh: () => void;
  loading: boolean;
  dateRange: DateRange;
}

const dayOptions = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

export function AnalyticsHeader({
  days,
  onDaysChange,
  onRefresh,
  loading,
  dateRange
}: AnalyticsHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 border-b border-gray-800"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>
                {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Day Range Selector */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-400">Period:</label>
              <select
                value={days}
                onChange={(e) => onDaysChange(Number(e.target.value))}
                className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
              >
                {dayOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
