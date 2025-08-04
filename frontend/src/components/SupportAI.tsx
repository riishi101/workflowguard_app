import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Bot, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { ApiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface SupportIssue {
  id: string;
  type: 'rollback' | 'sync' | 'auth' | 'performance' | 'data';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  solution: string;
  automated: boolean;
}

const SupportAI = () => {
  const [issue, setIssue] = useState('');
  const [diagnosis, setDiagnosis] = useState<SupportIssue | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const commonIssues: SupportIssue[] = [
    {
      id: 'rollback-failure',
      type: 'rollback',
      severity: 'critical',
      description: 'Cannot rollback workflow to previous version',
      solution: 'Automated rollback validation and recovery',
      automated: true
    },
    {
      id: 'hubspot-sync-failure',
      type: 'sync',
      severity: 'high',
      description: 'Workflows not syncing from HubSpot',
      solution: 'AI-powered sync monitoring and retry',
      automated: true
    },
    {
      id: 'version-history-missing',
      type: 'data',
      severity: 'high',
      description: 'Version history not loading or missing',
      solution: 'Automated data integrity checks and recovery',
      automated: true
    },
    {
      id: 'auth-issues',
      type: 'auth',
      severity: 'critical',
      description: 'Authentication problems or locked account',
      solution: 'Automated auth validation and recovery',
      automated: true
    },
    {
      id: 'performance-slow',
      type: 'performance',
      severity: 'medium',
      description: 'App loading slowly or timeout errors',
      solution: 'Performance optimization and caching',
      automated: true
    }
  ];

  const diagnoseIssue = async () => {
    if (!issue.trim()) return;
    
    setLoading(true);
    
    try {
      // AI-powered issue diagnosis
      const diagnosis = await ApiService.diagnoseIssue(issue);
      setDiagnosis(diagnosis);
      
      // If automated solution available, apply it
      if (diagnosis.automated) {
        await applyAutomatedSolution(diagnosis);
      }
      
    } catch (error) {
      toast({
        title: "Diagnosis Failed",
        description: "Unable to diagnose issue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyAutomatedSolution = async (diagnosis: SupportIssue) => {
    try {
      setLoading(true);
      
      switch (diagnosis.type) {
        case 'rollback':
          await ApiService.fixRollbackIssue();
          break;
        case 'sync':
          await ApiService.fixSyncIssue();
          break;
        case 'auth':
          await ApiService.fixAuthIssue();
          break;
        case 'data':
          await ApiService.fixDataIssue();
          break;
        case 'performance':
          await ApiService.optimizePerformance();
          break;
      }
      
      toast({
        title: "Issue Resolved",
        description: "Automated solution applied successfully!",
      });
      
    } catch (error) {
      toast({
        title: "Auto-Fix Failed",
        description: "Please contact support for manual assistance.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Support Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Describe your issue:</label>
            <Input
              placeholder="e.g., 'I can't rollback my workflow' or 'HubSpot sync is not working'"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Button 
            onClick={diagnoseIssue}
            disabled={loading || !issue.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Diagnosing...
              </>
            ) : (
              <>
                <Bot className="h-4 w-4 mr-2" />
                Diagnose Issue
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {diagnosis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Issue Diagnosis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className={getSeverityColor(diagnosis.severity)}>
                {diagnosis.severity.toUpperCase()}
              </Badge>
              {diagnosis.automated && (
                <Badge className="bg-green-500">
                  AUTO-FIX AVAILABLE
                </Badge>
              )}
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Issue:</h4>
              <p className="text-gray-600">{diagnosis.description}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Solution:</h4>
              <p className="text-gray-600">{diagnosis.solution}</p>
            </div>
            
            {diagnosis.automated && (
              <Button 
                onClick={() => applyAutomatedSolution(diagnosis)}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Applying Fix...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Apply Automated Fix
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Common Issues & Solutions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {commonIssues.map((issue) => (
              <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getSeverityColor(issue.severity)}>
                      {issue.severity}
                    </Badge>
                    {issue.automated && (
                      <Badge className="bg-green-500 text-white">
                        Auto-Fix
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium">{issue.description}</p>
                  <p className="text-xs text-gray-500">{issue.solution}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIssue(issue.description);
                    diagnoseIssue();
                  }}
                >
                  Try Fix
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportAI; 