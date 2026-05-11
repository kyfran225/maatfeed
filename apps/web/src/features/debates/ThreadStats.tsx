import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  BarChart3, 
  Clock, 
  Star,
  Award,
  Activity,
  Eye,
  Heart,
  Share2
} from 'lucide-react';

interface ThreadStatsProps {
  contentId: string;
}

interface ThreadStatsData {
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
  engagementMetrics?: {
    views: number;
    likes: number;
    shares: number;
    averageReadTime: number;
  };
  qualityMetrics?: {
    averageQuality: number;
    highQualityCount: number;
    moderatedCount: number;
  };
  timeDistribution?: Array<{
    period: string;
    count: number;
    percentage: number;
  }>;
}

export function ThreadStats({ contentId }: ThreadStatsProps) {
  const [stats, setStats] = useState<ThreadStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [contentId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/debates/${contentId}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getEngagementLevel = (participants: number, totalComments: number) => {
    const ratio = totalComments / Math.max(participants, 1);
    if (ratio > 5) return { level: 'Très élevé', color: 'text-green-400', bg: 'bg-green-400/20' };
    if (ratio > 3) return { level: 'Élevé', color: 'text-blue-400', bg: 'bg-blue-400/20' };
    if (ratio > 1.5) return { level: 'Modéré', color: 'text-yellow-400', bg: 'bg-yellow-400/20' };
    return { level: 'Faible', color: 'text-gray-400', bg: 'bg-gray-400/20' };
  };

  const getDepthColor = (depth: number) => {
    if (depth > 5) return 'text-red-400';
    if (depth > 3) return 'text-orange-400';
    if (depth > 1) return 'text-yellow-400';
    return 'text-green-400';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-700 rounded w-1/3" />
              <div className="h-20 bg-gray-700 rounded" />
              <div className="h-16 bg-gray-700 rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-400">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Erreur: {error}</p>
            <button
              onClick={fetchStats}
              className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm"
            >
              Réessayer
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const engagementLevel = getEngagementLevel(stats.participants, stats.totalComments + stats.totalReplies);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Participants</p>
                <p className="text-2xl font-bold">{stats.participants}</p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Messages</p>
                <p className="text-2xl font-bold">{stats.totalComments + stats.totalReplies}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Profondeur Max</p>
                <p className={`text-2xl font-bold ${getDepthColor(stats.maxDepth)}`}>
                  {stats.maxDepth}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Engagement</p>
                <p className={`text-lg font-bold ${engagementLevel.color}`}>
                  {engagementLevel.level}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thread Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analyse du Thread
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Commentaires racine</span>
              <span className="font-medium">{stats.totalComments}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Réponses</span>
              <span className="font-medium">{stats.totalReplies}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Profondeur moyenne</span>
              <span className="font-medium">{stats.averageDepth.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Profondeur maximale</span>
              <span className={`font-medium ${getDepthColor(stats.maxDepth)}`}>
                {stats.maxDepth}
              </span>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Niveau d'engagement</span>
                <Badge className={engagementLevel.bg + ' ' + engagementLevel.color}>
                  {engagementLevel.level}
                </Badge>
              </div>
              <Progress 
                value={Math.min((stats.totalComments + stats.totalReplies) / Math.max(stats.participants, 1) * 20, 100)} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Top Contributors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Top Contributeurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topContributors.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                Aucun contributeur pour le moment
              </p>
            ) : (
              <div className="space-y-3">
                {stats.topContributors.map((contributor, index) => (
                  <div key={contributor.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-600 text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={contributor.avatar} />
                        <AvatarFallback className="bg-gray-600">
                          {contributor.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <p className="font-medium text-sm">{contributor.name}</p>
                        <p className="text-xs text-gray-400">{contributor.count} messages</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant="secondary" className="bg-orange-600/20 text-orange-400">
                        {contributor.count}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      {stats.engagementMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Métriques d'Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Eye className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{stats.engagementMetrics.views}</p>
                <p className="text-sm text-gray-400">Vues</p>
              </div>
              
              <div className="text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold">{stats.engagementMetrics.likes}</p>
                <p className="text-sm text-gray-400">Likes</p>
              </div>
              
              <div className="text-center">
                <Share2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{stats.engagementMetrics.shares}</p>
                <p className="text-sm text-gray-400">Partages</p>
              </div>
              
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold">
                  {Math.round(stats.engagementMetrics.averageReadTime)}s
                </p>
                <p className="text-sm text-gray-400">Temps de lecture moyen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quality Metrics */}
      {stats.qualityMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Qualité des Contenus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-green-400">
                  {(stats.qualityMetrics.averageQuality * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-400">Qualité moyenne</p>
              </div>
              
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-blue-400">
                  {stats.qualityMetrics.highQualityCount}
                </p>
                <p className="text-sm text-gray-400">Messages de haute qualité</p>
              </div>
              
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-orange-400">
                  {stats.qualityMetrics.moderatedCount}
                </p>
                <p className="text-sm text-gray-400">Messages modérés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
