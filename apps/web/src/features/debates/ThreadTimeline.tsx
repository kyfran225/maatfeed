import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  MessageSquare, 
  Users, 
  ChevronDown, 
  ChevronRight,
  Bot,
  User,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface ThreadTimelineProps {
  contentId: string;
}

interface TimelineComment {
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
  likeCount: number;
  replyCount: number;
  debateScore: number;
  qualityScore: number;
  mentions: string[];
}

interface TimelineGroup {
  timeGroup: string;
  comments: TimelineComment[];
  count: number;
}

export function ThreadTimeline({ contentId }: ThreadTimelineProps) {
  const [timeline, setTimeline] = useState<TimelineGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTimeline();
  }, [contentId]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/debates/${contentId}/timeline`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch timeline');
      }
      
      const data = await response.json();
      if (data.success) {
        setTimeline(data.data.timeline);
        // Auto-expand first 3 groups
        const firstGroups = data.data.timeline.slice(0, 3).map((group: TimelineGroup) => group.timeGroup);
        setExpandedGroups(new Set(firstGroups));
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleGroupExpansion = (timeGroup: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(timeGroup)) {
        newSet.delete(timeGroup);
      } else {
        newSet.add(timeGroup);
      }
      return newSet;
    });
  };

  const formatCommentBody = (body: string, maxLength: number = 200) => {
    if (body.length <= maxLength) return body;
    return body.substring(0, maxLength) + '...';
  };

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

  const getScoreColor = (score: number) => {
    if (score > 20) return 'text-green-400';
    if (score > 10) return 'text-orange-400';
    if (score > 5) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getQualityColor = (score: number) => {
    if (score > 0.8) return 'text-green-400';
    if (score > 0.6) return 'text-blue-400';
    if (score > 0.4) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const scrollToComment = (commentId: string) => {
    const element = document.getElementById(`comment-${commentId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      element.classList.add('ring-2', 'ring-orange-500');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-orange-500');
      }, 3000);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-1/4" />
            <div className="h-16 bg-gray-700 rounded" />
            <div className="h-16 bg-gray-700 rounded" />
            <div className="h-16 bg-gray-700 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-400">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Erreur: {error}</p>
            <button
              onClick={fetchTimeline}
              className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm"
            >
              Réessayer
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (timeline.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Clock className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-medium mb-2">Aucune activité</h3>
          <p className="text-gray-400">
            Cette discussion n'a pas encore d'activité à afficher.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Chronologie de la Discussion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{timeline.length}</p>
              <p className="text-sm text-gray-400">Périodes actives</p>
            </div>
            
            <div className="text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">
                {timeline.reduce((sum, group) => sum + group.count, 0)}
              </p>
              <p className="text-sm text-gray-400">Total messages</p>
            </div>
            
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <p className="text-2xl font-bold">
                {Math.max(...timeline.map(group => group.count), 0)}
              </p>
              <p className="text-sm text-gray-400">Pic d'activité</p>
            </div>
            
            <div className="text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">
                {new Set(timeline.flatMap(group => 
                  group.comments.map(comment => comment.author.id)
                )).size}
              </p>
              <p className="text-sm text-gray-400">Participants uniques</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Groups */}
      <div className="space-y-4">
        {timeline.map((group, groupIndex) => {
          const isExpanded = expandedGroups.has(group.timeGroup);
          
          return (
            <Card key={group.timeGroup} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-800/50 transition-colors"
                onClick={() => toggleGroupExpansion(group.timeGroup)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                      <Clock className="w-4 h-4 text-orange-500" />
                    </div>
                    
                    <div>
                      <h3 className="font-medium">{group.timeGroup}</h3>
                      <p className="text-sm text-gray-400">
                        {group.count} message{group.count > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <Badge variant="secondary" className="bg-orange-600/20 text-orange-400">
                    {group.count}
                  </Badge>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {group.comments.map((comment, commentIndex) => (
                      <div 
                        key={comment.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => scrollToComment(comment.id)}
                      >
                        <Avatar className="w-8 h-8 flex-shrink-0">
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
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm truncate">
                              {comment.aiGenerated ? comment.aiPersona?.name : comment.author.name}
                            </span>
                            
                            {comment.aiGenerated && (
                              <Badge variant="secondary" className="bg-purple-600/20 text-purple-400 text-xs">
                                IA
                              </Badge>
                            )}
                            
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(comment.createdAt)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-300 mb-2 line-clamp-3">
                            {formatCommentBody(comment.body)}
                          </p>
                          
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            {comment.likeCount > 0 && (
                              <span>❤️ {comment.likeCount}</span>
                            )}
                            
                            {comment.replyCount > 0 && (
                              <span>💬 {comment.replyCount}</span>
                            )}
                            
                            {comment.debateScore > 0 && (
                              <span className={getScoreColor(comment.debateScore)}>
                                🔥 {comment.debateScore}
                              </span>
                            )}
                            
                            {comment.qualityScore > 0 && (
                              <span className={getQualityColor(comment.qualityScore)}>
                                ⭐ {(comment.qualityScore * 100).toFixed(0)}%
                              </span>
                            )}
                          </div>
                          
                          {comment.mentions && comment.mentions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {comment.mentions.map((mention, index) => (
                                <Badge key={index} variant="outline" className="text-xs bg-gray-700 border-gray-600">
                                  @{mention}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
      
      {/* Load More */}
      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => {
            // Load more timeline data
            fetchTimeline();
          }}
          className="bg-gray-800 border-gray-700 hover:bg-gray-700"
        >
          Charger plus d'activité
        </Button>
      </div>
    </div>
  );
}
