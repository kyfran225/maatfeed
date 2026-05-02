import { motion } from "framer-motion";
import { TopDebate } from "../../services/communityService";

interface DebateCardProps {
  debate: TopDebate;
  onOpen: () => void;
}

export function DebateCard({ debate, onOpen }: DebateCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 50) return 'from-red-500 to-orange-500';
    if (score >= 30) return 'from-yellow-500 to-gold';
    if (score >= 15) return 'from-blue-500 to-cyan-500';
    return 'from-gray-500 to-gray-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 50) return 'Débat Chaud';
    if (score >= 30) return 'Actif';
    if (score >= 15) return 'Croissant';
    return 'Émergent';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-sand/10 rounded-xl p-3 sm:p-4 border border-sand/20 hover:border-gold/30 transition-all cursor-pointer group"
      onClick={onOpen}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header with title and score badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-2 sm:pr-3">
          <h3 className="font-semibold text-gold mb-2 line-clamp-2 text-base sm:text-lg group-hover:text-gold/90 transition-colors">
            {debate.title}
          </h3>
          <p className="text-xs sm:text-sm text-sand/60 line-clamp-2 sm:line-clamp-3 leading-relaxed">
            {debate.description}
          </p>
        </div>
        
        {/* Score Badge */}
        <div className="flex flex-col items-center space-y-1 flex-shrink-0">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${getScoreColor(debate.debateScore)} flex items-center justify-center`}>
            <span className="text-white font-bold text-xs sm:text-sm">{Math.round(debate.debateScore)}</span>
          </div>
          <span className="text-xs text-sand/50 text-center hidden sm:block">
            {getScoreLabel(debate.debateScore)}
          </span>
        </div>
      </div>

      {/* Tags */}
      {debate.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
          {debate.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-sand/20 rounded-full text-xs text-sand/70"
            >
              {tag}
            </span>
          ))}
          {debate.tags.length > 3 && (
            <span className="px-2 py-0.5 bg-sand/20 rounded-full text-xs text-sand/50">
              +{debate.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Stats Bar */}
      <div className="flex items-center justify-between text-xs mb-2 sm:mb-3">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3 text-sand/50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            <span className="text-sand/60 text-xs">{debate.participantCount}</span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3 text-sand/50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sand/60 text-xs">{debate.debateScore.toFixed(1)}</span>
          </div>
        </div>
        <div className="text-sand/50">
          {debate.lastActivity}
        </div>
      </div>

      <div className="mb-2 flex flex-wrap gap-2">
        {debate.debateScore >= 50 && (
          <span className="rounded-full bg-red-500/15 px-2 py-1 text-[11px] font-medium text-red-200">🔥 Tendance</span>
        )}
        {debate.participantCount >= 5 && (
          <span className="rounded-full bg-cyan-500/15 px-2 py-1 text-[11px] font-medium text-cyan-200">💬 Discussion active</span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-sand/60">Intensité du Débat</span>
          <span className="text-sand/50">{Math.min(Math.round((debate.debateScore / 60) * 100), 100)}%</span>
        </div>
        <div className="w-full bg-sand/20 rounded-full h-1.5 overflow-hidden">
          <motion.div 
            className={`h-full bg-gradient-to-r ${getScoreColor(debate.debateScore)} rounded-full transition-all duration-500`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((debate.debateScore / 60) * 100, 100)}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-sand/10">
        <div className="flex items-center justify-between">
          <span className="text-xs text-sand/50">Rejoindre le débat</span>
          <svg className="w-4 h-4 text-gold/50 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
