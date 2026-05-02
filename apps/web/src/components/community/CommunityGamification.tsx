import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Star, 
  Flame, 
  Zap, 
  Crown, 
  Gem, 
  Shield, 
  Target,
  Rocket,
  Award,
  Medal,
  Sparkles,
  Heart,
  TrendingUp,
  Users,
  MessageCircle,
  Lightbulb,
  Brain,
  BarChart3,
  Clock,
  Calendar,
  MapPin,
  Flag
} from "lucide-react";

// Types pour la gamification
interface UserBadge {
  id: string;
  type: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  progress: number;
  maxProgress: number;
}

interface UserStats {
  level: number;
  experience: number;
  nextLevelExp: number;
  totalPosts: number;
  totalUpvotes: number;
  totalComments: number;
  streakDays: number;
  bestBadge: string;
  rank: number;
  totalUsers: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "posting" | "engagement" | "quality" | "viral" | "community";
  rarity: "common" | "rare" | "epic" | "legendary";
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
  reward: {
    experience: number;
    badge?: string;
    title?: string;
  };
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  level: number;
  badges: number;
  trend: "up" | "down" | "stable";
  change: number;
}

// Composants de gamification
const BadgeCard = ({ badge, showProgress = true }: { badge: UserBadge; showProgress?: boolean }) => {
  const rarityConfig = {
    bronze: { color: "from-amber-600 to-amber-800", border: "border-amber-500" },
    silver: { color: "from-gray-400 to-gray-600", border: "border-gray-400" },
    gold: { color: "from-yellow-400 to-yellow-600", border: "border-yellow-400" },
    platinum: { color: "from-purple-400 to-purple-600", border: "border-purple-400" },
    diamond: { color: "from-cyan-400 to-cyan-600", border: "border-cyan-400" }
  };

  const config = rarityConfig[badge.type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, rotateY: 10 }}
      className={`relative bg-gradient-to-br ${config.color} rounded-2xl p-6 border-2 ${config.border} shadow-2xl`}
    >
      {/* Badge icon */}
      <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
        <span className="text-2xl">{badge.icon}</span>
      </div>

      {/* Badge info */}
      <h3 className="text-white font-bold text-center mb-2">{badge.name}</h3>
      <p className="text-white/80 text-xs text-center mb-3">{badge.description}</p>

      {/* Progress */}
      {showProgress && badge.progress < badge.maxProgress && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-white/60 mb-1">
            <span>Progression</span>
            <span>{badge.progress}/{badge.maxProgress}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-white h-full rounded-full"
            />
          </div>
        </div>
      )}

      {/* Unlocked date */}
      {badge.progress >= badge.maxProgress && (
        <div className="text-center text-xs text-white/60">
          <Calendar className="w-3 h-3 inline mr-1" />
          {new Date(badge.unlockedAt).toLocaleDateString()}
        </div>
      )}

      {/* Glow effect */}
      {badge.progress >= badge.maxProgress && (
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl pointer-events-none"
        />
      )}
    </motion.div>
  );
};

