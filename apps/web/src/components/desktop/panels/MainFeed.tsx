import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  Heart, 
  MessageSquare, 
  Share, 
  Bookmark,
  MoreHorizontal,
  TrendingUp,
  Clock,
  Eye,
  Users,
  Mic,
  Video,
  Headphones,
  ChevronRight,
  Sparkles,
  Flame
} from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ContentItem {
  id: string;
  type: 'video' | 'audio' | 'debate' | 'series';
  title: string;
  creator: string;
  creatorAvatar: string;
  thumbnail: string;
  duration: string;
  views: string;
  likes: string;
  comments: string;
  timestamp: string;
  trending?: boolean;
  live?: boolean;
  preview?: {
    audio?: boolean;
    waveform?: number[];
  };
}

interface MainFeedProps {
  immersive?: boolean;
}

const mockContent: ContentItem[] = [
  {
    id: '1',
    type: 'video',
    title: 'Les racines de la civilisation Kemet : Révélation sur les origines égyptiennes',
    creator: 'Dr. Awa Ndiaye',
    creatorAvatar: '/avatars/awa.jpg',
    thumbnail: '/thumbnails/kemet-1.jpg',
    duration: '24:15',
    views: '124K',
    likes: '8.2K',
    comments: '342',
    timestamp: 'il y a 2 heures',
    trending: true,
    preview: { audio: true, waveform: [0.3, 0.7, 0.4, 0.9, 0.6, 0.8, 0.5, 0.7, 0.3, 0.6] }
  },
  {
    id: '2',
    type: 'debate',
    title: 'Faut-il décoloniser l\'éducation africaine ?',
    creator: 'Débat MAATFEED',
    creatorAvatar: '/avatars/maatfeed.jpg',
    thumbnail: '/thumbnails/debat-education.jpg',
    duration: '45:30',
    views: '89K',
    likes: '5.1K',
    comments: '1.2K',
    timestamp: 'il y a 4 heures',
    live: true
  },
  {
    id: '3',
    type: 'audio',
    title: 'Méditation guidée : Retrouver ses ancêtres',
    creator: 'Sagesse Africaine',
    creatorAvatar: '/avatars/sagesse.jpg',
    thumbnail: '/thumbnails/meditation.jpg',
    duration: '18:45',
    views: '45K',
    likes: '3.8K',
    comments: '156',
    timestamp: 'il y a 6 heures',
    preview: { audio: true, waveform: [0.5, 0.3, 0.8, 0.4, 0.7, 0.5, 0.9, 0.6, 0.4, 0.8] }
  },
  {
    id: '4',
    type: 'series',
    title: 'Série : Les royaumes oubliés d\'Afrique - Épisode 3',
    creator: 'Histoire Vivante',
    creatorAvatar: '/avatars/histoire.jpg',
    thumbnail: '/thumbnails/royaumes.jpg',
    duration: '32:20',
    views: '67K',
    likes: '4.5K',
    comments: '234',
    timestamp: 'il y a 8 heures',
    trending: true
  }
];

