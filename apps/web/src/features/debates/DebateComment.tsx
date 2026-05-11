import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  MoreHorizontal, 
  Pin, 
  Flag, 
  ChevronDown, 
  ChevronRight,
  User,
  Bot,
  Star,
  TrendingUp,
  Clock
} from 'lucide-react';

interface DebateCommentProps {
  comment: {
    id: string;
    body: string;
    author: {
      id: string;
      name: string;
      avatar?: string;
    };
    aiGenerated?: boolean;
    aiPersona?: {
      id: string;
      name: string;
      avatar: string;
    };
    createdAt: Date;
    updatedAt: Date;
    likeCount: number;
    replyCount: number;
    debateScore: number;
    qualityScore: number;
    moderationStatus: "approved" | "blocked" | "hidden";
    isDeleted: boolean;
    mentions: string[];
    depth: number;
    children: any[];
    isHighlighted?: boolean;
    isPinned?: boolean;
  };
  depth: number;
  isExpanded: boolean;
  isCollapsed: boolean;
  onToggleExpand: () => void;
  onToggleCollapse: () => void;
  onReply: () => void;
  onLike: () => void;
  onPin: () => void;
  currentUser?: any;
}

export function DebateComment({
  comment,
  depth,
  isExpanded,
  isCollapsed,
  onToggleExpand,
  onToggleCollapse,
  onReply,
  onLike,
  onPin,
  currentUser
}: DebateCommentProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'à l\'instant';
    if (minutes < 60) return `il y a ${minutes} min`;
    if (hours < 24) return `il y a ${hours}h`;
    if (days < 7) return `il y a ${days}j`;
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike();
  };

  const getScoreColor = (score: number) => {
    if (score > 20) return 'text-green-400';
    if (score > 10) return 'text-orange-400';
    if (score > 5) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getQualityIndicator = (score: number) => {
    if (score > 0.8) return { icon: Star, color: 'text-green-400', label: 'Excellente' };
    if (score > 0.6) return { icon: TrendingUp, color: 'text-blue-400', label: 'Bonne' };
    if (score > 0.4) return { icon: Star, color: 'text-yellow-400', label: 'Moyenne' };
    return { icon: Star, color: 'text-gray-400', label: 'Faible' };
  };

  const qualityIndicator = getQualityIndicator(comment.qualityScore);
  const hasChildren = comment.children && comment.children.length > 0;

  return (
    <Card 
      id={`comment-${comment.id}`}
      className={`transition-all duration-200 ${
        comment.isHighlighted ? 'ring-2 ring-orange-500/50 bg-orange-950/20' : ''
      } ${
        comment.isPinned ? 'border-orange-500/50' : ''
      } ${depth > 0 ? 'border-l-2 border-l-gray-700' : ''}`}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              {comment.aiGenerated ? (
                <>
                  <AvatarImage src={comment.aiPersona?.avatar} />
                  <AvatarFallback className="bg-purple-600">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </>
              ) : (
                <>
                  <AvatarImage src={comment.author.avatar} />
                  <AvatarFallback className="bg-gray-600">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </>
              )}
            </Avatar>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {comment.aiGenerated ? comment.aiPersona?.name : comment.author.name}
                </span>
                
                {comment.aiGenerated && (
                  <Badge variant="secondary" className="bg-purple-600/20 text-purple-400 text-xs">
                    <Bot className="w-3 h-3 mr-1" />
                    IA
                  </Badge>
                )}
                
                {comment.isPinned && (
                  <Badge variant="secondary" className="bg-orange-600/20 text-orange-400 text-xs">
                    <Pin className="w-3 h-3 mr-1" />
                    Épinglé
                  </Badge>
                )}
                
                {comment.isHighlighted && (
                  <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-400 text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Mis en avant
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(comment.createdAt)}
                {comment.updatedAt !== comment.createdAt && (
                  <span>(modifié)</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              className="h-8 w-8 p-0"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
            
            {showActions && (
              <div className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-48">
                <div className="py-1">
                  {currentUser && (
                    <button
                      onClick={() => {
                        onReply();
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Répondre
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      handleLike();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    {isLiked ? 'Retirer le like' : 'Liker'}
                  </button>
                  
                  <button
                    onClick={() => {
                      onPin();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Pin className="w-4 h-4" />
                    {comment.isPinned ? 'Désépingler' : 'Épingler'}
                  </button>
                  
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Partager
                  </button>
                  
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 text-red-400">
                    <Flag className="w-4 h-4" />
                    Signaler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comment body */}
        <div className="mb-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {comment.body}
          </p>
        </div>

        {/* Quality and engagement indicators */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Quality indicator */}
            <div className="flex items-center gap-1">
              <qualityIndicator.icon className={`w-3 h-3 ${qualityIndicator.color}`} />
              <span className={`text-xs ${qualityIndicator.color}`}>
                {qualityIndicator.label}
              </span>
            </div>
            
            {/* Debate score */}
            {comment.debateScore > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp className={`w-3 h-3 ${getScoreColor(comment.debateScore)}`} />
                <span className={`text-xs ${getScoreColor(comment.debateScore)}`}>
                  {comment.debateScore}
                </span>
              </div>
            )}
          </div>

          {/* Engagement stats */}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {comment.likeCount > 0 && (
              <span>{comment.likeCount} like{comment.likeCount > 1 ? 's' : ''}</span>
            )}
            {comment.replyCount > 0 && (
              <span>{comment.replyCount} réponse{comment.replyCount > 1 ? 's' : ''}</span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {currentUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReply}
              className="h-8 px-3 text-xs"
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              Répondre
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`h-8 px-3 text-xs ${isLiked ? 'text-red-400' : 'text-gray-400'}`}
          >
            <Heart className={`w-3 h-3 mr-1 ${isLiked ? 'fill-current' : ''}`} />
            {comment.likeCount > 0 && comment.likeCount}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs text-gray-400"
          >
            <Share2 className="w-3 h-3 mr-1" />
            Partager
          </Button>

          {/* Thread collapse/expand */}
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={isCollapsed ? onToggleCollapse : onToggleCollapse}
              className="h-8 px-3 text-xs text-gray-400"
            >
              {isCollapsed ? (
                <>
                  <ChevronRight className="w-3 h-3 mr-1" />
                  Déplier ({comment.children.length})
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 mr-1" />
                  Replier
                </>
              )}
            </Button>
          )}
        </div>

        {/* Mentions */}
        {comment.mentions && comment.mentions.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="flex flex-wrap gap-1">
              {comment.mentions.map((mention, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-gray-800 border-gray-600">
                  @{mention}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
