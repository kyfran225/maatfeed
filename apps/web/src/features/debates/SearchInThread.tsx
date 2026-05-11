import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  X, 
  Clock, 
  User, 
  Bot,
  MessageSquare,
  TrendingUp,
  Star,
  ChevronDown
} from 'lucide-react';

interface SearchInThreadProps {
  contentId: string;
  onResultSelect: (commentId: string) => void;
}

interface SearchResult {
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
  highlights: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

export function SearchInThread({ contentId, onResultSelect }: SearchInThreadProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        performSearch(query);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query]);

  const performSearch = async (searchQuery: string, page: number = 1) => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `/api/debates/${contentId}/search?q=${encodeURIComponent(searchQuery)}&page=${page}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      if (data.success) {
        if (page === 1) {
          setResults(data.data.comments);
        } else {
          setResults(prev => [...prev, ...data.data.comments]);
        }
        setTotalCount(data.data.totalCount);
        setHasNext(data.data.pageInfo.hasNext);
        setCurrentPage(data.data.pageInfo.currentPage);
        setShowResults(true);
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const highlightText = (text: string, highlights: Array<{ start: number; end: number; text: string }>) => {
    if (!highlights.length) return text;
    
    let highlightedText = text;
    let offset = 0;
    
    highlights.forEach((highlight, index) => {
      const start = highlight.start + offset;
      const end = highlight.end + offset;
      
      highlightedText = 
        highlightedText.slice(0, start) +
        `<mark class="bg-orange-600/50 px-1 rounded">${highlightedText.slice(start, end)}</mark>` +
        highlightedText.slice(end);
      
      offset += 29; // Length of the mark tag
    });
    
    return highlightedText;
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

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleResultClick = (result: SearchResult) => {
    onResultSelect(result.id);
    setShowResults(false);
    setQuery('');
  };

  const loadMore = () => {
    if (hasNext && !loading) {
      performSearch(query, currentPage + 1);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  const getScoreColor = (score: number) => {
    if (score > 20) return 'text-green-400';
    if (score > 10) return 'text-orange-400';
    if (score > 5) return 'text-yellow-400';
    return 'text-gray-400';
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher dans la discussion..."
          className="pl-10 pr-10 bg-gray-800 border-gray-700 focus:border-orange-500 focus:ring-orange-500/20"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            Recherche en cours...
          </div>
        </div>
      )}

      {/* Search Results */}
      {showResults && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Results header */}
          <div className="p-3 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                {totalCount} résultat{totalCount > 1 ? 's' : ''} pour "{query}"
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Results list */}
          <div className="max-h-80 overflow-y-auto">
            {results.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucun résultat trouvé</p>
                <p className="text-sm mt-1">
                  Essayez avec d'autres mots-clés
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {results.map((result) => (
                  <Card 
                    key={result.id}
                    className="border-0 rounded-none cursor-pointer hover:bg-gray-700/50 transition-colors"
                    onClick={() => handleResultClick(result)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          {result.aiGenerated ? (
                            <>
                              <AvatarImage src={result.aiPersona?.avatar} />
                              <AvatarFallback className="bg-purple-600">
                                <Bot className="w-4 h-4" />
                              </AvatarFallback>
                            </>
                          ) : (
                            <>
                              <AvatarImage src={result.author.avatar} />
                              <AvatarFallback className="bg-gray-600">
                                <User className="w-4 h-4" />
                              </AvatarFallback>
                            </>
                          )}
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm truncate">
                              {result.aiGenerated ? result.aiPersona?.name : result.author.name}
                            </span>
                            
                            {result.aiGenerated && (
                              <Badge variant="secondary" className="bg-purple-600/20 text-purple-400 text-xs">
                                IA
                              </Badge>
                            )}
                            
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(result.createdAt)}
                            </span>
                          </div>
                          
                          <div 
                            className="text-sm text-gray-300 mb-2 line-clamp-2"
                            dangerouslySetInnerHTML={{
                              __html: highlightText(truncateText(result.body), result.highlights)
                            }}
                          />
                          
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            {result.likeCount > 0 && (
                              <span>❤️ {result.likeCount}</span>
                            )}
                            
                            {result.replyCount > 0 && (
                              <span>💬 {result.replyCount}</span>
                            )}
                            
                            {result.debateScore > 0 && (
                              <span className={getScoreColor(result.debateScore)}>
                                🔥 {result.debateScore}
                              </span>
                            )}
                            
                            {result.qualityScore > 0 && (
                              <span className="text-green-400">
                                ⭐ {(result.qualityScore * 100).toFixed(0)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Load more */}
          {hasNext && (
            <div className="p-3 border-t border-gray-700">
              <Button
                variant="ghost"
                onClick={loadMore}
                className="w-full text-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-2" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Charger plus de résultats
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
