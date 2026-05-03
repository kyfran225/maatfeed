import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, Filter, Play, Headphones, BookOpen, Flame, Sparkles } from "lucide-react";
import { SEO } from "../components/SEO";
import { contentService, ContentItem, TrendingContent } from "../services/contentService";
import { LoadingState } from "../components/ui/LoadingState";
import { ErrorState } from "../components/ui/ErrorState";
import { EmptyState } from "../components/ui/EmptyState";
import { TouchFeedback } from "../components/ui/TouchFeedback";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { CONTENT_BUCKET_LABELS } from "@maat/shared";

export const BUCKETS = [
  { id: 'viral', name: CONTENT_BUCKET_LABELS.viral, color: 'bg-red-500', gradient: 'from-red-500/30 via-orange-500/20 to-red-600/30', icon: Flame },
  { id: 'educational', name: CONTENT_BUCKET_LABELS.educational, color: 'bg-blue-500', gradient: 'from-blue-500/30 via-cyan-500/20 to-blue-600/30', icon: BookOpen },
  { id: 'deep', name: CONTENT_BUCKET_LABELS.deep, color: 'bg-purple-500', gradient: 'from-purple-500/30 via-pink-500/20 to-purple-600/30', icon: Sparkles }
];

// Generate a beautiful gradient placeholder based on bucket and media type
const ThumbnailPlaceholder = ({ bucket, mediaType, title }: { bucket: string; mediaType?: string; title: string }) => {
  const bucketConfig = BUCKETS.find(b => b.id === bucket) || BUCKETS[2];
  const BucketIcon = bucketConfig.icon;

  // Get initials from title (max 2 characters)
  const initials = title
    .split(' ')
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase())
    .join('')
    .slice(0, 2);

  return (
    <div className={`w-full h-full bg-gradient-to-br ${bucketConfig.gradient} flex flex-col items-center justify-center relative overflow-hidden`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
      </div>

      {/* Content type indicator */}
      <div className="absolute top-3 left-3">
        {mediaType === 'audio' ? (
          <Headphones className="w-5 h-5 text-white/40" />
        ) : (
          <Play className="w-5 h-5 text-white/40" />
        )}
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
          <BucketIcon className="w-10 h-10 text-white/80" />
        </div>
        <span className="text-2xl font-bold text-white/60 tracking-wider">{initials}</span>
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
};

// Storage key for persisting search state
const EXPLORER_STATE_KEY = 'maat-explorer-state';

export default function ExplorePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [trendingContent, setTrendingContent] = useState<TrendingContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Restore saved state on mount
  useEffect(() => {
    const savedState = sessionStorage.getItem(EXPLORER_STATE_KEY);
    if (savedState) {
      try {
        const { query, bucket } = JSON.parse(savedState);
        if (query) setSearchQuery(query);
        if (bucket) setSelectedBucket(bucket);
      } catch {
        // Ignore parse errors
      }
    }
    loadTrendingContent();
  }, []);

  // Save state before navigating to content detail
  const handleCardClick = (contentId: string) => {
    // Save current search state
    sessionStorage.setItem(EXPLORER_STATE_KEY, JSON.stringify({
      query: searchQuery,
      bucket: selectedBucket
    }));
    navigate(`/content/${contentId}`);
  };

  // Load trending content when bucket changes
  useEffect(() => {
    if (selectedBucket) {
      loadTrendingContent(selectedBucket);
    }
  }, [selectedBucket]);

  const loadTrendingContent = async (bucket?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const content = await contentService.getTrendingContent(bucket || 'viral', 20);
      setTrendingContent(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trending content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const results = await contentService.searchContent(query, selectedBucket || undefined);
      setSearchResults(results.items);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedBucket]);

  const ContentCard = ({ item, index }: { item: ContentItem; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:bg-white/10 transition-colors cursor-pointer"
      onClick={() => handleCardClick(item.id)}
    >
      <TouchFeedback>
        <div className="aspect-video relative">
          {item.thumbnailUrl ? (
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <ThumbnailPlaceholder bucket={item.bucket} mediaType={item.videoUrl ? 'video' : item.audioUrl ? 'audio' : undefined} title={item.title} />
          )}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 text-xs text-white rounded-full ${
              BUCKETS.find(b => b.id === item.bucket)?.color || 'bg-gray-500'
            }`}>
              {item.bucket}
            </span>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-white line-clamp-2 mb-2">{item.title}</h3>
          <p className="text-sand/60 text-sm line-clamp-2 mb-3">{item.description}</p>
          
          <div className="flex items-center justify-between text-xs text-sand/40">
            <span>{item.author}</span>
            <div className="flex items-center gap-3">
              <span>{item.likes} j'aime</span>
              <span>{item.comments} commentaires</span>
            </div>
          </div>
        </div>
      </TouchFeedback>
    </motion.div>
  );

  return (
    <>
      <SEO pageKey="explore" />
      <section className="px-4 py-6 pb-24 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-3xl text-gold mb-4">Découvrir</h1>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-sand/40" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-sand/40 focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-transparent"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <TouchFeedback>
              <button
                onClick={() => setSelectedBucket(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedBucket === null
                    ? 'bg-orange text-white'
                    : 'bg-white/10 text-sand/60 hover:bg-white/20'
                }`}
              >
                Tout
              </button>
            </TouchFeedback>
            
            {BUCKETS.map((bucket) => (
              <TouchFeedback key={bucket.id}>
                <button
                  onClick={() => setSelectedBucket(bucket.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedBucket === bucket.id
                      ? 'bg-orange text-white'
                      : 'bg-white/10 text-sand/60 hover:bg-white/20'
                  }`}
                >
                  {bucket.name}
                </button>
              </TouchFeedback>
            ))}
          </div>

          <TouchFeedback>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Filter className="w-5 h-5 text-sand/60" />
            </button>
          </TouchFeedback>
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {searchQuery && (
          <motion.div
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-lg font-semibold text-white mb-4">
              Résultats pour "{searchQuery}"
            </h2>
            
            {isSearching ? (
              <LoadingState message="Recherche en cours..." />
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((item, index) => (
                  <ContentCard key={item.id} item={item} index={index} />
                ))}
              </div>
            ) : (
              <EmptyState 
                title="Aucun résultat"
                description="Essaie un sujet plus précis ou change de filtre."
              />
            )}
          </motion.div>
        )}

        {!searchQuery && (
          <motion.div
            key="trending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {isLoading ? (
              <LoadingState message="Chargement..." />
            ) : error ? (
              <ErrorState 
                message={error}
                onRetry={() => loadTrendingContent(selectedBucket || undefined)}
              />
            ) : trendingContent?.items && trendingContent.items.length > 0 ? (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">
                  {selectedBucket ? BUCKETS.find(b => b.id === selectedBucket)?.name : 'Tendances'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trendingContent.items.map((item, index) => (
                    <ContentCard key={item.id} item={item} index={index} />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState 
                title="Aucun contenu"
                description="Reviens plus tard."
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
    </>
  );
}