const AchievementCard = ({ achievement, onUnlock }: { 
  achievement: Achievement; 
  onUnlock?: (achievementId: string) => void;
}) => {
  const rarityConfig = {
    common: { color: "from-gray-500 to-gray-700", border: "border-gray-500" },
    rare: { color: "from-blue-500 to-blue-700", border: "border-blue-500" },
    epic: { color: "from-purple-500 to-purple-700", border: "border-purple-500" },
    legendary: { color: "from-orange-500 to-red-700", border: "border-orange-500" }
  };

  const config = rarityConfig[achievement.rarity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${config.color} rounded-xl p-4 border ${config.border} ${
        achievement.unlocked ? "opacity-100" : "opacity-60"
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-xl">{achievement.icon}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-white font-semibold text-sm truncate">{achievement.name}</h4>
            {achievement.unlocked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-green-400"
              >
                <Trophy className="w-4 h-4" />
              </motion.div>
            )}
          </div>
          
          <p className="text-white/70 text-xs mb-2">{achievement.description}</p>
          
          {/* Progress */}
          {!achievement.unlocked && (
            <div className="mb-2">
              <div className="flex justify-between text-xs text-white/60 mb-1">
                <span>Progression</span>
                <span>{achievement.progress}/{achievement.maxProgress}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="bg-white h-full rounded-full"
                />
              </div>
            </div>
          )}
          
          {/* Rewards */}
          <div className="flex items-center space-x-2 text-xs text-white/60">
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3" />
              <span>{achievement.reward.experience} XP</span>
            </div>
            {achievement.reward.badge && (
              <div className="flex items-center space-x-1">
                <Award className="w-3 h-3" />
                <span>{achievement.reward.badge}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const UserStatsCard = ({ stats }: { stats: UserStats }) => {
  const levelProgress = (stats.experience / stats.nextLevelExp) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30"
    >
      {/* Level and XP */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center space-x-3 mb-3">
          <div className="w-16 h-16 bg-gradient-to-br from-gold to-orange-500 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{stats.level}</span>
          </div>
          <div className="text-left">
            <h3 className="text-xl font-bold text-white">Niveau {stats.level}</h3>
            <p className="text-sand/60 text-sm">
              {stats.experience} / {stats.nextLevelExp} XP
            </p>
          </div>
        </div>
        
        <div className="w-full bg-sand/20 rounded-full h-3 mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-gradient-to-r from-gold to-orange-500 h-full rounded-full"
          />
        </div>
        <p className="text-xs text-sand/60">
          {Math.round(levelProgress)}% vers le niveau {stats.level + 1}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-sand/10 rounded-lg p-3 text-center">
          <MessageCircle className="w-5 h-5 text-gold mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{stats.totalPosts}</div>
          <div className="text-xs text-sand/60">Posts</div>
        </div>
        
        <div className="bg-sand/10 rounded-lg p-3 text-center">
          <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{stats.totalUpvotes}</div>
          <div className="text-xs text-sand/60">Upvotes</div>
        </div>
        
        <div className="bg-sand/10 rounded-lg p-3 text-center">
          <MessageCircle className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{stats.totalComments}</div>
          <div className="text-xs text-sand/60">Commentaires</div>
        </div>
        
        <div className="bg-sand/10 rounded-lg p-3 text-center">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{stats.streakDays}</div>
          <div className="text-xs text-sand/60">Jours d'affilée</div>
        </div>
      </div>

      {/* Rank */}
      <div className="bg-sand/10 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-gold" />
            <span className="text-sm text-sand/60">Classement</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white">#{stats.rank}</div>
            <div className="text-xs text-sand/60">sur {stats.totalUsers} utilisateurs</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const LeaderboardCard = ({ entry, index }: { entry: LeaderboardEntry; index: number }) => {
  const rankColors = [
    "from-yellow-400 to-yellow-600", // 1st
    "from-gray-300 to-gray-500",     // 2nd
    "from-orange-400 to-orange-600", // 3rd
    "from-sand/20 to-sand/40"        // Others
  ];

  const rankIcons = [
    <Crown className="w-4 h-4" />,
    <Medal className="w-4 h-4" />,
    <Award className="w-4 h-4" />,
    <span className="text-sm">#{index + 1}</span>
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-r ${rankColors[Math.min(index, 3)]} rounded-xl p-4 border border-sand/20`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            {rankIcons[Math.min(index, 3)]}
          </div>
          
          <div>
            <div className="font-semibold text-white">{entry.username}</div>
            <div className="text-xs text-white/70">Niveau {entry.level}</div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="font-bold text-white">{entry.score}</div>
            <div className="text-xs text-white/70">{entry.badges} badges</div>
          </div>
          
          <div className="flex items-center space-x-1">
            {entry.trend === "up" && <TrendingUp className="w-4 h-4 text-green-400" />}
            {entry.trend === "down" && <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />}
            {entry.trend === "stable" && <div className="w-4 h-4 bg-sand/40 rounded-full" />}
            <span className={`text-xs ${entry.trend === "up" ? "text-green-400" : entry.trend === "down" ? "text-red-400" : "text-sand/60"}`}>
              {entry.change > 0 ? "+" : ""}{entry.change}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function CommunityGamification() {
  const [activeTab, setActiveTab] = useState<"stats" | "badges" | "achievements" | "leaderboard">("stats");
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les données de gamification
  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      
      // Charger les stats utilisateur
      const statsResponse = await fetch("/api/community/user/stats");
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setUserStats(statsData.data);
      }

      // Charger les badges
      const badgesResponse = await fetch("/api/community/user/badges");
      const badgesData = await badgesResponse.json();
      
      if (badgesData.success) {
        setBadges(badgesData.data);
      }

      // Charger les achievements
      const achievementsResponse = await fetch("/api/community/user/achievements");
      const achievementsData = await achievementsResponse.json();
      
      if (achievementsData.success) {
        setAchievements(achievementsData.data);
      }

      // Charger le leaderboard
      const leaderboardResponse = await fetch("/api/community/leaderboard");
      const leaderboardData = await leaderboardResponse.json();
      
      if (leaderboardData.success) {
        setLeaderboard(leaderboardData.data);
      }
    } catch (error) {
      console.error("Error loading gamification data:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "stats", label: "Stats", icon: BarChart3 },
    { id: "badges", label: "Badges", icon: Trophy },
    { id: "achievements", label: "Succès", icon: Star },
    { id: "leaderboard", label: "Classement", icon: Crown }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ink via-ink to-purple-950 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-sand/20 rounded w-48 mb-8"></div>
            <div className="h-64 bg-sand/10 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink via-ink to-purple-950 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Trophy className="w-8 h-8 text-gold" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gold via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Gamification Communautaire
            </h1>
            <Trophy className="w-8 h-8 text-gold" />
          </div>
          <p className="text-sand/70 text-lg">
            Gagnez des XP, débloquez des achievements et montez dans le classement
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-sand/10 backdrop-blur-lg rounded-2xl p-2 mb-6 border border-sand/20"
        >
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-gold to-orange-500 text-ink font-semibold"
                      : "text-sand/60 hover:text-white hover:bg-sand/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "stats" && userStats && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <UserStatsCard stats={userStats} />
            </motion.div>
          )}

          {activeTab === "badges" && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {badges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "achievements" && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "leaderboard" && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <LeaderboardCard key={entry.userId} entry={entry} index={index} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
