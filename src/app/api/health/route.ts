/**
 * Health Check Endpoint
 * GET /api/health
 */

import { NextResponse } from 'next/server';
import { config, validateConfig } from '@/lib/config';
import { tokenManager } from '@/services/tokenManager';

export async function GET() {
  const configValidation = validateConfig();
  const tokenStatus = tokenManager.getStatus();

  const health = {
    status: configValidation.valid ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: config.app.version,
    checks: {
      config: {
        status: configValidation.valid ? 'pass' : 'fail',
        errors: configValidation.errors,
      },
      token: {
        status: tokenStatus.isValid ? 'pass' : 'warn',
        source: tokenStatus.source,
        expiresAt: tokenStatus.expiresAt
          ? new Date(tokenStatus.expiresAt).toISOString()
          : null,
      },
    },
  };

  const statusCode = configValidation.valid ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}

