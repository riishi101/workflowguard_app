/**
 * Token Validation Utility
 * Memory Check: Following MISTAKE #6 lesson - Specific error messages with clear instructions
 */

export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  payload: any;
  error?: string;
}

export class TokenValidator {
  /**
   * Validate JWT token from localStorage
   * Memory Check: Avoiding 401 errors by ensuring token validity
   */
  static validateToken(): TokenValidationResult {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return {
        isValid: false,
        isExpired: false,
        payload: null,
        error: 'No token found in localStorage'
      };
    }

    try {
      // Parse JWT token
      const parts = token.split('.');
      if (parts.length !== 3) {
        return {
          isValid: false,
          isExpired: false,
          payload: null,
          error: 'Invalid token format - not a valid JWT'
        };
      }

      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      const isExpired = payload.exp < currentTime;

      console.log('  - payload:', { sub: payload.sub, email: payload.email, exp: payload.exp });
      console.log('  - current time:', currentTime);
      console.log('  - expires at:', payload.exp);
      console.log('  - is expired:', isExpired);
      console.log('  - time until expiry:', payload.exp - currentTime, 'seconds');

      return {
        isValid: !isExpired,
        isExpired,
        payload,
        error: isExpired ? 'Token has expired' : undefined
      };

    } catch (error) {
      return {
        isValid: false,
        isExpired: false,
        payload: null,
        error: 'Failed to parse token: ' + (error as Error).message
      };
    }
  }

  /**
   * Clean invalid tokens from localStorage
   * Memory Check: Following MISTAKE #6 lesson - Clear user feedback
   */
  static cleanInvalidToken(): boolean {
    const validation = this.validateToken();
    
    if (!validation.isValid) {
      console.log('🧹 TokenValidator - Cleaning invalid token:', validation.error);
      localStorage.removeItem('token');
      
      // Show user-friendly notification
      if (window.location.pathname !== '/') {
        // Don't redirect immediately to avoid loops, let AuthContext handle it
      }
      return true;
    }
    
    return false;
  }

  /**
   * Debug token information for troubleshooting
   * Memory Check: Following MISTAKE #6 lesson - Specific error messages
   */
  static debugToken(): void {
    const token = localStorage.getItem('token');
    console.log('  - Token exists:', !!token);
    
    if (token) {
      console.log('  - Token length:', token.length);
      console.log('  - Token preview:', token.substring(0, 50) + '...');
      
      const validation = this.validateToken();
      console.log('  - Validation result:', validation);
      
      if (validation.payload) {
        console.log('  - User ID:', validation.payload.sub);
        console.log('  - Email:', validation.payload.email);
        console.log('  - Issued at:', new Date(validation.payload.iat * 1000));
        console.log('  - Expires at:', new Date(validation.payload.exp * 1000));
      }
    }
  }
}

// Global debug function for browser console
(window as any).debugToken = () => TokenValidator.debugToken();
(window as any).validateToken = () => TokenValidator.validateToken();
(window as any).cleanToken = () => TokenValidator.cleanInvalidToken();

// Additional debug functions for testing
(window as any).testWorkflowAPI = async () => {
  console.log('🧪 Testing Workflow APIs...');
  try {
    const { ApiService } = await import('../lib/api');
    
    const workflows = await ApiService.getHubSpotWorkflows();
    // Enhanced debugging for Memory compliance
    if (workflows?.data?.length === 0) {
      console.log('- Check if HubSpot account has active workflows');
      console.log('- Verify HubSpot OAuth scopes include workflow permissions');
      console.log('- Check backend database connection (Memory 6a80c641)');
      console.log('- Verify parameter order in backend calls (Memory 3af4ea2c)');
      console.log('');
      console.log('1. HubSpot account has no workflows created');
      console.log('2. All workflows are in DRAFT status (not ACTIVE)');
      console.log('3. OAuth scopes missing workflow read permissions');
      console.log('4. Backend connecting to wrong database (Memory 6a80c641)');
    }
    
    const protectedWorkflows = await ApiService.getProtectedWorkflows();
    // Test backend health
    const user = await ApiService.getCurrentUser();
    } catch (error) {
    console.log('- Status:', error.response?.status);
    console.log('- Message:', error.response?.data?.message);
    console.log('- URL:', error.config?.url);
  }
};

(window as any).testAuth = async () => {
  console.log('🧪 Testing Authentication...');
  try {
    const { ApiService } = await import('../lib/api');
    const user = await ApiService.getCurrentUser();
    } catch (error) {
    }
};

