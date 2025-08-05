import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ApiService } from '@/lib/api';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  BarChart3,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw,
  Zap,
  Target,
  PieChart,
  LineChart,
} from 'lucide-react';

interface EnterpriseMetrics {
  workflowMetrics: {
    totalWorkflows: number;
    totalVersions: number;
    activeWorkflows: number;
    averageVersionsPerWorkflow: number;
    workflowUtilization: number;
  };
  activityMetrics: {
    totalActivities: number;
    uniqueActions: number;
    mostFrequentAction: string;
    averageDailyActivities: number;
  };
  performanceMetrics: {
    rollbackCount: number;
    backupCount: number;
    changeCount: number;
    performanceScore: number;
    efficiencyRatio: number;
  };
  complianceMetrics: {
    hasCompleteAuditTrail: boolean;
    hasVersionHistory: boolean;
    hasUserAttribution: boolean;
    hasTimestampTracking: boolean;
    complianceScore: number;
    complianceLevel: string;
  };
  trends: {
    workflowsPerDay: number;
    activitiesPerDay: number;
    growthRate: number;
    trend: string;
  };
}

const EnterpriseDashboard: React.FC = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<EnterpriseMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchEnterpriseMetrics();
  }, []);

  const fetchEnterpriseMetrics = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getEnterpriseReport();
      if (response.success) {
        setMetrics(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Failed to load metrics",
        description: error.message || "Unable to fetch enterprise metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No metrics available</h3>
        <p className="text-gray-500 mb-4">Enterprise metrics are not available for your current plan.</p>
        <Button onClick={fetchEnterpriseMetrics}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enterprise Dashboard</h1>
          <p className="text-gray-600">Advanced analytics and performance metrics</p>
        </div>
        <Button onClick={fetchEnterpriseMetrics} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getPerformanceColor(metrics.performanceMetrics.performanceScore)}>
                {metrics.performanceMetrics.performanceScore}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              +{metrics.trends.growthRate > 0 ? metrics.trends.growthRate : 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getComplianceColor(metrics.complianceMetrics.complianceScore)}>
                {metrics.complianceMetrics.complianceScore}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.complianceMetrics.complianceLevel} compliance level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.workflowMetrics.activeWorkflows}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(metrics.workflowMetrics.workflowUtilization)}% utilization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Activities</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(metrics.activityMetrics.averageDailyActivities)}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.trends.trend} trend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Workflow Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Workflows</span>
                  <Badge variant="secondary">{metrics.workflowMetrics.totalWorkflows}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Versions</span>
                  <Badge variant="secondary">{metrics.workflowMetrics.totalVersions}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Avg Versions/Workflow</span>
                  <Badge variant="secondary">
                    {metrics.workflowMetrics.averageVersionsPerWorkflow}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Utilization</span>
                    <span>{Math.round(metrics.workflowMetrics.workflowUtilization)}%</span>
                  </div>
                  <Progress value={metrics.workflowMetrics.workflowUtilization} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Activity Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Activities</span>
                  <Badge variant="secondary">{metrics.activityMetrics.totalActivities}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Unique Actions</span>
                  <Badge variant="secondary">{metrics.activityMetrics.uniqueActions}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Most Frequent</span>
                  <Badge variant="outline">{metrics.activityMetrics.mostFrequentAction}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Daily Average</span>
                  <Badge variant="secondary">
                    {Math.round(metrics.activityMetrics.averageDailyActivities)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Backup Count</span>
                  <Badge variant="secondary">{metrics.performanceMetrics.backupCount}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Change Count</span>
                  <Badge variant="secondary">{metrics.performanceMetrics.changeCount}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Rollback Count</span>
                  <Badge variant="destructive">{metrics.performanceMetrics.rollbackCount}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Efficiency Ratio</span>
                    <span>{Math.round(metrics.performanceMetrics.efficiencyRatio * 100)}%</span>
                  </div>
                  <Progress value={Math.min(metrics.performanceMetrics.efficiencyRatio * 100, 100)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performance Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold">
                    <span className={getPerformanceColor(metrics.performanceMetrics.performanceScore)}>
                      {metrics.performanceMetrics.performanceScore}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Overall performance score based on backups, changes, and rollbacks
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Good backup frequency</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Efficient change management</span>
                    </div>
                    {metrics.performanceMetrics.rollbackCount > 0 && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Consider reducing rollbacks</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Complete Audit Trail</span>
                    <Badge variant={metrics.complianceMetrics.hasCompleteAuditTrail ? "default" : "destructive"}>
                      {metrics.complianceMetrics.hasCompleteAuditTrail ? "✓" : "✗"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Version History</span>
                    <Badge variant={metrics.complianceMetrics.hasVersionHistory ? "default" : "destructive"}>
                      {metrics.complianceMetrics.hasVersionHistory ? "✓" : "✗"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>User Attribution</span>
                    <Badge variant={metrics.complianceMetrics.hasUserAttribution ? "default" : "destructive"}>
                      {metrics.complianceMetrics.hasUserAttribution ? "✓" : "✗"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Timestamp Tracking</span>
                    <Badge variant={metrics.complianceMetrics.hasTimestampTracking ? "default" : "destructive"}>
                      {metrics.complianceMetrics.hasTimestampTracking ? "✓" : "✗"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Compliance Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold">
                    <span className={getComplianceColor(metrics.complianceMetrics.complianceScore)}>
                      {metrics.complianceMetrics.complianceScore}%
                    </span>
                  </div>
                  <Badge variant="outline" className="text-lg">
                    {metrics.complianceMetrics.complianceLevel} Level
                  </Badge>
                  <p className="text-sm text-gray-600">
                    Compliance score based on audit trail completeness and data integrity
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Growth Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Workflows per Day</span>
                  <Badge variant="secondary">
                    {metrics.trends.workflowsPerDay}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Activities per Day</span>
                  <Badge variant="secondary">
                    {metrics.trends.activitiesPerDay}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Growth Rate</span>
                  <Badge variant={metrics.trends.growthRate > 0 ? "default" : "destructive"}>
                    {metrics.trends.growthRate > 0 ? "+" : ""}{metrics.trends.growthRate}%
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span>Trend:</span>
                  <Badge variant="outline" className="capitalize">
                    {metrics.trends.trend}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Analytics Report
                </Button>
                <Button className="w-full" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Export Performance Data
                </Button>
                <Button className="w-full" variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Export Compliance Report
                </Button>
                <Button className="w-full" variant="outline">
                  <LineChart className="h-4 w-4 mr-2" />
                  Export Trend Analysis
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnterpriseDashboard; 