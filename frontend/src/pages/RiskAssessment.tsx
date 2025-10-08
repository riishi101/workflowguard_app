import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import MainAppLayout from "@/components/MainAppLayout";
import ContentSection from "@/components/ContentSection";
import ApiService from "@/lib/api";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  RotateCcw,
  BarChart3,
  Users,
  RefreshCw,
  Activity
} from "lucide-react";

interface RiskAssessment {
  id: string;
  workflowId: string;
  workflowName: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  complexityScore: number;
  impactScore: number;
  safetyScore: number;
  requiresApproval: boolean;
  assessedAt: string;
  riskFactors: Array<{
    type: string;
    severity: string;
    description: string;
    impact: string;
  }>;
  mitigationSuggestions: Array<{
    type: string;
    priority: string;
    description: string;
    implementation: string;
  }>;
  safetyChecks: Array<{
    name: string;
    status: 'PASSED' | 'WARNING' | 'FAILED';
    severity: string;
    message: string;
  }>;
}

interface RiskStatistics {
  totalWorkflows: number;
  criticalRisk: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  pendingApprovals: number;
  recentAssessments: RiskAssessment[];
}

const RiskAssessment: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [riskStats, setRiskStats] = useState<RiskStatistics | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<RiskAssessment | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadRiskDashboard();
    loadPendingApprovals();
  }, []);

  const loadRiskDashboard = async () => {
    try {
      setLoading(true);
      console.log('🔍 FRONTEND DEBUG: Starting loadRiskDashboard...');
      console.log('🔍 FRONTEND DEBUG: Current user:', user);
      console.log('🛡️ RISK DASHBOARD: Loading dashboard data...');
      
      console.log('🔍 FRONTEND DEBUG: Calling ApiService.getRiskDashboard()...');
      const response = await ApiService.getRiskDashboard();
      console.log('🔍 FRONTEND DEBUG: API Response received:', response);
      
      if (response.success) {
        console.log('🔍 FRONTEND DEBUG: Response data:', response.data);
        setRiskStats(response.data);
        console.log('✅ RISK DASHBOARD: Data loaded successfully');
        console.log('🔍 FRONTEND DEBUG: RiskStats state updated:', response.data);
      } else {
        console.error('🔍 FRONTEND DEBUG: Response not successful:', response);
        console.error('❌ RISK DASHBOARD: Failed to load data:', response.message);
        toast({
          title: "Error",
          description: "Failed to load risk assessment data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('🔍 FRONTEND DEBUG: Catch block error:', error);
      console.error('🔍 FRONTEND DEBUG: Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      console.error('❌ RISK DASHBOARD: Error loading dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to connect to risk assessment service",
        variant: "destructive",
      });
    } finally {
      console.log('🔍 FRONTEND DEBUG: Setting loading to false');
      setLoading(false);
    }
  };

  const loadPendingApprovals = async () => {
    try {
      const response = await ApiService.getPendingApprovals();
      
      if (response.success) {
        setPendingApprovals(response.data);
      }
    } catch (error) {
      console.error('❌ PENDING APPROVALS: Error loading:', error);
    }
  };

  const assessWorkflow = async (workflowId: string) => {
    try {
      console.log(`🛡️ RISK ASSESSMENT: Assessing workflow ${workflowId}...`);
      
      const response = await ApiService.assessWorkflow(workflowId, true);
      
      if (response.success) {
        setSelectedWorkflow(response.data);
        setActiveTab('assessments');
        console.log('✅ RISK ASSESSMENT: Assessment completed');
        loadRiskDashboard();
      }
    } catch (error) {
      console.error('❌ RISK ASSESSMENT: Assessment failed:', error);
      toast({
        title: "Assessment Failed",
        description: "Unable to assess workflow risk",
        variant: "destructive",
      });
    }
  };

  const approveRisk = async (assessmentId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      console.log(`🛡️ RISK APPROVAL: ${status} assessment ${assessmentId}`);
      
      const response = await ApiService.approveRiskAssessment(
        assessmentId, 
        status, 
        `${status} via Risk Assessment Dashboard`
      );
      
      if (response.success) {
        console.log('✅ RISK APPROVAL: Status updated successfully');
        toast({
          title: "Success",
          description: `Risk assessment ${status.toLowerCase()} successfully`,
        });
        loadPendingApprovals();
        loadRiskDashboard();
      }
    } catch (error) {
      console.error('❌ RISK APPROVAL: Failed to update status:', error);
      toast({
        title: "Error",
        description: "Failed to update approval status",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadRiskDashboard(), loadPendingApprovals()]);
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Risk assessment data has been updated",
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'CRITICAL': return <XCircle className="h-4 w-4" />;
      case 'HIGH': return <AlertTriangle className="h-4 w-4" />;
      case 'MEDIUM': return <Clock className="h-4 w-4" />;
      case 'LOW': return <CheckCircle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <MainAppLayout
        title="Risk Assessment Dashboard"
        description="Proactively assess and mitigate workflow risks before deployment"
      >
        <ContentSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading Risk Assessment Dashboard...</span>
          </div>
        </ContentSection>
      </MainAppLayout>
    );
  }

  return (
    <MainAppLayout
      title="Risk Assessment Dashboard"
      description="Proactively assess and mitigate workflow risks before deployment"
      headerActions={
        <Button 
          onClick={handleRefresh} 
          variant="outline"
          disabled={refreshing}
        >
          {refreshing ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      }
    >
      {/* Overview Cards */}
      {riskStats && (
        <ContentSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Workflows</p>
                    <p className="text-2xl font-bold text-gray-900">{riskStats.totalWorkflows}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Critical Risk</p>
                    <p className="text-2xl font-bold text-red-600">{riskStats.criticalRisk}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">High Risk</p>
                    <p className="text-2xl font-bold text-orange-600">{riskStats.highRisk}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                    <p className="text-2xl font-bold text-yellow-600">{riskStats.pendingApprovals}</p>
                  </div>
                  <Users className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </ContentSection>
      )}

      {/* Main Content Tabs */}
      <ContentSection>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assessments">Risk Assessments</TabsTrigger>
            <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {riskStats && (
              <>
                {/* Risk Distribution Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Distribution</CardTitle>
                    <p className="text-sm text-gray-600">
                      Current risk levels across all protected workflows
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600">Low Risk</span>
                        <span className="text-sm text-gray-600">{riskStats.lowRisk} workflows</span>
                      </div>
                      <Progress 
                        value={riskStats.totalWorkflows > 0 ? (riskStats.lowRisk / riskStats.totalWorkflows) * 100 : 0} 
                        className="h-2"
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-yellow-600">Medium Risk</span>
                        <span className="text-sm text-gray-600">{riskStats.mediumRisk} workflows</span>
                      </div>
                      <Progress 
                        value={riskStats.totalWorkflows > 0 ? (riskStats.mediumRisk / riskStats.totalWorkflows) * 100 : 0} 
                        className="h-2"
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-orange-600">High Risk</span>
                        <span className="text-sm text-gray-600">{riskStats.highRisk} workflows</span>
                      </div>
                      <Progress 
                        value={riskStats.totalWorkflows > 0 ? (riskStats.highRisk / riskStats.totalWorkflows) * 100 : 0} 
                        className="h-2"
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-600">Critical Risk</span>
                        <span className="text-sm text-gray-600">{riskStats.criticalRisk} workflows</span>
                      </div>
                      <Progress 
                        value={riskStats.totalWorkflows > 0 ? (riskStats.criticalRisk / riskStats.totalWorkflows) * 100 : 0} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Assessments */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Risk Assessments</CardTitle>
                    <p className="text-sm text-gray-600">
                      Latest risk assessments sorted by risk score
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {riskStats.recentAssessments.length > 0 ? (
                        riskStats.recentAssessments.map((assessment, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center space-x-3">
                              {getRiskIcon(assessment.riskLevel)}
                              <div>
                                <p className="font-medium text-gray-900">{assessment.workflowName}</p>
                                <p className="text-sm text-gray-600">
                                  Risk Score: {assessment.riskScore}/100
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getRiskColor(assessment.riskLevel)}>
                                {assessment.riskLevel}
                              </Badge>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => assessWorkflow(assessment.workflowId)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No risk assessments available</p>
                          <p className="text-sm">Workflows will be assessed automatically</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Risk Assessments Tab */}
          <TabsContent value="assessments" className="space-y-4">
            {selectedWorkflow ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Risk Assessment: {selectedWorkflow.workflowName}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Comprehensive risk analysis and mitigation recommendations
                      </p>
                    </div>
                    <Badge className={getRiskColor(selectedWorkflow.riskLevel)}>
                      {selectedWorkflow.riskLevel} RISK
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Risk Scores */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{selectedWorkflow.riskScore}</p>
                      <p className="text-sm text-gray-600">Overall Risk</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{selectedWorkflow.complexityScore}</p>
                      <p className="text-sm text-gray-600">Complexity</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">{selectedWorkflow.impactScore}</p>
                      <p className="text-sm text-gray-600">Impact</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{selectedWorkflow.safetyScore}</p>
                      <p className="text-sm text-gray-600">Safety</p>
                    </div>
                  </div>

                  {/* Risk Factors */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Identified Risk Factors</h3>
                    <div className="space-y-2">
                      {selectedWorkflow.riskFactors.map((factor, index) => (
                        <Alert key={index}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>{factor.type}:</strong> {factor.description}
                            <br />
                            <span className="text-sm text-gray-600">Impact: {factor.impact}</span>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>

                  {/* Safety Checks */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Safety Checks</h3>
                    <div className="space-y-2">
                      {selectedWorkflow.safetyChecks.map((check, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-2">
                            {check.status === 'PASSED' && <CheckCircle className="h-4 w-4 text-green-600" />}
                            {check.status === 'WARNING' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                            {check.status === 'FAILED' && <XCircle className="h-4 w-4 text-red-600" />}
                            <span className="font-medium">{check.name}</span>
                          </div>
                          <Badge 
                            variant={check.status === 'PASSED' ? 'default' : 'destructive'}
                          >
                            {check.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mitigation Suggestions */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Mitigation Suggestions</h3>
                    <div className="space-y-3">
                      {selectedWorkflow.mitigationSuggestions.map((suggestion, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{suggestion.description}</h4>
                            <Badge variant="outline">{suggestion.priority} Priority</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{suggestion.implementation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessment Selected</h3>
                  <p className="text-gray-600 mb-4">
                    Select a workflow from the overview to view detailed risk assessment
                  </p>
                  <Button onClick={() => setActiveTab('overview')}>
                    View Workflows
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Pending Approvals Tab */}
          <TabsContent value="approvals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Workflows Requiring Approval</CardTitle>
                <p className="text-sm text-gray-600">
                  High and critical risk workflows pending approval for deployment
                </p>
              </CardHeader>
              <CardContent>
                {pendingApprovals.length > 0 ? (
                  <div className="space-y-4">
                    {pendingApprovals.map((approval, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {getRiskIcon(approval.riskLevel)}
                            <div>
                              <h4 className="font-medium text-gray-900">{approval.workflowName}</h4>
                              <p className="text-sm text-gray-600">
                                Risk Score: {approval.riskScore}/100
                              </p>
                            </div>
                          </div>
                          <Badge className={getRiskColor(approval.riskLevel)}>
                            {approval.riskLevel} RISK
                          </Badge>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Risk Factors:</p>
                          <div className="flex flex-wrap gap-2">
                            {approval.riskFactors?.map((factor: any, factorIndex: number) => (
                              <Badge key={factorIndex} variant="outline">
                                {factor.type}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => approveRisk(approval.assessmentId, 'APPROVED')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => approveRisk(approval.assessmentId, 'REJECTED')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => assessWorkflow(approval.workflowId)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h3>
                    <p className="text-gray-600">
                      All workflows are within acceptable risk levels
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Trends</CardTitle>
                  <p className="text-sm text-gray-600">Risk assessment trends over time</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Risk Score</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold">42</span>
                        <TrendingDown className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">-15%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Assessments This Week</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold">7</span>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Risk Factors</CardTitle>
                  <p className="text-sm text-gray-600">Most common risk factors identified</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Complex Branching</span>
                      <Badge variant="outline">3 workflows</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Data Modification</span>
                      <Badge variant="outline">2 workflows</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">External Integrations</span>
                      <Badge variant="outline">1 workflow</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </ContentSection>
    </MainAppLayout>
  );
};

export default RiskAssessment;
