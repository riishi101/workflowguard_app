import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bot,
  BookOpen,
  MessageCircle,
  Video,
  Mail,
  Phone,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Star,
  GraduationCap,
  Brain,
  Wrench,
  Shield,
  Settings,
  UserCheck,
  Headphones
} from 'lucide-react';
import MainAppLayout from '@/components/MainAppLayout';
import ContentSection from '@/components/ContentSection';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { ApiService } from '@/lib/api';

const HelpSupport = () => {
  const { toast } = useToast();
  const [issueDescription, setIssueDescription] = useState('');
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const handleDiagnoseIssue = async () => {
    if (!issueDescription.trim()) {
      toast({
        title: "Please describe your issue",
        description: "Enter a description of the problem you're experiencing.",
        variant: "destructive",
      });
      return;
    }

    setIsDiagnosing(true);
    try {
      const response = await ApiService.diagnoseIssue(issueDescription);
      toast({
        title: "Issue Diagnosed",
        description: response.message || "AI has analyzed your issue and provided a solution.",
      });
    } catch (error: any) {
      toast({
        title: "Diagnosis Failed",
        description: error.message || "Failed to diagnose the issue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleAutoFix = async (issueType: string) => {
    try {
      let response;
      switch (issueType) {
        case 'rollback':
          response = await ApiService.fixRollbackIssue();
          break;
        case 'sync':
          response = await ApiService.fixSyncIssue();
          break;
        case 'auth':
          response = await ApiService.fixAuthIssue();
          break;
        case 'data':
          response = await ApiService.fixDataIssue();
          break;
        case 'performance':
          response = await ApiService.optimizePerformance();
          break;
        default:
          response = await ApiService.diagnoseIssue(`Fix ${issueType} issue`);
      }
      
      toast({
        title: "Auto-Fix Applied",
        description: response.message || "The issue has been automatically resolved.",
      });
    } catch (error: any) {
      toast({
        title: "Auto-Fix Failed",
        description: error.message || "Failed to automatically fix the issue.",
        variant: "destructive",
      });
    }
  };

  const commonIssues = [
    {
      id: 'rollback',
      title: 'Cannot rollback workflow to previous version',
      description: 'Automated rollback validation and recovery',
      severity: 'Critical',
      severityColor: 'bg-red-500',
      canAutoFix: true
    },
    {
      id: 'sync',
      title: 'Workflows not syncing from HubSpot',
      description: 'API-based sync monitoring and retry',
      severity: 'High',
      severityColor: 'bg-orange-500',
      canAutoFix: true
    },
    {
      id: 'data',
      title: 'Version history not loading or missing',
      description: 'Automated data integrity checks and recovery',
      severity: 'High',
      severityColor: 'bg-orange-500',
      canAutoFix: true
    },
    {
      id: 'auth',
      title: 'Authentication problems or locked account',
      description: 'Automated auth validation and recovery',
      severity: 'Critical',
      severityColor: 'bg-red-500',
      canAutoFix: true
    },
    {
      id: 'performance',
      title: 'App loading slowly or timeout errors',
      description: 'Performance optimization and caching',
      severity: 'Medium',
      severityColor: 'bg-yellow-500',
      canAutoFix: true
    }
  ];

  const supportTiers = [
    {
      title: 'Starter Support',
      badge: 'Free',
      badgeColor: 'bg-gray-100 text-gray-700',
      features: [
        { icon: Mail, text: 'Email Support' },
        { icon: Clock, text: '24-48 hour response' },
        { icon: BookOpen, text: 'Knowledge Base' },
        { icon: Bot, text: 'AI Support Assistant' }
      ]
    },
    {
      title: 'Professional Support',
      badge: 'Priority',
      badgeColor: 'bg-blue-500 text-white',
      features: [
        { icon: MessageCircle, text: 'Live Chat (Business Hours)' },
        { icon: Phone, text: 'Phone Support' },
        { icon: Clock, text: '4-8 hour response' },
        { icon: AlertTriangle, text: 'Emergency After-Hours' }
      ]
    },
    {
      title: 'Enterprise Support',
      badge: '24/7',
      badgeColor: 'bg-purple-500 text-white',
      features: [
        { icon: Phone, text: '24/7 Phone Support' },
        { icon: Star, text: 'Dedicated Support Manager' },
        { icon: Zap, text: '1-2 hour critical response' },
        { icon: GraduationCap, text: 'Custom Training Sessions' }
      ]
    }
  ];

  return (
    <MainAppLayout 
      title="Help & Support"
      description="Get help with WorkflowGuard and find answers to common questions."
    >
      <ContentSection>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* AI Support Assistant */}
          <Card className="bg-gray-50 border-2 border-gray-200 rounded-2xl shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500 p-3 rounded-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">AI Support Assistant</h3>
                  <p className="text-gray-600 mb-6">
                    Our AI assistant can automatically diagnose and fix most common issues. 
                    Describe your problem and get instant help!
                  </p>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Cannot rollback workflow to previous version"
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      className="min-h-[100px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <div className="flex justify-center">
                      <Button 
                        onClick={handleDiagnoseIssue}
                        disabled={isDiagnosing}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium"
                      >
                        {isDiagnosing ? 'Diagnosing...' : 'Diagnose Issue'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Common Issues & Solutions */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Common Issues & Solutions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {commonIssues.map((issue) => (
                <Card key={issue.id} className="border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-2">
                        <Badge className={`${issue.severityColor} text-white text-xs`}>
                          {issue.severity}
                        </Badge>
                        {issue.canAutoFix && (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            Auto-Fix
                          </Badge>
                        )}
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{issue.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">{issue.description}</p>
                    <div className="flex justify-end">
                      <Button 
                        variant="ghost" 
                        onClick={() => handleAutoFix(issue.id)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        Try Fix
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Knowledge Base, Community Forum, Video Tutorials */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Knowledge Base */}
              <Card className="border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-blue-500 p-3 rounded-lg w-fit mb-4">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Knowledge Base</h3>
                  <p className="text-gray-600 mb-4">
                    Comprehensive guides, tutorials, and troubleshooting articles.
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Setup guides
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Video tutorials
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Best practices
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-gray-300 text-blue-600 hover:bg-blue-50">
                    Browse Knowledge Base
                  </Button>
                </CardContent>
              </Card>

              {/* Community Forum */}
              <Card className="border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-blue-500 p-3 rounded-lg w-fit mb-4">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Community Forum</h3>
                  <p className="text-gray-600 mb-4">
                    Connect with other users and share tips and solutions.
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      User discussions
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Tips & tricks
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Feature requests
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-gray-300 text-blue-600 hover:bg-blue-50">
                    Join Community
                  </Button>
                </CardContent>
              </Card>

              {/* Video Tutorials */}
              <Card className="border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-blue-500 p-3 rounded-lg w-fit mb-4">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Video Tutorials</h3>
                  <p className="text-gray-600 mb-4">
                    Step-by-step video guides for all features.
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Getting started
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Advanced features
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Troubleshooting
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-gray-300 text-blue-600 hover:bg-blue-50">
                    Watch Tutorials
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Support Tiers */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Support Tiers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {supportTiers.map((tier, index) => (
                <Card key={index} className="border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow relative">
                  {tier.badge && (
                    <div className={`absolute -top-3 right-4 ${tier.badgeColor} px-3 py-1 rounded-full text-xs font-medium`}>
                      {tier.badge}
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{tier.title}</h3>
                    <div className="space-y-3">
                      {tier.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-3">
                          <feature.icon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email Support */}
              <Card className="border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-blue-500 p-3 rounded-lg w-fit mb-4">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Email Support</h3>
                  <p className="text-blue-600 font-medium mb-2">support@workflowguard.pro</p>
                  <p className="text-sm text-gray-600">Available 24/7 for all users</p>
                </CardContent>
              </Card>

              {/* Phone Support */}
              <Card className="border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-blue-500 p-3 rounded-lg w-fit mb-4">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Phone Support</h3>
                  <p className="text-blue-600 font-medium mb-2">+1 (555) 123-4567</p>
                  <p className="text-sm text-gray-600">Professional & Enterprise plans only</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ContentSection>
    </MainAppLayout>
  );
};

export default HelpSupport;
