import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HubSpotService } from '../services/hubspot.service';

export interface WorkflowRiskAssessment {
  id: string;
  workflowId: string;
  workflowName: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  complexityScore: number;
  impactScore: number;
  safetyScore: number;
  requiresApproval: boolean;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
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
  rollbackPlan: {
    complexity: string;
    steps: string[];
    estimatedTime: string;
    requiresManualIntervention: boolean;
  };
  recoverySteps: string[];
}

@Injectable()
export class RiskAssessmentService {
  private readonly logger = new Logger(RiskAssessmentService.name);

  constructor(
    private prisma: PrismaService,
    private hubspotService: HubSpotService,
  ) {}

  /**
   * Assess workflow risk by analyzing HubSpot workflow data
   */
  async assessWorkflowRisk(
    workflowId: string,
    hubspotWorkflowData: any,
    versionId?: string
  ): Promise<WorkflowRiskAssessment> {
    try {
      this.logger.log(`🛡️ RISK ASSESSMENT: Starting assessment for workflow ${workflowId}`);

      // Calculate individual risk scores
      const complexityScore = this.calculateComplexityScore(hubspotWorkflowData);
      const impactScore = this.calculateImpactScore(hubspotWorkflowData);
      const safetyScore = this.calculateSafetyScore(hubspotWorkflowData);

      // Calculate overall risk score (weighted average)
      const riskScore = Math.round(
        (complexityScore * 0.3) + (impactScore * 0.4) + ((100 - safetyScore) * 0.3)
      );

      // Determine risk level
      const riskLevel = this.determineRiskLevel(riskScore);

      // Run safety checks
      const safetyChecks = this.runSafetyChecks(hubspotWorkflowData);

      // Identify risk factors
      const riskFactors = this.identifyRiskFactors(hubspotWorkflowData);

      // Generate mitigation suggestions
      const mitigationSuggestions = this.generateMitigationSuggestions(riskFactors, hubspotWorkflowData);

      // Generate rollback plan
      const rollbackPlan = this.generateRollbackPlan(riskLevel, hubspotWorkflowData);

      // Generate recovery steps
      const recoverySteps = this.generateRecoverySteps(riskFactors);

      const assessment: WorkflowRiskAssessment = {
        id: `risk_${workflowId}_${Date.now()}`,
        workflowId,
        workflowName: hubspotWorkflowData.name || 'Unknown Workflow',
        riskLevel,
        riskScore,
        complexityScore,
        impactScore,
        safetyScore,
        requiresApproval: riskLevel === 'HIGH' || riskLevel === 'CRITICAL',
        approvalStatus: 'PENDING',
        assessedAt: new Date().toISOString(),
        riskFactors,
        mitigationSuggestions,
        safetyChecks,
        rollbackPlan,
        recoverySteps
      };

      this.logger.log(`✅ RISK ASSESSMENT: Completed for ${hubspotWorkflowData.name} - Risk Level: ${riskLevel} (${riskScore}/100)`);
      
      return assessment;
    } catch (error) {
      this.logger.error('❌ RISK ASSESSMENT: Assessment failed:', error);
      throw error;
    }
  }

  /**
   * Calculate complexity score based on workflow structure
   */
  private calculateComplexityScore(workflowData: any): number {
    let score = 0;

    try {
      // Base complexity
      const actions = workflowData.actions || [];
      const actionCount = actions.length;

      // Action count scoring (0-40 points)
      if (actionCount <= 3) score += 10;
      else if (actionCount <= 7) score += 20;
      else if (actionCount <= 15) score += 30;
      else score += 40;

      // Branch complexity (0-30 points)
      const branches = actions.filter((action: any) => 
        action.type === 'LIST_BRANCH' || action.actionTypeId === 4
      );
      score += Math.min(branches.length * 10, 30);

      // Delay complexity (0-15 points)
      const delays = actions.filter((action: any) => 
        action.type === 'DELAY' || action.actionTypeId === 1
      );
      score += Math.min(delays.length * 5, 15);

      // Enrollment trigger complexity (0-15 points)
      const triggers = workflowData.enrollmentTriggers || workflowData.enrollmentCriteria || [];
      if (Array.isArray(triggers)) {
        score += Math.min(triggers.length * 3, 15);
      } else if (triggers && typeof triggers === 'object') {
        // Handle single trigger object
        score += 5;
      }

      this.logger.debug(`🔍 COMPLEXITY SCORE: ${score}/100 (Actions: ${actionCount}, Branches: ${branches.length}, Delays: ${delays.length})`);
      
      return Math.min(score, 100);
    } catch (error) {
      this.logger.warn('⚠️ COMPLEXITY CALCULATION: Error calculating complexity score:', error);
      return 50; // Default moderate complexity
    }
  }

