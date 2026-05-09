import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, 
  TrendingUp, 
  MessageCircle, 
  HelpCircle, 
  FileText, 
  Users,
  Sparkles,
  Zap,
  Award,
  Target,
  Brain,
  Rocket,
  Star,
  Heart,
  Share2,
  Bookmark,
  Eye,
  BarChart3,
  Lightbulb,
  Shield,
  Crown,
  Gem
} from "lucide-react";

// Types pour les posts communautaires
interface CommunityPost {
  _id: string;
  type: "discussion" | "question" | "post";
  title: string;
  content: string;
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
  tags: string[];
  upvotes: number;
  participantCount: number;
  viralityScore: number;
  viralityStatus: "cold" | "warm" | "hot" | "viral" | "trending";
  badges: Array<{
    type: string;
    level: number;
  }>;
  mediaUrl?: string;
  mediaType?: "image" | "video" | "audio";
  aiSummary?: string;
  sentiment: "positive" | "neutral" | "negative";
  controversy: number;
  quality: number;
  transformationScore?: number;
  engagementMetrics: {
    views: number;
    shares: number;
    bookmarks: number;
  };
  createdAt: string;
  lastActivityAt: string;
}

interface TrendingTopic {
  topic: string;
  score: number;
  growth: number;
  sentiment: "positive" | "neutral" | "negative";
}

interface Contradiction {
  topic: string;
  arguments: Array<{
    position: string;
    evidence: string;
    supporters: string[];
  }>;
  controversy: number;
  recommendation: string;
}

// Composants UI révolutionnaires
const ViralityBadge = ({ status, score }: { status: string; score: number }) => {
  const config = {
    cold: { color: "from-blue-500 to-cyan-500", icon: Snowflake, label: "Froid" },
    warm: { color: "from-orange-500 to-yellow-500", icon: Sun, label: "Chaud" },
    hot: { color: "from-red-500 to-orange-500", icon: Flame, label: "Très Chaud" },
    viral: { color: "from-purple-500 to-pink-500", icon: Zap, label: "Viral" },
    trending: { color: "from-green-500 to-emerald-500", icon: TrendingUp, label: "Tendance" }
  };

  const { color, icon: Icon, label } = config[status as keyof typeof config] || config.cold;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center space-x-1 bg-gradient-to-r ${color} text-white px-3 py-1 rounded-full text-xs font-bold`}
    >
      <Icon className="w-3 h-3" />
      <span>{label}</span>
      <span className="ml-1 bg-white/20 px-1 rounded">{score}</span>
    </motion.div>
  );
};

const PostTypeIcon = ({ type }: { type: string }) => {
  const icons = {
    discussion: MessageCircle,
    question: HelpCircle,
    post: FileText
  };
  const Icon = icons[type as keyof typeof icons] || FileText;
  return <Icon className="w-4 h-4" />;
};

const QualityIndicator = ({ quality }: { quality: number }) => {
  const percentage = quality * 100;
  const color = percentage >= 80 ? "bg-green-500" : percentage >= 60 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="flex items-center space-x-2">
      <div className="w-16 h-2 bg-sand/20 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full ${color}`}
        />
      </div>
      <span className="text-xs text-sand/60">{Math.round(percentage)}%</span>
    </div>
  );
};

const EngagementBar = ({ metrics }: { metrics: any }) => {
  const total = metrics.views + metrics.shares + metrics.bookmarks + metrics.upvotes;
  const views = (metrics.views / total) * 100;
  const shares = (metrics.shares / total) * 100;
  const bookmarks = (metrics.bookmarks / total) * 100;
  const upvotes = (metrics.upvotes / total) * 100;

  return (
    <div className="flex space-x-1 h-2">
      <div className="flex-1 bg-blue-500 rounded-l" style={{ width: `${views}%` }} title="Vues" />
      <div className="flex-1 bg-green-500" style={{ width: `${shares}%` }} title="Partages" />
      <div className="flex-1 bg-purple-500" style={{ width: `${bookmarks}%` }} title="Favoris" />
      <div className="flex-1 bg-red-500 rounded-r" style={{ width: `${upvotes}%` }} title="Votes" />
    </div>
  );
};

