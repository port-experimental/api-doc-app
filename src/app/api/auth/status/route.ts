/**
 * Token Status Endpoint
 * GET /api/auth/status
 * 
 * Returns the current token status without making external API calls
 */

import { NextResponse } from 'next/server';
import { tokenManager } from '@/services/tokenManager';
import { validateConfig } from '@/lib/config';

export async function GET() {
  const configValidation = validateConfig();

  // Proactively obtain a token when configured so status reflects actual auth state,
  // not just cold-start cache (getToken() is a no-op if a valid token is already cached).
  if (configValidation.valid) {
    try {
      await tokenManager.getToken();
    } catch {
      // Token fetch failed — getStatus() will reflect this
    }
  }

  const tokenStatus = tokenManager.getStatus();

  return NextResponse.json({
    configured: configValidation.valid,
    configErrors: configValidation.errors,
    token: {
      hasToken: tokenStatus.source !== 'none',
      isValid: tokenStatus.isValid,
      source: tokenStatus.source,
      expiresAt: tokenStatus.expiresAt
        ? new Date(tokenStatus.expiresAt).toISOString()
        : null,
      remainingMs: tokenStatus.remainingMs,
      remainingMinutes: tokenStatus.remainingMs
        ? Math.round(tokenStatus.remainingMs / 1000 / 60)
        : null,
    },
  });
}