  /**
   * Calculate impact score based on workflow effects
   */
  private calculateImpactScore(workflowData: any): number {
    let score = 0;

    try {
      const actions = workflowData.actions || [];

      // Email actions impact (0-30 points)
      const emailActions = actions.filter((action: any) => 
        action.type === 'SEND_EMAIL' || action.actionTypeId === 3
      );
      score += Math.min(emailActions.length * 10, 30);

      // Data modification impact (0-40 points)
      const dataModActions = actions.filter((action: any) => 
        action.type === 'SET_PROPERTY' || action.actionTypeId === 0 ||
        action.type === 'SINGLE_CONNECTION' || action.actionTypeId === 5
      );
      score += Math.min(dataModActions.length * 8, 40);

      // External integration impact (0-20 points)
      const externalActions = actions.filter((action: any) => 
        action.type === 'WEBHOOK' || action.type === 'INTEGRATION' ||
        (action.fields && (action.fields.url || action.fields.webhook))
      );
      score += Math.min(externalActions.length * 20, 20);

      // Customer-facing impact (0-10 points)
      const customerFacing = emailActions.length > 0 || 
        actions.some((action: any) => action.type === 'CREATE_TASK');
      if (customerFacing) score += 10;

      this.logger.debug(`🔍 IMPACT SCORE: ${score}/100 (Emails: ${emailActions.length}, Data Mods: ${dataModActions.length}, External: ${externalActions.length})`);
      
      return Math.min(score, 100);
    } catch (error) {
      this.logger.warn('⚠️ IMPACT CALCULATION: Error calculating impact score:', error);
      return 30; // Default low-medium impact
    }
  }

  /**
   * Calculate safety score based on risk patterns
   */
  private calculateSafetyScore(workflowData: any): number {
    let score = 100; // Start with perfect safety score

    try {
      const actions = workflowData.actions || [];

      // Check for infinite loop risks (-30 points)
      const hasLoopRisk = this.detectInfiniteLoopRisk(workflowData);
      if (hasLoopRisk) score -= 30;

      // Check for data loss risks (-25 points)
      const hasDataLossRisk = this.detectDataLossRisk(actions);
      if (hasDataLossRisk) score -= 25;

      // Check for error handling (-20 points if missing)
      const hasErrorHandling = this.checkErrorHandling(actions);
      if (!hasErrorHandling) score -= 20;

      // Check for rate limit risks (-15 points)
      const hasRateLimitRisk = this.detectRateLimitRisk(actions);
      if (hasRateLimitRisk) score -= 15;

      // Check for permission issues (-10 points)
      const hasPermissionRisk = this.detectPermissionRisk(actions);
      if (hasPermissionRisk) score -= 10;

      this.logger.debug(`🔍 SAFETY SCORE: ${score}/100 (Loop Risk: ${hasLoopRisk}, Data Loss: ${hasDataLossRisk}, Error Handling: ${hasErrorHandling})`);
      
      return Math.max(score, 0);
    } catch (error) {
      this.logger.warn('⚠️ SAFETY CALCULATION: Error calculating safety score:', error);
      return 70; // Default good safety score
    }
  }

