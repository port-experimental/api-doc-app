/**
 * Token Manager Service
 * Handles Port API authentication with automatic token rotation
 * Following port-pr-chart pattern
 */

import axios from 'axios';
import { config, getPortApiUrl } from '@/lib/config';

interface TokenData {
  accessToken: string;
  expiresAt: number;
  obtainedAt: number;
}

interface TokenStatus {
  isValid: boolean;
  expiresAt: number | null;
  remainingMs: number | null;
  source: 'client_credentials' | 'manual_token' | 'none';
}

class TokenManager {
  private currentToken: TokenData | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private isRefreshing = false;

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getToken(): Promise<string> {
    // If we have a valid token, return it
    if (this.currentToken && !this.isTokenExpired()) {
      return this.currentToken.accessToken;
    }

    // Try to get a new token
    return this.refreshToken();
  }

  /**
   * Refresh the access token
   */
  async refreshToken(): Promise<string> {
    // Prevent concurrent refresh attempts
    if (this.isRefreshing) {
      // Wait for the current refresh to complete
      await this.waitForRefresh();
      if (this.currentToken) {
        return this.currentToken.accessToken;
      }
      throw new Error('Token refresh failed');
    }

    this.isRefreshing = true;

    try {
      // Try client credentials first
      if (config.port.clientId && config.port.clientSecret) {
        const token = await this.fetchTokenWithClientCredentials();
        this.setToken(token, 'client_credentials');
        return token;
      }

      // Fall back to manual token
      if (config.port.apiToken) {
        this.setManualToken(config.port.apiToken);
        return config.port.apiToken;
      }

      throw new Error('No authentication method available');
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Fetch token using client credentials
   */
  private async fetchTokenWithClientCredentials(): Promise<string> {
    const baseUrl = getPortApiUrl();
    // Read directly from process.env at call time to avoid stale module-level config
    const clientId = process.env.PORT_CLIENT_ID || config.port.clientId;
    const clientSecret = process.env.PORT_CLIENT_SECRET || config.port.clientSecret;

    try {
      const response = await axios.post(
        `${baseUrl}/v1/auth/access_token`,
        {
          clientId,
          clientSecret,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.accessToken) {
        return response.data.accessToken;
      }

      throw new Error('Invalid response from auth endpoint');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Failed to obtain token: ${message}`);
      }
      throw error;
    }
  }

  /**
   * Set a new token with expiration tracking
   */
  private setToken(accessToken: string, source: 'client_credentials' | 'manual_token'): void {
    const now = Date.now();
    
    // Port tokens typically expire in 3 hours (10800 seconds)
    // We'll set expiry to 2.5 hours to be safe
    const expiresAt = now + config.token.rotationIntervalMs;

    this.currentToken = {
      accessToken,
      expiresAt,
      obtainedAt: now,
    };

    // Schedule automatic refresh
    this.scheduleRefresh();

    console.log(`[TokenManager] Token obtained via ${source}, expires at ${new Date(expiresAt).toISOString()}`);
  }

  /**
   * Set a manual token (no automatic refresh scheduling)
   */
  private setManualToken(accessToken: string): void {
    this.currentToken = {
      accessToken,
      // Manual tokens don't have known expiry, set to 24 hours
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      obtainedAt: Date.now(),
    };

    console.log('[TokenManager] Using manual API token');
  }

  /**
   * Check if the current token is expired or about to expire
   */
  private isTokenExpired(): boolean {
    if (!this.currentToken) return true;

    // Consider expired if less than 5 minutes remaining
    const bufferMs = 5 * 60 * 1000;
    return Date.now() >= this.currentToken.expiresAt - bufferMs;
  }

  /**
   * Schedule automatic token refresh before expiry
   */
  private scheduleRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (!this.currentToken) return;

    // Refresh 5 minutes before expiry
    const refreshIn = this.currentToken.expiresAt - Date.now() - 5 * 60 * 1000;

    if (refreshIn > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken().catch((error) => {
          console.error('[TokenManager] Auto-refresh failed:', error.message);
        });
      }, refreshIn);

      console.log(`[TokenManager] Scheduled refresh in ${Math.round(refreshIn / 1000 / 60)} minutes`);
    }
  }

  /**
   * Wait for an ongoing refresh to complete
   */
  private waitForRefresh(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.isRefreshing) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  /**
   * Get current token status
   */
  getStatus(): TokenStatus {
    if (!this.currentToken) {
      return {
        isValid: false,
        expiresAt: null,
        remainingMs: null,
        source: 'none',
      };
    }

    const remainingMs = this.currentToken.expiresAt - Date.now();
    const source = config.port.clientId ? 'client_credentials' : 'manual_token';

    return {
      isValid: remainingMs > 0,
      expiresAt: this.currentToken.expiresAt,
      remainingMs: Math.max(0, remainingMs),
      source,
    };
  }

  /**
   * Validate the current token by making a test API call
   */
  async validateToken(): Promise<boolean> {
    try {
      const token = await this.getToken();
      const baseUrl = getPortApiUrl();

      // Make a lightweight API call to validate
      await axios.get(`${baseUrl}/v1/blueprints`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          limit: 1,
        },
      });

      return true;
    } catch (error) {
      console.error('[TokenManager] Token validation failed:', error);
      return false;
    }
  }

  /**
   * Force a token refresh (useful after 401/403 errors)
   */
  async forceRefresh(): Promise<string> {
    this.currentToken = null;
    return this.refreshToken();
  }

  /**
   * Clear the current token and stop refresh timer
   */
  clear(): void {
    this.currentToken = null;
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

// Export singleton instance
export const tokenManager = new TokenManager();

// Export class for testing
export { TokenManager };
export type { TokenData, TokenStatus };
