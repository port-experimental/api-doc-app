/**
 * Token Validation Endpoint
 * POST /api/auth/validate
 * 
 * Validates the current token by making a test API call to Port
 */

import { NextResponse } from 'next/server';
import { tokenManager } from '@/services/tokenManager';
import { validateConfig } from '@/lib/config';

export async function POST() {
  try {
    // First check if config is valid
    const configValidation = validateConfig();
    if (!configValidation.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Configuration error',
          details: configValidation.errors,
        },
        { status: 400 }
      );
    }

    // Validate the token
    const isValid = await tokenManager.validateToken();

    if (isValid) {
      const status = tokenManager.getStatus();
      return NextResponse.json({
        valid: true,
        source: status.source,
        expiresAt: status.expiresAt
          ? new Date(status.expiresAt).toISOString()
          : null,
        remainingMs: status.remainingMs,
      });
    } else {
      return NextResponse.json(
        {
          valid: false,
          error: 'Token validation failed',
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('[API] Token validation error:', error);
    return NextResponse.json(
      {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

