import { useState, useEffect } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  Sparkles, 
  Brain, 
  MessageCircle, 
  ThumbsUp, 
  Reply,
  Clock,
  Zap,
  Eye,
  Share2,
  Bookmark,
  Star
} from "lucide-react";

function resolveAvatarDisplayUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  if (url.startsWith("/")) return `${window.location.origin}${url}`;
  return url;
}

// Interface pour les commentaires IA (matches backend schema)
interface AIComment {
  _id: string;
  body: string;
  aiPersona: string;
  aiPersonaName: string;
  aiPersonaAvatar: string;
  createdAt: string;
  likeCount: number;
  replyCount: number;
  debateScore: number;
  aiGenerated: boolean;
  userId: null; // null for AI comments
  contentId: string;
  mentions: string[];
}

const AICommentCard = ({ comment, onLike, onReply, showAI = true }: { 
  comment: AIComment; 
  onLike: (commentId: string) => void;
  onReply: (commentId: string) => void;
  showAI?: boolean;
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isAIReplying, setIsAIReplying] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(comment._id);
  };

  const handleReply = () => {
    setShowReply(!showReply);
  };

  const handleAIReply = async () => {
    setIsAIReplying(true);
    
    try {
      const response = await fetch('/api/ai/intervene', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: comment.contentId,
          type: 'comment',
          trigger: 'request_expertise'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // L'API crée automatiquement le commentaire, on ferme juste l'interface
          setShowReply(false);
          setReplyText("");
          
          // Notifier le parent pour recharger les commentaires
          onReply(comment._id);
        } else {
          console.error('AI intervention failed:', data.error);
        }
      } else {
        console.error('API call failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error calling AI API:', error);
    } finally {
      setIsAIReplying(false);
    }
  };

  const getPersonaColor = (persona: string) => {
    const colors: Record<string, string> = {
      "maat_sage": "from-purple-500 to-indigo-600",
      "kemet_expert": "from-amber-500 to-orange-600", 
      "community_builder": "from-green-500 to-teal-600",
      "catholic_theologian": "from-blue-600 to-indigo-700",
      "muslim_scholar": "from-emerald-500 to-green-700",
      "jewish_scholar": "from-blue-500 to-cyan-600"
    };
    return colors[persona] || "from-blue-500 to-purple-600";
  };

  const getPersonaIcon = (persona: string) => {
    const icons: Record<string, React.ReactElement> = {
      "maat_sage": <Brain className="w-4 h-4" />,
      "kemet_expert": <Eye className="w-4 h-4" />,
      "community_builder": <MessageCircle className="w-4 h-4" />,
      "catholic_theologian": <Bot className="w-4 h-4" />,
      "muslim_scholar": <Zap className="w-4 h-4" />,
      "jewish_scholar": <Star className="w-4 h-4" />
    };
    return icons[persona] || <Bot className="w-4 h-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative ${showAI ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20' : 'bg-sand/10'} backdrop-blur-lg rounded-xl p-3 sm:p-4 border ${showAI ? 'border-blue-500/30' : 'border-sand/20'}`}
    >
      
      <div className="flex items-start space-x-2 sm:space-x-3">
        {/* Avatar IA */}
        <div className={`relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${getPersonaColor(comment.aiPersona)} rounded-full p-[1px] flex-shrink-0`}>
          <img
            src={resolveAvatarDisplayUrl(comment.aiPersonaAvatar) || "/avatars/ai/maat_sage-64.png"}
            alt={comment.aiPersonaName}
            className="w-full h-full rounded-full object-cover bg-ink"
            onError={(e) => {
              e.currentTarget.src = "/avatars/ai/maat_sage-64.png";
            }}
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-ink border border-cyan-400/30 flex items-center justify-center">
            {getPersonaIcon(comment.aiPersona)}
          </div>
        </div>

        <div className="flex-1 min-w-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-white text-sm sm:text-base flex items-center space-x-1 sm:space-x-2 truncate">
                <span className="truncate">{comment.aiPersonaName}</span>
                {showAI && (
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
                  >
                    <Sparkles className="w-3 h-3 text-blue-400" />
                  </motion.div>
                )}
              </h4>
              <div className="text-xs text-sand/60 hidden sm:block">
                {new Date(comment.createdAt).toLocaleString()}
              </div>
            </div>

            {/* Score de débat */}
            {comment.debateScore > 5 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1"
              >
                <Zap className="w-3 h-3" />
                <span>{comment.debateScore}</span>
              </motion.div>
            )}
          </div>

          {/* Contenu du commentaire */}
          <div className="text-sand/80 mb-3 leading-relaxed">
            <p>{comment.body}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              className={`flex items-center space-x-1 text-xs transition-colors flex-shrink-0 ${
                isLiked ? "text-red-400" : "text-sand/60 hover:text-white"
              }`}
            >
              <ThumbsUp className={`w-3 h-3 sm:w-4 sm:h-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="hidden sm:inline">{comment.likeCount + (isLiked ? 1 : 0)}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReply}
              className="flex items-center space-x-1 text-xs text-sand/60 hover:text-white transition-colors flex-shrink-0"
            >
              <Reply className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{comment.replyCount}</span>
            </motion.button>

            <div className="flex items-center space-x-1 text-xs text-sand/60 flex-shrink-0 hidden sm:flex">
              <Share2 className="w-4 h-4" />
              <span>Partager</span>
            </div>

            <div className="flex items-center space-x-1 text-xs text-sand/60 flex-shrink-0 hidden sm:flex">
              <Bookmark className="w-4 h-4" />
              <span>Sauver</span>
            </div>

            {/* Bouton réponse IA */}
            {showAI && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAIReply}
                disabled={isAIReplying}
                className="flex items-center space-x-1 text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full transition-colors disabled:opacity-50 flex-shrink-0"
              >
                <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{isAIReplying ? "Réponse IA..." : "Répondre avec l'IA"}</span>
              </motion.button>
            )}
          </div>

          {/* Zone de réponse */}
          <AnimatePresence>
            {showReply && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t border-sand/20"
              >
                <div className="space-y-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Partagez votre perspective..."
                    className="w-full bg-sand/10 border border-sand/20 rounded-lg px-3 py-2 text-white placeholder-sand/50 focus:outline-none focus:border-blue-500/50 resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowReply(false)}
                      className="px-3 py-1 text-sand/60 hover:text-white transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => {
                        // Envoyer la réponse
                        setShowReply(false);
                        setReplyText("");
                      }}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Répondre
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const AICommentThread = ({ postId, comments, onNewComment }: { 
  postId: string; 
  comments: AIComment[]; 
  onNewComment: () => void;
}) => {
  const [aiComments, setAiComments] = useState<AIComment[]>(comments);
  const [isAITyping, setIsAITyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Recharger les commentaires quand le parent en signale
  const refreshComments = async () => {
    try {
      const response = await fetch(`/api/comments/${postId}?ai_only=true`);
      const data = await response.json();
      
      if (data.success) {
        setAiComments(data.data.filter((c: any) => c.aiGenerated));
      }
    } catch (error) {
      console.error("Error refreshing AI comments:", error);
    }
  };

  useEffect(() => {
    refreshComments();
  }, [postId, onNewComment]);

  const triggerAIResponse = async () => {
    setIsAITyping(true);
    
    try {
      const response = await fetch('/api/ai/intervene', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          type: 'comment',
          trigger: 'request_expertise'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Recharger les commentaires pour inclure le nouveau
          await refreshComments();
          onNewComment();
        } else {
          console.error('AI intervention failed:', data.error);
        }
      } else {
        console.error('API call failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error triggering AI response:', error);
    } finally {
      setIsAITyping(false);
    }
  };

  const handleLike = (commentId: string) => {
    // Implémenter le like via API si nécessaire
    console.log("Like comment:", commentId);
  };

  const handleReply = (commentId: string) => {
    // Afficher la zone de réponse pour ce commentaire spécifique
    setReplyingTo(commentId);
    setReplyText("");
  };

  const handleUserReply = async () => {
    if (!replyText.trim() || !replyingTo) return;
    
    try {
      const response = await fetch('/api/comments/' + postId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: replyText,
          parentCommentId: replyingTo
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Recharger les commentaires
          await refreshComments();
          onNewComment();
          // Fermer l'interface de réponse
          setReplyingTo(null);
          setReplyText("");
        }
      }
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header du thread IA */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-lg rounded-xl p-3 sm:p-4 border border-blue-500/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <img
                src="/avatars/ai/maat_sage-64.png"
                alt="IA MAAT"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Discussion avec l'IA</h3>
              <p className="text-xs sm:text-sm text-sand/60">
                L'IA participe activement à cette discussion
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isAITyping && (
              <motion.div
                animate={{
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity
                }}
                className="flex items-center space-x-1 text-blue-400 text-sm"
              >
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>IA active</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Commentaires IA */}
      <AnimatePresence mode="wait">
        {aiComments.map((comment, index) => (
          <div key={comment._id}>
            <AICommentCard
              comment={comment}
              onLike={handleLike}
              onReply={handleReply}
              showAI={true}
            />
            
            {/* Interface de réponse utilisateur */}
            <AnimatePresence>
              {replyingTo === comment._id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="ml-8 sm:ml-12 mt-2 p-3 bg-sand/10 rounded-lg border border-sand/20"
                >
                  <div className="space-y-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Répondez à ce commentaire..."
                      className="w-full bg-sand/5 border border-sand/20 rounded-lg px-3 py-2 text-white placeholder-sand/50 focus:outline-none focus:border-blue-500/50 resize-none"
                      rows={3}
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText("");
                        }}
                        className="px-3 py-1 text-sand/60 hover:text-white transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleUserReply}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Répondre
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </AnimatePresence>

      {/* Bouton pour inviter l'IA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={triggerAIResponse}
          disabled={isAITyping}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-medium transition-all disabled:opacity-50 flex items-center space-x-2 mx-auto text-sm sm:text-base"
        >
          <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">{isAITyping ? "L'IA réfléchit..." : "Inviter l'IA à participer"}</span>
          <span className="sm:hidden">{isAITyping ? "IA..." : "IA"}</span>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default function AICommentComponent({ postId }: { postId: string }) {
  const [comments, setComments] = useState<AIComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadAIComments = async () => {
    try {
      const response = await fetch(`/api/comments/${postId}?ai_only=true`);
      const data = await response.json();
      
      if (data.success) {
        setComments(data.data.filter((c: any) => c.aiGenerated));
      }
    } catch (error) {
      console.error("Error loading AI comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewComment = () => {
    // Forcer le rechargement des commentaires
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    loadAIComments();
  }, [postId, refreshKey]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-sand/10 rounded-xl"></div>
        <div className="h-32 bg-sand/10 rounded-xl"></div>
      </div>
    );
  }

  return <AICommentThread postId={postId} comments={comments} onNewComment={handleNewComment} />;
}