// Memory-based diagnostic function
(window as any).diagnoseWorkflowIssue = async () => {
  console.log('=====================================');
  
  try {
    const { ApiService } = await import('../lib/api');
    
    // Test 1: Authentication
    const user = await ApiService.getCurrentUser();
    // Test 2: HubSpot Workflows
    const workflows = await ApiService.getHubSpotWorkflows();
    // Test 3: Memory compliance checks
    console.log('- Database Connection (Memory 6a80c641): Backend should use Neon, not local PostgreSQL');
    console.log('- Parameter Order (Memory 3af4ea2c): Should be getWorkflowById(userId, workflowId)');
    console.log('- API Endpoints (Memory 1abf712b): Should use /api prefix');
    
    // Test 4: Raw API call (Memory 1abf712b compliance - use full URL)
    const token = localStorage.getItem('token');
    const apiBaseUrl = 'https://api.workflowguard.pro';
    const response = await fetch(`${apiBaseUrl}/api/workflow/hubspot`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const rawData = await response.json();
    } catch (error) {
    }
};

// HubSpot account verification function
(window as any).checkHubSpotAccount = () => {
  console.log('=====================================');
  console.log('');
  console.log('1. Log into your HubSpot account');
  console.log('2. Go to Automation > Workflows');
  console.log('3. Check if you have any workflows created');
  console.log('4. Verify workflows are ACTIVE (not DRAFT)');
  console.log('');
  console.log('- Automation scope required for workflow access');
  console.log('- Marketing automation permissions needed');
  console.log('');
  console.log('1. Create a test workflow in HubSpot');
  console.log('2. Activate any draft workflows');
  console.log('3. Reconnect HubSpot with proper scopes');
  console.log('4. Check if trial account has workflow limitations');
};

// Enhanced HubSpot Trial Account Diagnostic
(window as any).diagnoseTrialLimitations = async () => {
  console.log('=====================================');
  console.log('');
  
  try {
    const token = localStorage.getItem('token');
    const apiBaseUrl = 'https://api.workflowguard.pro';
    
    // Test 1: Check HubSpot account type
    const accountTest = await fetch(`${apiBaseUrl}/api/auth/hubspot/account-info`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (accountTest.ok) {
      const accountData = await accountTest.json();
      console.log('  - Account Type:', accountData.accountType || 'Unknown');
      console.log('  - Trial Status:', accountData.trialStatus || 'Unknown');
    } else {
      }
    
    // Test 2: Check OAuth scopes
    const scopeTest = await fetch(`${apiBaseUrl}/api/auth/hubspot/token-info`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (scopeTest.ok) {
      const scopeData = await scopeTest.json();
      const scopes = scopeData.scopes || [];
      // Check for workflow-related scopes
      const workflowScopes = ['automation', 'workflows', 'marketing-automation'];
      workflowScopes.forEach(scope => {
        const hasScope = scopes.includes(scope);
      });
      
    } else {
      }
    
    // Test 3: Direct HubSpot API call with detailed error analysis
    const workflowTest = await fetch(`${apiBaseUrl}/api/workflow/hubspot-debug`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (workflowTest.ok) {
      const workflowData = await workflowTest.json();
      } else {
      const errorText = await workflowTest.text();
      }
    
    // Analysis and recommendations
    console.log('');
    console.log('- UI Message: "Workflows will no longer be accessible once your trial ends"');
    console.log('- Behavior: Workflows visible in UI but not accessible via API');
    console.log('- Root Cause: HubSpot restricts workflow API access for trial accounts');
    console.log('');
    console.log('   - Removes all trial limitations');
    console.log('   - Enables full workflow API access');
    console.log('   - Immediate solution');
    console.log('');
    console.log('2. 🔄 RECONNECT with Enhanced Scopes (if upgrade not possible)');
    console.log('   - Disconnect HubSpot integration');
    console.log('   - Reconnect with explicit automation permissions');
    console.log('   - May not work for trial accounts');
    console.log('');
    console.log('   - Ask about workflow API access for trial accounts');
    console.log('   - Request temporary API access for testing');
    
  } catch (error) {
    }
};

console.log('  - debugToken() - Show detailed token information');
console.log('  - validateToken() - Validate current token');
console.log('  - cleanToken() - Remove invalid token');
console.log('  - testWorkflowAPI() - Test workflow API endpoints');
console.log('  - testAuth() - Test authentication status');
console.log('  - diagnoseWorkflowIssue() - Memory-based workflow diagnosis');
console.log('  - checkHubSpotAccount() - HubSpot account verification guide');
console.log('  - diagnoseTrialLimitations() - HubSpot trial account diagnosis (NEW)');
