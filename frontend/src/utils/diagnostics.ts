/**
 * Diagnostic Utility for WorkflowGuard App
 * Helps identify common configuration and initialization issues
 */

export class Diagnostics {
  static checkEnvironment() {
    // Check environment variables
    const apiUrl = import.meta.env.VITE_API_URL;
    
    // Check localStorage
    const token = localStorage.getItem('token');
    
    return {
      apiUrl,
      hasToken: !!token,
      localStorageAvailable: typeof localStorage !== 'undefined'
    };
  }

  static async checkApiConnectivity() {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://api.workflowguard.pro';
      
      const response = await fetch(`${apiUrl}/api/health`, { 
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        return { success: false, error: `API returned status ${response.status}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static runAll() {
    const env = this.checkEnvironment();
    this.checkApiConnectivity().then(api => {
    });
  }
}

// Run diagnostics on load
Diagnostics.runAll();