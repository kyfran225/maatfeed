import { motion } from "framer-motion";
import { TopDebate } from "../../services/communityService";

interface CommunityAnalyticsProps {
  debates: TopDebate[];
}

export function CommunityAnalytics({ debates }: CommunityAnalyticsProps) {
  // Calculate analytics
  const totalDebates = debates.length;
  const totalParticipants = debates.reduce((sum, debate) => sum + debate.participantCount, 0);
  const averageScore = debates.length > 0 
    ? debates.reduce((sum, debate) => sum + debate.debateScore, 0) / debates.length 
    : 0;
  
  // Tag analysis
  const tagCounts = debates.reduce((acc, debate) => {
    debate.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  
  const topTags = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  // Score distribution
  const scoreRanges = {
    'Hot (50+)': debates.filter(d => d.debateScore >= 50).length,
    'Active (30-49)': debates.filter(d => d.debateScore >= 30 && d.debateScore < 50).length,
    'Growing (15-29)': debates.filter(d => d.debateScore >= 15 && d.debateScore < 30).length,
    'Emerging (0-14)': debates.filter(d => d.debateScore < 15).length,
  };
  
  // Engagement metrics
  const highEngagementDebates = debates.filter(d => d.participantCount >= 15).length;
  const averageParticipants = debates.length > 0 ? totalParticipants / debates.length : 0;

  if (debates.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-sand/5 rounded-xl p-6 border border-sand/10"
      >
        <h3 className="text-lg font-semibold text-gold mb-4">Community Analytics</h3>
        <p className="text-sand/60 text-center py-8">No debate data available yet</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-sand/5 rounded-xl p-6 border border-sand/10 space-y-6"
    >
      <h3 className="text-lg font-semibold text-gold mb-4">Community Analytics</h3>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-sand/10 rounded-lg p-3 text-center"
        >
          <div className="text-2xl font-bold text-gold">{totalDebates}</div>
          <div className="text-xs text-sand/60">Total Debates</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-sand/10 rounded-lg p-3 text-center"
        >
          <div className="text-2xl font-bold text-gold">{totalParticipants}</div>
          <div className="text-xs text-sand/60">Participants</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-sand/10 rounded-lg p-3 text-center"
        >
          <div className="text-2xl font-bold text-gold">{averageScore.toFixed(1)}</div>
          <div className="text-xs text-sand/60">Avg Score</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-sand/10 rounded-lg p-3 text-center"
        >
          <div className="text-2xl font-bold text-gold">{averageParticipants.toFixed(1)}</div>
          <div className="text-xs text-sand/60">Avg Participants</div>
        </motion.div>
      </div>

      {/* Score Distribution */}
      <div>
        <h4 className="text-sm font-medium text-gold mb-3">Debate Intensity Distribution</h4>
        <div className="space-y-2">
          {Object.entries(scoreRanges).map(([range, count], index) => (
            <motion.div
              key={range}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center space-x-3"
            >
              <span className="text-xs text-sand/60 w-24">{range}</span>
              <div className="flex-1 bg-sand/20 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold/60 to-gold rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${totalDebates > 0 ? (count / totalDebates) * 100 : 0}%` }}
                  transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                />
              </div>
              <span className="text-xs text-sand/70 w-8 text-right">{count}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Top Tags */}
      {topTags.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gold mb-3">Most Popular Topics</h4>
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, count], index) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.05 }}
                className="bg-sand/10 rounded-lg px-3 py-2 flex items-center space-x-2"
              >
                <span className="text-sm text-sand/70">{tag}</span>
                <span className="text-xs bg-gold/20 text-gold px-2 py-1 rounded-full">{count}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement Insights */}
      <div className="bg-sand/10 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gold mb-2">Community Insights</h4>
        <div className="space-y-2 text-xs text-sand/70">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{highEngagementDebates} debates have high engagement (15+ participants)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>{scoreRanges['Hot (50+)']} debates are currently trending hot</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Most active topic: {topTags[0]?.[0] || 'N/A'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
