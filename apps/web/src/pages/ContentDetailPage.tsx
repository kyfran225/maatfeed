import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, MessageCircle, Share2, Bookmark, Eye, Check, Compass } from "lucide-react";
import { SEO } from "../components/SEO";
import { useContentSEOMeta } from "../hooks/useSEOMeta";
import { contentService, ContentItem } from "../services/contentService";
import { interactionService, EngagementData } from "../services/interactionService";
import { TouchFeedback } from "../components/ui/TouchFeedback";
import { LoadingState } from "../components/ui/LoadingState";
import { RedditVideoPlayer } from "../components/media/RedditVideoPlayer";

const BUCKET_CONFIG: Record<string, { color: string; gradient: string; label: string }> = {
  viral: { color: 'bg-red-500', gradient: 'from-red-500/20 to-orange-500/10', label: 'Viral' },
  educational: { color: 'bg-blue-500', gradient: 'from-blue-500/20 to-cyan-500/10', label: 'Éducatif' },
  deep: { color: 'bg-purple-500', gradient: 'from-purple-500/20 to-pink-500/10', label: 'Profond' }
};

export default function ContentDetailPage() {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [engagement, setEngagement] = useState<EngagementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load dynamic SEO meta tags
  const { meta: seoMeta } = useContentSEOMeta(contentId);

  // Interaction states
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    if (contentId) {
      loadContent(contentId);
      loadEngagement(contentId);
    }
  }, [contentId]);

  const loadContent = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const item = await contentService.getContentById(id);
      if (item) {
        setContent(item);
      } else {
        setError('Contenu non trouvé');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEngagement = async (id: string) => {
    try {
      const data = await interactionService.getEngagement(id);
      setEngagement(data);
      setHasLiked(data.userHasLiked);
      setHasSaved(data.userHasSaved);
    } catch (err) {
      console.error('Failed to load engagement:', err);
    }
  };

  const handleBack = () => {
    // Navigate back to explore - state will be restored from sessionStorage
    navigate('/explore');
  };

  const handleLike = async () => {
    if (!contentId || isLiking) return;
    try {
      setIsLiking(true);
      await interactionService.likeContent(contentId);
      setHasLiked(true);
      // Refresh engagement to get updated count
      await loadEngagement(contentId);
    } catch (err) {
      console.error('Like failed:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    if (!contentId || isSaving) return;
    try {
      setIsSaving(true);
      await interactionService.saveContent(contentId);
      setHasSaved(!hasSaved);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!contentId || isSharing) return;
    try {
      setIsSharing(true);
      await interactionService.shareContent(contentId);
      // Show toast
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
      // Refresh engagement
      await loadEngagement(contentId);
    } catch (err) {
      console.error('Share failed:', err);
    } finally {
      setIsSharing(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Chargement du contenu..." />;
  }

  if (error || !content) {
    return (
      <>
        <SEO pageKey="content" title="Contenu introuvable" />
        <section className="min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Compass className="w-10 h-10 text-sand/40" />
          </div>
          <h1 className="font-display text-2xl text-white mb-3">Contenu introuvable</h1>
          <p className="text-sand/60 mb-8 max-w-xs mx-auto">
            {error || "Ce contenu n'existe pas ou a été supprimé"}
          </p>

          <div className="flex flex-col gap-3">
            <TouchFeedback>
              <button
                onClick={() => navigate('/explore')}
                className="bg-orange hover:bg-orange/90 text-white py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Compass className="w-5 h-5" />
                Retour à l'exploration
              </button>
            </TouchFeedback>
            <TouchFeedback>
              <button
                onClick={() => contentId && loadContent(contentId)}
                className="bg-white/10 hover:bg-white/20 text-sand py-3 px-6 rounded-xl font-medium transition-colors"
              >
                Réessayer
              </button>
            </TouchFeedback>
          </div>
        </motion.div>
      </section>
      </>
    );
  }

  const bucketConfig = BUCKET_CONFIG[content!.bucket] || BUCKET_CONFIG.deep;

  return (
    <>
      <SEO 
        pageKey="content"
        title={seoMeta?.title || content!.title}
        description={seoMeta?.description || content!.description}
        image={seoMeta?.image || content!.thumbnailUrl}
        url={seoMeta?.url || `https://maatfeed.com/content/${contentId}`}
        type={seoMeta?.type || "article"}
        keywords={seoMeta?.keywords || content!.tags}
        publishedTime={seoMeta?.publishedAt}
        modifiedTime={seoMeta?.modifiedAt}
        author={seoMeta?.author}
        structuredData={seoMeta?.schemaData}
      />
      <section className="min-h-screen pb-24">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <TouchFeedback>
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </TouchFeedback>
      </div>

      {/* Media Player / Thumbnail */}
      <div className={`relative ${content.videoUrl?.includes('tiktok.com') ? 'aspect-[9/16]' : 'aspect-video'} overflow-hidden bg-gradient-to-br ${bucketConfig.gradient}`}>
        <RedditVideoPlayer
          src={content.videoUrl || content.audioUrl || ''}
          thumbnail={content.thumbnailUrl}
          title={content.title}
          className="w-full h-full"
        />

        {/* Bucket Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1.5 text-xs font-medium text-white rounded-full ${bucketConfig.color}`}>
            {bucketConfig.label}
          </span>
        </div>

        {/* Share Toast */}
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Lien copié !
            </div>
          </motion.div>
        )}
      </div>

      {/* Content Info */}
      <div className="px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="font-display text-2xl text-white leading-tight mb-3">
            {content.title}
          </h1>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sand font-medium">{content.author}</span>
            <span className="text-sand/40">•</span>
            <span className="text-sand/60 text-sm">
              {new Date(content.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>

          {/* Stats - use engagement data when available */}
          <div className="flex items-center gap-6 mb-6 text-sm text-sand/60">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{(engagement?.views ?? content.views).toLocaleString()} vues</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className={`w-4 h-4 ${hasLiked ? 'text-red-500 fill-red-500' : ''}`} />
              <span>{(engagement?.likes ?? content.likes).toLocaleString()} j'aime</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span>{(engagement?.comments ?? content.comments).toLocaleString()} commentaires</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mb-6">
            <TouchFeedback>
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex-1 py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
                  hasLiked
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-orange hover:bg-orange/90 text-white'
                } ${isLiking ? 'opacity-70' : ''}`}
              >
                <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
                {hasLiked ? 'Aimé' : "J'aime"}
              </button>
            </TouchFeedback>
            <TouchFeedback>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  hasSaved
                    ? 'bg-orange/20 border border-orange/30'
                    : 'bg-white/10 hover:bg-white/20'
                } ${isSaving ? 'opacity-70' : ''}`}
              >
                <Bookmark className={`w-5 h-5 ${hasSaved ? 'text-orange fill-orange' : 'text-sand'}`} />
              </button>
            </TouchFeedback>
            <TouchFeedback>
              <button
                onClick={handleShare}
                disabled={isSharing}
                className={`w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors ${isSharing ? 'opacity-70' : ''}`}
              >
                <Share2 className="w-5 h-5 text-sand" />
              </button>
            </TouchFeedback>
          </div>
        </motion.div>

        {/* Description */}
        {content.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h2 className="text-gold font-semibold mb-2">Description</h2>
            <p className="text-sand/80 leading-relaxed whitespace-pre-line">
              {content.description}
            </p>
          </motion.div>
        )}

        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-gold font-semibold mb-3">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {content.tags.map((tag, index) => {
                // Ensure tag is a string (handle any edge cases)
                const tagString = typeof tag === 'string' ? tag : String(tag);
                return (
                  <span
                    key={`${tagString}-${index}`}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-sand/70 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    #{tagString}
                  </span>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </section>
    </>
  );
}

