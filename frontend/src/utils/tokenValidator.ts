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

      console.log('🔐 TokenValidator - Token analysis:');
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
      console.log('❌ TokenValidator - Error parsing token:', error);
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
      return true;
    }
    
    return false;
  }

  /**
   * Debug token information for troubleshooting
   * Memory Check: Following MISTAKE #6 lesson - Specific error messages
   */
  static debugToken(): void {
    console.log('🔍 TokenValidator - Debug Information:');
    
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

console.log('🔐 TokenValidator loaded - Available console commands:');
console.log('  - debugToken() - Show detailed token information');
console.log('  - validateToken() - Validate current token');
console.log('  - cleanToken() - Remove invalid token');
