import { useState, useEffect } from 'react';
import { ApiService } from '@/lib/api';

export function useWorkflowStats(workflows: any[]) {
  const [stats, setStats] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    protectedWorkflows: 0,
    totalVersions: 0,
    uptime: 99.9,
    lastSnapshot: '',
    planCapacity: 100,
    planUsed: 0
  });

  useEffect(() => {
    const calculateStats = async () => {
      try {
        // Get subscription info for plan limits
        const subscriptionResponse = await ApiService.getSubscription();
        const subscription = subscriptionResponse.data || {};

        setStats({
          totalWorkflows: workflows.length,
          activeWorkflows: workflows.filter(w => w.status === 'active').length,
          protectedWorkflows: workflows.filter(w => w.protectionStatus === 'protected').length,
          totalVersions: workflows.reduce((total, w) => total + (w.versions || 0), 0),
          uptime: 99.9, // Default value
          lastSnapshot: workflows.length > 0 ? new Date().toISOString() : '',
          planCapacity: subscription.planCapacity || 100,
          planUsed: workflows.length
        });
      } catch (error) {
        console.error('Failed to calculate stats:', error);
      }
    };

    calculateStats();
  }, [workflows]);

  return stats;
}