const TrendingTopicsBar = ({ topics, onSelect }: { topics: TrendingTopic[]; onSelect: (topic: string) => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <span>Sujets Brûlants</span>
        </h3>
        <div className="text-xs text-sand/60">Mis à jour en temps réel</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {topics.map((topic, index) => (
          <motion.button
            key={topic.topic}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(topic.topic)}
            className="bg-sand/10 hover:bg-sand/20 rounded-lg p-3 text-left transition-all hover:scale-105 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium text-sm">{topic.topic}</span>
              <div className="flex items-center space-x-1">
                {topic.growth > 0 && (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                )}
                <span className="text-xs text-sand/60">{topic.growth > 0 ? `+${topic.growth}%` : `${topic.growth}%`}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-1 bg-sand/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, topic.score / 10)}%` }}
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                />
              </div>
              <Sparkles className="w-3 h-3 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

const RevolutionaryPostCard = ({ post, onSelect, onUpvote }: { 
  post: CommunityPost; 
  onSelect: (post: CommunityPost) => void;
  onUpvote: (postId: string) => void;
}) => {
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleUpvote = () => {
    setIsUpvoted(!isUpvoted);
    onUpvote(post._id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-sand/10 to-sand/5 backdrop-blur-lg rounded-2xl border border-sand/20 overflow-hidden hover:border-gold/30 transition-all"
    >
      {/* Header avec badges */}
      <div className="p-4 border-b border-sand/10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold to-orange-500 rounded-full flex items-center justify-center">
              <PostTypeIcon type={post.type} />
            </div>
            <div>
              <div className="font-semibold text-white">{post.author.username}</div>
              <div className="text-xs text-sand/60">
                {new Date(post.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <ViralityBadge status={post.viralityStatus} score={post.viralityScore} />
            {post.badges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-1 rounded-full"
              >
                <Crown className="w-3 h-3" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.map((tag, index) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gold/20 text-gold px-2 py-1 rounded-full text-xs font-medium"
            >
              #{tag}
            </motion.span>
          ))}
        </div>

        {/* Titre et contenu */}
        <h3 className="text-lg font-bold text-white mb-2">{post.title}</h3>
        <p className="text-sand/80 text-sm mb-3 line-clamp-3">{post.content}</p>
        
        {post.aiSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-3 mb-3"
          >
            <div className="flex items-center space-x-2 mb-1">
              <Brain className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-blue-400 font-medium">Résumé IA</span>
            </div>
            <p className="text-xs text-sand/70">{post.aiSummary}</p>
          </motion.div>
        )}

        {/* Média */}
        {post.mediaUrl && (
          <div className="mb-3 rounded-lg overflow-hidden">
            {post.mediaType === "image" && (
              <img src={post.mediaUrl} alt="" className="w-full h-48 object-cover" loading="lazy" decoding="async" />
            )}
            {post.mediaType === "video" && (
              <video className="w-full h-48 object-cover" controls preload="metadata" playsInline>
                <source src={post.mediaUrl} />
              </video>
            )}
          </div>
        )}
      </div>

      {/* Métriques d'engagement */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4 text-xs text-sand/60">
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{post.engagementMetrics.views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{post.participantCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Share2 className="w-3 h-3" />
              <span>{post.engagementMetrics.shares}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bookmark className="w-3 h-3" />
              <span>{post.engagementMetrics.bookmarks}</span>
            </div>
          </div>
          
          <QualityIndicator quality={post.quality} />
        </div>

        <EngagementBar metrics={{ ...post.engagementMetrics, upvotes: post.upvotes }} />

        {/* Actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleUpvote}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                isUpvoted 
                  ? "bg-red-500 text-white" 
                  : "bg-sand/10 text-sand/70 hover:bg-sand/20"
              }`}
            >
              <Heart className={`w-4 h-4 ${isUpvoted ? "fill-current" : ""}`} />
              <span>{post.upvotes}</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelect(post)}
              className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-sand/10 text-sand/70 hover:bg-sand/20 text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Discuter</span>
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-gold hover:text-gold/80 transition-colors"
          >
            {showDetails ? "Moins" : "Plus"} de détails
          </motion.button>
        </div>

        {/* Détails étendus */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-sand/10"
            >
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-sand/60">Sentiment:</span>
                  <span className="ml-2 text-white capitalize">{post.sentiment}</span>
                </div>
                <div>
                  <span className="text-sand/60">Controverse:</span>
                  <span className="ml-2 text-white">{Math.round(post.controversy * 100)}%</span>
                </div>
                <div>
                  <span className="text-sand/60">Dernière activité:</span>
                  <span className="ml-2 text-white">
                    {new Date(post.lastActivityAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-sand/60">Score de transformation:</span>
                  <span className="ml-2 text-white">
                    {Math.round(post.transformationScore || 0)}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default function RevolutionaryCommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"trending" | "popular" | "recent" | "virality">("trending");
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);

  // Charger les données
  useEffect(() => {
    loadData();
  }, [selectedTopic, selectedType, sortBy]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les posts
      const postsQuery = new URLSearchParams({
        sort: sortBy,
        ...(selectedTopic && { tags: selectedTopic }),
        ...(selectedType && { type: selectedType })
      });
      
      const postsResponse = await fetch(`/api/community/posts?${postsQuery}`);
      const postsData = await postsResponse.json();
      
      if (postsData.success) {
        setPosts(postsData.data);
      }

      // Charger les tendances
      const trendsResponse = await fetch("/api/community/trending/day");
      const trendsData = await trendsResponse.json();
      
      if (trendsData.success) {
        setTrendingTopics(trendsData.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (postId: string) => {
    try {
      await fetch(`/api/community/posts/${postId}/upvote`, { method: "POST" });
      // Recharger les posts
      loadData();
    } catch (error) {
      console.error("Error upvoting post:", error);
    }
  };

  const handlePostSelect = (post: CommunityPost) => {
    setSelectedPost(post);
    // Naviguer vers la page de détail ou ouvrir une modal
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ink via-ink to-purple-950 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-sand/20 rounded w-48 mb-8"></div>
            <div className="h-32 bg-sand/10 rounded-2xl mb-4"></div>
            <div className="h-32 bg-sand/10 rounded-2xl mb-4"></div>
            <div className="h-32 bg-sand/10 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink via-ink to-purple-950 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header révolutionnaire */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Rocket className="w-8 h-8 text-gold" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gold via-orange-500 to-pink-500 bg-clip-text text-transparent">
              Communauté Révolutionnaire
            </h1>
            <Rocket className="w-8 h-8 text-gold" />
          </div>
          <p className="text-sand/70 text-lg">
            Transformez les discussions en contenu viral avec l'IA
          </p>
        </motion.div>

        {/* Sujets tendances */}
        {trendingTopics.length > 0 && (
          <TrendingTopicsBar 
            topics={trendingTopics.slice(0, 6)} 
            onSelect={setSelectedTopic}
          />
        )}

        {/* Filtres et contrôles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-sand/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-sand/20"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Types de posts */}
            <div className="flex items-center space-x-2">
              <span className="text-sand/60 text-sm">Type:</span>
              {["discussion", "question", "post"].map((type) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedType(selectedType === type ? null : type)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedType === type
                      ? "bg-gold text-ink"
                      : "bg-sand/20 text-sand/70 hover:bg-sand/30"
                  }`}
                >
                  <PostTypeIcon type={type} />
                  <span className="ml-1 capitalize">{type}</span>
                </motion.button>
              ))}
            </div>

            {/* Tri */}
            <div className="flex items-center space-x-2">
              <span className="text-sand/60 text-sm">Tri:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-sand/20 border border-sand/30 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-gold/50"
              >
                <option value="trending">Tendance</option>
                <option value="popular">Populaire</option>
                <option value="recent">Récent</option>
                <option value="virality">Viralité</option>
              </select>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-4 text-xs text-sand/60">
              <div className="flex items-center space-x-1">
                <BarChart3 className="w-3 h-3" />
                <span>{posts.length} posts</span>
              </div>
              {selectedTopic && (
                <div className="flex items-center space-x-1">
                  <span>Filtré: {selectedTopic}</span>
                  <button
                    onClick={() => setSelectedTopic(null)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Posts */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {posts.map((post, index) => (
              <RevolutionaryPostCard
                key={post._id}
                post={post}
                onSelect={handlePostSelect}
                onUpvote={handleUpvote}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {posts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-sand/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-8 h-8 text-sand/40" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucun post trouvé
            </h3>
            <p className="text-sand/60">
              {selectedTopic || selectedType 
                ? "Essayez de modifier vos filtres"
                : "Soyez le premier à lancer une discussion!"
              }
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Icons manquants
const Snowflake = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
);

const Sun = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