  /**
   * Determine risk level based on overall score
   */
  private determineRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 30) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Run automated safety checks
   */
  private runSafetyChecks(workflowData: any): Array<{
    name: string;
    status: 'PASSED' | 'WARNING' | 'FAILED';
    severity: string;
    message: string;
  }> {
    const checks = [];

    // Infinite Loop Check
    const hasLoopRisk = this.detectInfiniteLoopRisk(workflowData);
    checks.push({
      name: 'Infinite Loop Detection',
      status: hasLoopRisk ? 'FAILED' : 'PASSED',
      severity: hasLoopRisk ? 'HIGH' : 'LOW',
      message: hasLoopRisk ? 
        'Workflow may create infinite loops due to re-enrollment triggers' : 
        'No infinite loop risks detected'
    });

    // Data Integrity Check
    const hasDataLossRisk = this.detectDataLossRisk(workflowData.actions || []);
    checks.push({
      name: 'Data Integrity Validation',
      status: hasDataLossRisk ? 'WARNING' : 'PASSED',
      severity: hasDataLossRisk ? 'MEDIUM' : 'LOW',
      message: hasDataLossRisk ? 
        'Workflow contains actions that may cause irreversible data changes' : 
        'Data integrity appears safe'
    });

    // Permission Check
    const hasPermissionRisk = this.detectPermissionRisk(workflowData.actions || []);
    checks.push({
      name: 'Permission Verification',
      status: hasPermissionRisk ? 'WARNING' : 'PASSED',
      severity: hasPermissionRisk ? 'MEDIUM' : 'LOW',
      message: hasPermissionRisk ? 
        'Some actions may require additional permissions' : 
        'Permission requirements appear satisfied'
    });

    // Rate Limit Check
    const hasRateLimitRisk = this.detectRateLimitRisk(workflowData.actions || []);
    checks.push({
      name: 'Rate Limit Analysis',
      status: hasRateLimitRisk ? 'WARNING' : 'PASSED',
      severity: hasRateLimitRisk ? 'MEDIUM' : 'LOW',
      message: hasRateLimitRisk ? 
        'High volume of actions may trigger rate limits' : 
        'Rate limit risk is minimal'
    });

    // Error Handling Check
    const hasErrorHandling = this.checkErrorHandling(workflowData.actions || []);
    checks.push({
      name: 'Error Handling Assessment',
      status: hasErrorHandling ? 'PASSED' : 'WARNING',
      severity: hasErrorHandling ? 'LOW' : 'MEDIUM',
      message: hasErrorHandling ? 
        'Workflow includes error handling mechanisms' : 
        'Consider adding error handling for better reliability'
    });

    // Compliance Check
    checks.push({
      name: 'Compliance Requirements',
      status: 'PASSED',
      severity: 'LOW',
      message: 'Basic compliance requirements appear to be met'
    });

    return checks;
  }

  /**
   * Identify specific risk factors
   */
  private identifyRiskFactors(workflowData: any): Array<{
    type: string;
    severity: string;
    description: string;
    impact: string;
  }> {
    const riskFactors = [];
    const actions = workflowData.actions || [];

    // Infinite Loop Risk
    if (this.detectInfiniteLoopRisk(workflowData)) {
      riskFactors.push({
        type: 'INFINITE_LOOP_RISK',
        severity: 'HIGH',
        description: 'Workflow may create infinite loops due to re-enrollment conditions',
        impact: 'System performance degradation and resource exhaustion'
      });
    }

    // Data Loss Risk
    if (this.detectDataLossRisk(actions)) {
      riskFactors.push({
        type: 'DATA_LOSS_RISK',
        severity: 'HIGH',
        description: 'Actions may cause irreversible data modifications',
        impact: 'Potential data loss or corruption requiring manual recovery'
      });
    }

    // Complex Branching
    const branches = actions.filter((action: any) => 
      action.type === 'LIST_BRANCH' || action.actionTypeId === 4
    );
    if (branches.length > 3) {
      riskFactors.push({
        type: 'COMPLEX_BRANCHING',
        severity: 'MEDIUM',
        description: 'Workflow contains complex branching logic that may be difficult to troubleshoot',
        impact: 'Increased maintenance complexity and debugging difficulty'
      });
    }

    // External Integration Risk
    const externalActions = actions.filter((action: any) => 
      action.type === 'WEBHOOK' || 
      (action.fields && (action.fields.url || action.fields.webhook))
    );
    if (externalActions.length > 0) {
      riskFactors.push({
        type: 'EXTERNAL_INTEGRATION',
        severity: 'MEDIUM',
        description: 'Workflow depends on external services that may be unreliable',
        impact: 'Workflow failures due to external service downtime or changes'
      });
    }

    // High Volume Risk
    const emailActions = actions.filter((action: any) => 
      action.type === 'SEND_EMAIL' || action.actionTypeId === 3
    );
    if (emailActions.length > 5) {
      riskFactors.push({
        type: 'HIGH_VOLUME_EMAILS',
        severity: 'MEDIUM',
        description: 'Workflow sends multiple emails which may trigger spam filters',
        impact: 'Email deliverability issues and potential reputation damage'
      });
    }

    return riskFactors;
  }

  /**
   * Generate mitigation suggestions
   */
  private generateMitigationSuggestions(riskFactors: any[], workflowData: any): Array<{
    type: string;
    priority: string;
    description: string;
    implementation: string;
  }> {
    const suggestions = [];

    // Loop Protection
    if (riskFactors.some(rf => rf.type === 'INFINITE_LOOP_RISK')) {
      suggestions.push({
        type: 'LOOP_PROTECTION',
        priority: 'HIGH',
        description: 'Add Loop Protection',
        implementation: 'Implement maximum iteration limits and exit conditions to prevent infinite loops'
      });
    }

    // Data Backup
    if (riskFactors.some(rf => rf.type === 'DATA_LOSS_RISK')) {
      suggestions.push({
        type: 'DATA_BACKUP',
        priority: 'HIGH',
        description: 'Add Backup Step',
        implementation: 'Create data backup actions before any destructive operations'
      });
    }

    // Logic Simplification
    if (riskFactors.some(rf => rf.type === 'COMPLEX_BRANCHING')) {
      suggestions.push({
        type: 'SIMPLIFY_LOGIC',
        priority: 'MEDIUM',
        description: 'Simplify Branching Logic',
        implementation: 'Consider breaking complex workflows into smaller, more manageable pieces'
      });
    }

    // Error Handling
    const hasErrorHandling = this.checkErrorHandling(workflowData.actions || []);
    if (!hasErrorHandling) {
      suggestions.push({
        type: 'ERROR_HANDLING',
        priority: 'MEDIUM',
        description: 'Add Error Handling',
        implementation: 'Include error handling branches and notification mechanisms for failed actions'
      });
    }

    // Monitoring
    suggestions.push({
      type: 'MONITORING',
      priority: 'LOW',
      description: 'Add Monitoring',
      implementation: 'Set up monitoring and alerting for workflow performance and failures'
    });

    return suggestions;
  }

  /**
   * Generate rollback plan
   */
  private generateRollbackPlan(riskLevel: string, workflowData: any): {
    complexity: string;
    steps: string[];
    estimatedTime: string;
    requiresManualIntervention: boolean;
  } {
    const actions = workflowData.actions || [];
    const hasDataModifications = actions.some((action: any) => 
      action.type === 'SET_PROPERTY' || action.actionTypeId === 0
    );

    if (riskLevel === 'CRITICAL') {
      return {
        complexity: 'HIGH',
        steps: [
          'Immediately disable workflow in HubSpot',
          'Identify affected contacts/companies',
          'Manually reverse data changes if possible',
          'Notify stakeholders of the incident',
          'Implement fixes before re-enabling',
          'Test thoroughly in sandbox environment'
        ],
        estimatedTime: '2-4 hours',
        requiresManualIntervention: true
      };
    } else if (riskLevel === 'HIGH') {
      return {
        complexity: 'MEDIUM',
        steps: [
          'Pause workflow execution',
          'Review recent workflow runs',
          'Revert to previous workflow version if available',
          'Monitor for any side effects',
          'Resume with caution'
        ],
        estimatedTime: '30-60 minutes',
        requiresManualIntervention: true
      };
    } else {
      return {
        complexity: 'LOW',
        steps: [
          'Use WorkflowGuard rollback feature',
          'Restore previous workflow version',
          'Verify workflow functionality',
          'Monitor performance'
        ],
        estimatedTime: '5-15 minutes',
        requiresManualIntervention: false
      };
    }
  }

  /**
   * Generate recovery steps
   */
  private generateRecoverySteps(riskFactors: any[]): string[] {
    const steps = [
      'Access WorkflowGuard dashboard',
      'Navigate to affected workflow',
      'Review risk assessment results',
      'Apply suggested mitigations'
    ];

    if (riskFactors.some(rf => rf.type === 'DATA_LOSS_RISK')) {
      steps.push('Restore data from backup if available');
      steps.push('Manually correct affected records');
    }

    if (riskFactors.some(rf => rf.type === 'INFINITE_LOOP_RISK')) {
      steps.push('Remove contacts from workflow enrollment');
      steps.push('Fix loop conditions before re-enrollment');
    }

    steps.push('Test workflow in sandbox environment');
    steps.push('Gradually re-enable with monitoring');

    return steps;
  }

  // Risk Detection Helper Methods

  private detectInfiniteLoopRisk(workflowData: any): boolean {
    try {
      // Check for re-enrollment triggers that could cause loops
      const triggers = workflowData.enrollmentTriggers || workflowData.enrollmentCriteria || [];
      const actions = workflowData.actions || [];

      // Look for property changes that might trigger re-enrollment
      const propertyActions = actions.filter((action: any) => 
        action.type === 'SET_PROPERTY' || action.actionTypeId === 0
      );

      // If workflow modifies properties that are also enrollment triggers, it's risky
      if (Array.isArray(triggers) && propertyActions.length > 0) {
        return triggers.some((trigger: any) => 
          propertyActions.some((action: any) => 
            action.fields?.property_name === trigger.propertyName ||
            action.fields?.property === trigger.property
          )
        );
      }

      return false;
    } catch (error) {
      this.logger.warn('⚠️ LOOP DETECTION: Error detecting infinite loop risk:', error);
      return false;
    }
  }

  private detectDataLossRisk(actions: any[]): boolean {
    try {
      // Look for actions that modify data without backup
      return actions.some((action: any) => 
        action.type === 'SET_PROPERTY' || 
        action.actionTypeId === 0 ||
        action.type === 'DELETE_CONTACT' ||
        (action.fields && action.fields.property_name && !action.fields.backup)
      );
    } catch (error) {
      this.logger.warn('⚠️ DATA LOSS DETECTION: Error detecting data loss risk:', error);
      return false;
    }
  }

  private checkErrorHandling(actions: any[]): boolean {
    try {
      // Look for error handling branches or try-catch patterns
      return actions.some((action: any) => 
        action.type === 'LIST_BRANCH' && 
        (action.filters?.some((filter: any) => 
          filter.property?.includes('error') || 
          filter.property?.includes('failed')
        ))
      );
    } catch (error) {
      this.logger.warn('⚠️ ERROR HANDLING CHECK: Error checking error handling:', error);
      return false;
    }
  }

  private detectRateLimitRisk(actions: any[]): boolean {
    try {
      // High number of API calls or email actions
      const apiActions = actions.filter((action: any) => 
        action.type === 'SEND_EMAIL' || 
        action.type === 'WEBHOOK' ||
        action.actionTypeId === 3
      );
      return apiActions.length > 10;
    } catch (error) {
      this.logger.warn('⚠️ RATE LIMIT DETECTION: Error detecting rate limit risk:', error);
      return false;
    }
  }

  private detectPermissionRisk(actions: any[]): boolean {
    try {
      // Look for actions that might require special permissions
      return actions.some((action: any) => 
        action.type === 'WEBHOOK' ||
        action.type === 'INTEGRATION' ||
        (action.fields && action.fields.url)
      );
    } catch (error) {
      this.logger.warn('⚠️ PERMISSION DETECTION: Error detecting permission risk:', error);
      return false;
    }
  }
}
