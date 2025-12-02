import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Configure headers for iFrame embedding and security
  async headers() {
    // Get allowed origins from environment or use defaults
    const allowedOrigins = process.env.ALLOWED_IFRAME_ORIGINS
      ? process.env.ALLOWED_IFRAME_ORIGINS.split(',').map((origin) => origin.trim())
      : ['https://app.getport.io', 'https://app.eu.getport.io'];

    // Build frame-ancestors directive
    const frameAncestors = allowedOrigins.join(' ');

    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          // Allow embedding in iFrames from specific domains
          {
            key: 'X-Frame-Options',
            value: `ALLOW-FROM ${allowedOrigins[0]}`,
          },
          // Content Security Policy with frame-ancestors for modern browsers
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors 'self' ${frameAncestors}`,
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Enable XSS filter in browsers
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions policy (formerly Feature Policy)
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // CORS headers for API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: allowedOrigins.join(', '),
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400', // 24 hours
          },
        ],
      },
    ];
  },

  // Transpile redoc and styled-components for Next.js compatibility
  transpilePackages: ['redoc', 'mobx', 'styled-components'],

  // Compiler options
  compiler: {
    // Enable styled-components support
    styledComponents: true,
  },

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Optimize for production
  output: 'standalone',

  // Environment variables exposed to the browser (public)
  env: {
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
};

export default nextConfig;