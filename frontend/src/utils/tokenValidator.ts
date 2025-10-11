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
    console.log('Validating token...');
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('No token found in localStorage');
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
        console.log('Invalid token format');
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

      console.log('Token validation result:', { isValid: !isExpired, isExpired, payload });

      return {
        isValid: !isExpired,
        isExpired,
        payload,
        error: isExpired ? 'Token has expired' : undefined
      };

    } catch (error) {
      console.error('Token parsing error:', error);
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
    console.log('Cleaning invalid tokens...');
    const validation = this.validateToken();
    
    if (!validation.isValid) {
      console.log('Removing invalid token:', validation.error);
      localStorage.removeItem('token');
      
      // Show user-friendly notification
      if (window.location.pathname !== '/') {
        // Don't redirect immediately to avoid loops, let AuthContext handle it
      }
      return true;
    }
    
    console.log('Token is valid, no cleanup needed');
    return false;
  }

  /**
   * Debug token information for troubleshooting
   * Memory Check: Following MISTAKE #6 lesson - Specific error messages
   */
  static debugToken() {
    console.log('=== Token Debug Information ===');
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found');
      return;
    }
    
    console.log('Token exists, length:', token.length);
    
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const header = JSON.parse(atob(parts[0]));
        const payload = JSON.parse(atob(parts[1]));
        console.log('Token header:', header);
        console.log('Token payload:', payload);
        console.log('Token expires:', new Date(payload.exp * 1000));
      } else {
        console.log('Invalid token format');
      }
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  }
}

// Run token debug on load
TokenValidator.debugToken();