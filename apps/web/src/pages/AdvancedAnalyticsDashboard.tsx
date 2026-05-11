import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/Progress";
import { 
  Users, Eye, Clock, TrendingUp, MousePointer, Activity, Zap, 
  Monitor, Smartphone, Tablet, Calendar, RefreshCw, CheckCircle, BarChart3
} from "lucide-react";
import { advancedAnalyticsService } from "../services/advancedAnalyticsService";
import { useRealTimeAnalytics } from "../hooks/useRealTimeAnalytics";

// Types simplifiés
interface RealTimeMetrics {
  timestamp: Date;
  activeUsers: number;
  currentPageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: Array<{ url: string; views: number; avgTimeOnPage: number }>;
  eventsPerSecond: number;
  errorRate: number;
  conversionRate: number;
}

interface HeatmapData {
  pageUrl: string;
  dateRange: { start: Date; end: Date };
  totalClicks: number;
  clickDensity: Array<{ x: number; y: number; intensity: number }>;
  scrollMap: Array<{ y: number; percentage: number; dropOffRate: number }>;
}

interface ContentPerformanceAdvanced {
  contentId: string;
  title: string;
  basicMetrics: {
    views: number;
    uniqueViews: number;
    averageWatchTime: number;
    completionRate: number;
  };
  engagementMetrics: {
    likeRate: number;
    commentRate: number;
    shareRate: number;
    saveRate: number;
    downloadRate: number;
  };
  qualityMetrics: {
    videoQualityScore: number;
    audioQualityScore: number;
    loadingTime: number;
    bufferingEvents: number;
    errorRate: number;
  };
  audienceMetrics: {
    demographics: Record<string, number>;
    deviceBreakdown: Record<string, number>;
  };
  temporalMetrics: {
    viewsByHour: Array<{ hour: number; views: number }>;
    viewsByDay: Array<{ day: string; views: number }>;
  };
}

interface CohortAnalysis {
  cohortDate: Date;
  cohortSize: number;
  retentionByDay: Array<{
    day: number;
    retainedUsers: number;
    retentionRate: number;
  }>;
}

