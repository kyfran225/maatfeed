import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { DebateComment } from './DebateComment';
import { DebateReplyComposer } from './DebateReplyComposer';
import { ThreadStats } from './ThreadStats';
import { ThreadTimeline } from './ThreadTimeline';
import { SearchInThread } from './SearchInThread';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  BarChart3, 
  Clock, 
  Search, 
  Filter, 
  Pin, 
  Users,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface DebateThreadNode {
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
  children: DebateThreadNode[];
  isHighlighted?: boolean;
  isPinned?: boolean;
}

interface DebateThreadResponse {
  thread: DebateThreadNode[];
  totalCount: number;
  pageInfo: {
    hasNext: boolean;
    hasPrev: boolean;
    currentPage: number;
    totalPages: number;
  };
  stats: {
    totalComments: number;
    totalReplies: number;
    participants: number;
    averageDepth: number;
    maxDepth: number;
    topContributors: Array<{
      id: string;
      name: string;
      avatar?: string;
      count: number;
    }>;
  };
}

interface DebateThreadProps {
  contentId: string;
  contentTitle?: string;
  className?: string;
}

type SortOption = 'newest' | 'oldest' | 'popular' | 'controversial' | 'quality';
type ViewMode = 'thread' | 'timeline' | 'stats';

export function DebateThread({ contentId, contentTitle, className }: DebateThreadProps) {
  const { user } = useAuth();
  const { socket } = useSocket();
  
  const [threadData, setThreadData] = useState<DebateThreadResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('thread');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [collapsedThreads, setCollapsedThreads] = useState<Set<string>>(new Set());

  const fetchThread = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/debates/${contentId}/thread?sort=${sortBy}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch thread');
      }
      
      const data = await response.json();
      if (data.success) {
        setThreadData(data.data);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [contentId, sortBy]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  useEffect(() => {
    if (socket) {
      socket.on('newReply', (data) => {
        if (data.contentId === contentId) {
          fetchThread();
        }
      });
      
      socket.on('commentUpdated', (data) => {
        if (data.contentId === contentId) {
          fetchThread();
        }
      });
      
      return () => {
        socket.off('newReply');
        socket.off('commentUpdated');
      };
    }
  }, [socket, contentId, fetchThread]);

  const toggleCommentExpansion = (commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const toggleThreadCollapse = (commentId: string) => {
    setCollapsedThreads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleReply = async (parentCommentId: string, body: string, mentions: string[]) => {
    try {
      const response = await fetch(`/api/debates/${contentId}/comments/${parentCommentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ body, mentions })
      });
      
      if (!response.ok) {
        throw new Error('Failed to post reply');
      }
      
      setReplyingTo(null);
      fetchThread();
    } catch (err) {
      console.error('Failed to reply:', err);
    }
  };

  const handleCommentAction = async (commentId: string, action: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        fetchThread();
      }
    } catch (err) {
      console.error(`Failed to ${action}:`, err);
    }
  };

  const renderComment = (comment: DebateThreadNode, depth: number = 0) => {
    const isCollapsed = collapsedThreads.has(comment.id);
    const isExpanded = expandedComments.has(comment.id);
    const hasChildren = comment.children && comment.children.length > 0;
    
    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-4 md:ml-8' : ''} mb-4`}>
        <DebateComment
          comment={comment}
          depth={depth}
          isExpanded={isExpanded}
          isCollapsed={isCollapsed}
          onToggleExpand={() => toggleCommentExpansion(comment.id)}
          onToggleCollapse={() => toggleThreadCollapse(comment.id)}
          onReply={() => setReplyingTo(comment.id)}
          onLike={() => handleCommentAction(comment.id, 'like')}
          onPin={() => handleCommentAction(comment.id, 'pin')}
          currentUser={user}
        />
        
        {replyingTo === comment.id && (
          <div className="mt-2 ml-4 md:ml-8">
            <DebateReplyComposer
              onSubmit={(body, mentions) => handleReply(comment.id, body, mentions)}
              onCancel={() => setReplyingTo(null)}
              placeholder={`Répondre à ${comment.author.name}...`}
            />
          </div>
        )}
        
        {hasChildren && !isCollapsed && (
          <div className="relative">
            {depth > 0 && (
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-700 ml-4" />
            )}
            {comment.children.map(child => renderComment(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-1/4" />
            <div className="h-20 bg-gray-700 rounded" />
            <div className="h-16 bg-gray-700 rounded ml-8" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Erreur: {error}</p>
            <Button onClick={fetchThread} className="mt-4">
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!threadData) {
    return null;
  }

  return (
    <div className={className}>
      {/* Header with stats and controls */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-orange-500" />
              <CardTitle className="text-lg">
                {contentTitle || 'Discussion'}
              </CardTitle>
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
                {threadData.totalCount} commentaires
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="w-4 h-4" />
              </Button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm"
              >
                <option value="newest">Plus récents</option>
                <option value="oldest">Plus anciens</option>
                <option value="popular">Populaires</option>
                <option value="controversial">Controversés</option>
                <option value="quality">Qualité</option>
              </select>
            </div>
          </div>
          
          {/* Quick stats */}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {threadData.stats.participants} participants
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Profondeur moyenne: {threadData.stats.averageDepth.toFixed(1)}
            </div>
            {threadData.stats.maxDepth > 0 && (
              <div className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4" />
                Max: {threadData.stats.maxDepth}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Search bar */}
      {showSearch && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <SearchInThread
              contentId={contentId}
              onResultSelect={(commentId) => {
                // Scroll to comment and highlight
                const element = document.getElementById(`comment-${commentId}`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                  element.classList.add('ring-2', 'ring-orange-500');
                  setTimeout(() => {
                    element.classList.remove('ring-2', 'ring-orange-500');
                  }, 3000);
                }
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* View mode tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="thread" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Discussion
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Chronologie
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Statistiques
          </TabsTrigger>
        </TabsList>

        <TabsContent value="thread" className="space-y-4">
          {threadData.thread.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-lg font-medium mb-2">Aucun commentaire</h3>
                <p className="text-gray-400 mb-4">
                  Soyez le premier à participer à cette discussion !
                </p>
                {user && (
                  <DebateReplyComposer
                    onSubmit={(body, mentions) => handleReply('root', body, mentions)}
                    placeholder="Lancez la discussion..."
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Root comment composer */}
              {user && (
                <Card>
                  <CardContent className="p-4">
                    <DebateReplyComposer
                      onSubmit={(body, mentions) => handleReply('root', body, mentions)}
                      placeholder="Participer à la discussion..."
                    />
                  </CardContent>
                </Card>
              )}
              
              {/* Thread comments */}
              <div className="space-y-4">
                {threadData.thread.map(comment => renderComment(comment))}
              </div>
              
              {/* Pagination */}
              {threadData.pageInfo.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={!threadData.pageInfo.hasPrev}
                    onClick={() => {
                      // Handle pagination
                    }}
                  >
                    Précédent
                  </Button>
                  <span className="px-4 py-2 text-sm text-gray-400">
                    Page {threadData.pageInfo.currentPage} / {threadData.pageInfo.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={!threadData.pageInfo.hasNext}
                    onClick={() => {
                      // Handle pagination
                    }}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="timeline">
          <ThreadTimeline contentId={contentId} />
        </TabsContent>

        <TabsContent value="stats">
          <ThreadStats contentId={contentId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