export const MainFeed: React.FC<MainFeedProps> = ({ immersive = false }) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });
  
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const headerScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

  const getCardSize = () => {
    if (immersive) return 'max-w-4xl';
    return 'max-w-2xl';
  };

  const ContentCard: React.FC<{ item: ContentItem; index: number }> = ({ item, index }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        onMouseEnter={() => setHoveredCard(item.id)}
        onMouseLeave={() => {
          setHoveredCard(null);
          setPlayingPreview(null);
        }}
        className={cn(
          "group relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/20",
          immersive ? "mx-auto" : "w-full"
        )}
      >
        {/* Media Container */}
        <div className="relative aspect-video bg-gradient-to-br from-orange-900/20 to-purple-900/20">
          {/* Thumbnail */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-purple-500/10" />
          
          {/* Type Badge */}
          <div className="absolute top-4 left-4 z-10">
            <div className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm",
              item.type === 'video' && "bg-blue-500/80 text-white",
              item.type === 'audio' && "bg-green-500/80 text-white",
              item.type === 'debate' && "bg-orange-500/80 text-white",
              item.type === 'series' && "bg-purple-500/80 text-white"
            )}>
              {item.type === 'video' && <Video className="w-3 h-3 inline mr-1" />}
              {item.type === 'audio' && <Headphones className="w-3 h-3 inline mr-1" />}
              {item.type === 'debate' && <Mic className="w-3 h-3 inline mr-1" />}
              {item.type === 'series' && <Sparkles className="w-3 h-3 inline mr-1" />}
              {item.type === 'video' && 'Vidéo'}
              {item.type === 'audio' && 'Audio'}
              {item.type === 'debate' && 'Débat'}
              {item.type === 'series' && 'Série'}
            </div>
          </div>

          {/* Trending/Live Badge */}
          {(item.trending || item.live) && (
            <div className="absolute top-4 right-4 z-10">
              <div className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm flex items-center gap-1",
                item.trending && "bg-orange-500/80 text-white",
                item.live && "bg-red-500/80 text-white animate-pulse"
              )}>
                {item.trending && <TrendingUp className="w-3 h-3" />}
                {item.live && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                {item.trending && 'Tendance'}
                {item.live && 'LIVE'}
              </div>
            </div>
          )}

          {/* Hover Overlay */}
          <AnimatePresence>
            {hoveredCard === item.id && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
              >
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/25"
                    onClick={() => setPlayingPreview(playingPreview === item.id ? null : item.id)}
                  >
                    {playingPreview === item.id ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </motion.button>
                  
                  {item.preview?.audio && item.preview.waveform && (
                    <div className="flex items-center gap-1 px-4 py-2 bg-white/10 rounded-full">
                      {item.preview.waveform.map((height, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            height: playingPreview === item.id ? `${height * 20}px` : `${height * 12}px`
                          }}
                          className="w-1 bg-orange-400 rounded-full"
                          style={{ height: `${height * 12}px` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Duration */}
          <div className="absolute bottom-4 right-4 z-10">
            <div className="px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-xs text-white">
              {item.duration}
            </div>
          </div>
        </div>

        {/* Content Info */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Creator Avatar */}
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-white">
                {item.creator.split(' ').map(n => n[0]).join('')}
              </span>
            </div>

            {/* Content Details */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors">
                {item.title}
              </h3>
              
              <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                <span>{item.creator}</span>
                <span>•</span>
                <span>{item.views} vues</span>
                <span>•</span>
                <span>{item.timestamp}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={cn(
                    "flex items-center gap-2 text-sm transition-colors",
                    isLiked ? "text-orange-400" : "text-white/60 hover:text-white"
                  )}
                >
                  <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                  <span>{item.likes}</span>
                </button>
                
                <button className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span>{item.comments}</span>
                </button>
                
                <button className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                  <Share className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={cn(
                    "flex items-center gap-2 text-sm transition-colors",
                    isBookmarked ? "text-orange-400" : "text-white/60 hover:text-white"
                  )}
                >
                  <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
                </button>
              </div>
            </div>

            {/* More Options */}
            <button className="text-white/40 hover:text-white transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <motion.div
        style={{ opacity: headerOpacity, scale: headerScale }}
        className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10"
      >
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {immersive ? 'Expérience Immersive' : 'Feed Culturel'}
              </h1>
              <p className="text-white/60">
                {immersive 
                  ? 'Plongez dans un contenu culturel sans distraction' 
                  : 'Découvrez les débats et contenus qui animent l\'Afrique'
                }
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                <Clock className="w-4 h-4 inline mr-2" />
                Récent
              </button>
              <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white transition-colors">
                <Flame className="w-4 h-4 inline mr-2" />
                Tendance
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Feed Content */}
      <div 
        ref={containerRef}
        className={cn(
          "flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10",
          immersive ? "p-8" : "p-6"
        )}
      >
        <div className={cn(
          "space-y-6",
          immersive ? "max-w-6xl mx-auto" : "max-w-2xl mx-auto"
        )}>
          {mockContent.map((item, index) => (
            <ContentCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};