export function AdvancedAnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [selectedPage, setSelectedPage] = useState<string>('/feed');
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [contentPerformance, setContentPerformance] = useState<ContentPerformanceAdvanced | null>(null);
  const [cohortAnalysis, setCohortAnalysis] = useState<CohortAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Real-time analytics hook
  const { metrics: liveMetrics, isConnected } = useRealTimeAnalytics();

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  useEffect(() => {
    if (liveMetrics) {
      setRealTimeMetrics(liveMetrics);
    }
  }, [liveMetrics]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load real-time metrics
      const metrics = await advancedAnalyticsService.getRealTimeMetrics();
      setRealTimeMetrics(metrics);

      // Load heatmap data for selected page
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const heatmap = await advancedAnalyticsService.generateHeatmap(selectedPage, startDate, endDate);
      setHeatmapData(heatmap);

      // Load cohort analysis
      const cohortDate = new Date();
      cohortDate.setDate(cohortDate.getDate() - 30);
      const cohort = await advancedAnalyticsService.generateCohortAnalysis(cohortDate);
      setCohortAnalysis(cohort);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Format time
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  // Real-time metrics cards
  const RealTimeMetricsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Active Users</p>
              <p className="text-2xl font-bold text-blue-900">{formatNumber(realTimeMetrics?.activeUsers || 0)}</p>
              <div className="flex items-center mt-1">
                <Activity className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600">Live</span>
              </div>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Page Views</p>
              <p className="text-2xl font-bold text-green-900">{formatNumber(realTimeMetrics?.currentPageViews || 0)}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600">+12%</span>
              </div>
            </div>
            <Eye className="w-8 h-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Avg Session</p>
              <p className="text-2xl font-bold text-purple-900">{formatTime(realTimeMetrics?.averageSessionDuration || 0)}</p>
              <div className="flex items-center mt-1">
                <Clock className="w-3 h-3 text-purple-500 mr-1" />
                <span className="text-xs text-purple-600">Last 5 min</span>
              </div>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Conversion</p>
              <p className="text-2xl font-bold text-orange-900">{(realTimeMetrics?.conversionRate || 0).toFixed(1)}%</p>
              <div className="flex items-center mt-1">
                <Zap className="w-3 h-3 text-orange-500 mr-1" />
                <span className="text-xs text-orange-600">+2.3%</span>
              </div>
            </div>
            <Zap className="w-8 h-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Simple heatmap visualization
  const HeatmapVisualization = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MousePointer className="w-5 h-5 mr-2 text-orange-500" />
          Click Heatmap - {selectedPage}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Clicks: {heatmapData?.totalClicks || 0}</span>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-200 rounded"></div>
              <span className="text-xs">Low</span>
              <div className="w-4 h-4 bg-orange-400 rounded"></div>
              <span className="text-xs">Medium</span>
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span className="text-xs">High</span>
            </div>
          </div>
        </div>
        
        <div className="relative bg-gray-100 rounded-lg h-96 overflow-hidden">
          {/* Simple heatmap visualization */}
          <div className="absolute inset-0">
            {heatmapData?.clickDensity.slice(0, 30).map((point, index) => (
              <div
                key={index}
                className="absolute rounded-full opacity-60"
                style={{
                  left: `${(point.x / 1920) * 100}%`,
                  top: `${(point.y / 1080) * 100}%`,
                  width: `${Math.min(point.intensity * 2, 40)}px`,
                  height: `${Math.min(point.intensity * 2, 40)}px`,
                  backgroundColor: point.intensity > 10 ? '#DC2626' : point.intensity > 5 ? '#F97316' : '#3B82F6',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
          </div>
          
          {/* Scroll depth indicator */}
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-gray-300">
            {heatmapData?.scrollMap.map((point, index) => (
              <div
                key={index}
                className="absolute w-full bg-orange-500"
                style={{
                  top: `${point.y}%`,
                  height: '2px',
                  opacity: point.percentage / 100
                }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Simple cohort analysis visualization
  const CohortAnalysisVisualization = () => {
    if (!cohortAnalysis) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-500" />
            Cohort Analysis - {cohortAnalysis.cohortDate.toLocaleDateString()}
          </CardTitle>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">Cohort Size: {cohortAnalysis.cohortSize}</Badge>
            <Badge variant="secondary">30-Day Retention: {cohortAnalysis.retentionByDay[29]?.retentionRate.toFixed(1)}%</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Simple cohort retention visualization */}
          <div className="space-y-2">
            {cohortAnalysis.retentionByDay.slice(0, 10).map((day, index) => (
              <div key={day.day} className="flex items-center space-x-4">
                <span className="text-sm w-12">Day {day.day}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                  <div
                    className="bg-orange-500 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${day.retentionRate}%` }}
                  />
                  <span className="absolute right-2 top-0 text-xs text-gray-700 leading-4">
                    {day.retentionRate.toFixed(1)}%
                  </span>
                </div>
                <span className="text-sm w-16 text-right">{day.retainedUsers}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
            <p className="text-gray-600">Real-time insights and user behavior analysis</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Badge variant={isConnected ? "secondary" : "outline"} className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? "bg-green-500" : "bg-gray-400"}`} />
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            
            <Button
              onClick={loadDashboardData}
              disabled={isLoading}
              variant="secondary"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center space-x-2 mb-6">
          <Calendar className="w-4 h-4 text-gray-500" />
          <div className="flex space-x-2">
            {(['24h', '7d', '30d', '90d'] as const).map(period => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "primary" : "secondary"}
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>

        {/* Real-time Metrics */}
        <RealTimeMetricsCards />

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="behavior">User Behavior</TabsTrigger>
            <TabsTrigger value="cohorts">Cohort Analysis</TabsTrigger>
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Pages */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {realTimeMetrics?.topPages.slice(0, 5).map((page, index) => (
                      <div key={page.url} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{page.url}</p>
                            <p className="text-sm text-gray-600">{formatTime(page.avgTimeOnPage)} avg</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatNumber(page.views)}</p>
                          <p className="text-sm text-gray-600">views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Events/sec</span>
                      <span className="font-semibold">{realTimeMetrics?.eventsPerSecond.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Error Rate</span>
                      <span className="font-semibold text-red-600">{realTimeMetrics?.errorRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Bounce Rate</span>
                      <span className="font-semibold text-orange-600">{realTimeMetrics?.bounceRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Conversion Rate</span>
                      <span className="font-semibold text-green-600">{realTimeMetrics?.conversionRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-6">
            <HeatmapVisualization />
          </TabsContent>

          <TabsContent value="cohorts" className="space-y-6">
            <CohortAnalysisVisualization />
          </TabsContent>

          <TabsContent value="realtime" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-500" />
                  Live Activity Stream
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-600">Active Now</span>
                        <Users className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-2xl font-bold text-green-900">{formatNumber(realTimeMetrics?.activeUsers || 0)}</p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-600">Page Views</span>
                        <Eye className="w-4 h-4 text-blue-500" />
                      </div>
                      <p className="text-2xl font-bold text-blue-900">{formatNumber(realTimeMetrics?.currentPageViews || 0)}</p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-purple-600">Events/sec</span>
                        <Zap className="w-4 h-4 text-purple-500" />
                      </div>
                      <p className="text-2xl font-bold text-purple-900">{realTimeMetrics?.eventsPerSecond.toFixed(1)}</p>
                    </div>
                  </div>
                  
                  {/* Live activity feed placeholder */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 text-center">Live activity stream coming soon...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
