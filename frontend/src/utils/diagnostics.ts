/**
 * Diagnostic Utility for WorkflowGuard App
 * Helps identify common configuration and initialization issues
 */

export class Diagnostics {
  static checkEnvironment() {
    console.log('=== Environment Diagnostics ===');
    
    // Check environment variables
    const apiUrl = import.meta.env.VITE_API_URL;
    console.log('VITE_API_URL:', apiUrl || 'Not set');
    
    // Check localStorage
    console.log('localStorage available:', typeof localStorage !== 'undefined');
    
    // Check token
    const token = localStorage.getItem('token');
    console.log('Token in localStorage:', token ? 'Exists' : 'Not found');
    
    // Check window object
    console.log('Window location:', window.location.href);
    
    return {
      apiUrl,
      hasToken: !!token,
      localStorageAvailable: typeof localStorage !== 'undefined'
    };
  }

  static async checkApiConnectivity() {
    console.log('=== API Connectivity Diagnostics ===');
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://api.workflowguard.pro';
      console.log('Testing API connectivity to:', apiUrl);
      
      const response = await fetch(`${apiUrl}/api/health`, { 
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      });
      
      console.log('Health check response:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Health check data:', data);
        return { success: true, data };
      } else {
        console.error('Health check failed:', response.status);
        return { success: false, error: `API returned status ${response.status}` };
      }
    } catch (error) {
      console.error('API connectivity test failed:', error);
      return { success: false, error: error.message };
    }
  }

  static runAll() {
    console.log('=== Running Full Diagnostics ===');
    const env = this.checkEnvironment();
    this.checkApiConnectivity().then(api => {
      console.log('=== Diagnostics Complete ===');
      console.log('Environment:', env);
      console.log('API:', api);
    });
  }
}

// Run diagnostics on load
Diagnostics.runAll();