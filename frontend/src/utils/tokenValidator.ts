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
  static debugToken() {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }
    
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const header = JSON.parse(atob(parts[0]));
        const payload = JSON.parse(atob(parts[1]));
      } else {
      }
    } catch (error) {
    }
  }
}

// Run token debug on load
TokenValidator.debugToken();