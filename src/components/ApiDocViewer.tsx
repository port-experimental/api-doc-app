'use client';

/**
 * API Documentation Viewer Component
 * Wraps Redoc with custom theming and configuration
 */

import { useEffect, useState } from 'react';
import LoadingState, { ErrorState } from './LoadingState';

interface ApiDocViewerProps {
  specUrl?: string;
  spec?: object;
  className?: string;
}

// Redoc theme configuration - dark mode with high contrast
const redocOptions = {
  theme: {
    colors: {
      primary: {
        main: '#38bdf8', // sky-400 - brighter for better visibility
        light: '#7dd3fc', // sky-300
        dark: '#0284c7', // sky-600
        contrastText: '#ffffff',
      },
      success: {
        main: '#4ade80', // green-400
        light: '#86efac', // green-300
        dark: '#16a34a', // green-600
        contrastText: '#000000',
      },
      warning: {
        main: '#fbbf24', // amber-400
        light: '#fcd34d', // amber-300
        dark: '#d97706', // amber-600
        contrastText: '#000000',
      },
      error: {
        main: '#f87171', // red-400
        light: '#fca5a5', // red-300
        dark: '#dc2626', // red-600
        contrastText: '#ffffff',
      },
      text: {
        primary: '#f1f5f9', // slate-100 - brighter for better readability
        secondary: '#cbd5e1', // slate-300 - brighter secondary text
        light: '#94a3b8', // slate-400
      },
      border: {
        dark: '#475569', // slate-600
        light: '#64748b', // slate-500
      },
      responses: {
        success: {
          color: '#4ade80', // green-400
          backgroundColor: 'rgba(74, 222, 128, 0.1)',
          tabTextColor: '#4ade80',
        },
        error: {
          color: '#f87171', // red-400
          backgroundColor: 'rgba(248, 113, 113, 0.1)',
          tabTextColor: '#f87171',
        },
        redirect: {
          color: '#fbbf24', // amber-400
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          tabTextColor: '#fbbf24',
        },
        info: {
          color: '#38bdf8', // sky-400
          backgroundColor: 'rgba(56, 189, 248, 0.1)',
          tabTextColor: '#38bdf8',
        },
      },
      http: {
        get: '#4ade80', // green-400
        post: '#38bdf8', // sky-400
        put: '#fbbf24', // amber-400
        patch: '#fb923c', // orange-400
        delete: '#f87171', // red-400
        options: '#a78bfa', // violet-400
        head: '#f472b6', // pink-400
        basic: '#94a3b8', // slate-400
        link: '#38bdf8', // sky-400
      },
    },
    typography: {
      fontSize: '15px',
      lineHeight: '1.6',
      fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
      headings: {
        fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
        fontWeight: '600',
      },
      code: {
        fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
        fontSize: '13px',
        backgroundColor: '#1e293b', // slate-800
        color: '#f1f5f9', // slate-100
        wrap: true,
      },
      links: {
        color: '#38bdf8', // sky-400
        visited: '#a78bfa', // violet-400
        hover: '#7dd3fc', // sky-300
      },
    },
    sidebar: {
      backgroundColor: '#0f172a', // slate-950
      textColor: '#e2e8f0', // slate-200
      activeTextColor: '#38bdf8', // sky-400
      width: '280px',
      groupItems: {
        activeBackgroundColor: '#1e293b', // slate-800
        activeTextColor: '#38bdf8', // sky-400
        textTransform: 'none',
      },
      level1Items: {
        activeBackgroundColor: '#1e293b',
        activeTextColor: '#38bdf8',
        textTransform: 'none',
      },
      arrow: {
        color: '#94a3b8', // slate-400
        size: '1.2em',
      },
    },
    rightPanel: {
      backgroundColor: '#1e293b', // slate-800
      textColor: '#f1f5f9', // slate-100
      width: '45%',
    },
    schema: {
      nestedBackground: '#1e293b', // slate-800
      typeNameColor: '#38bdf8', // sky-400
      typeTitleColor: '#f8fafc', // slate-50
      requireLabelColor: '#f87171', // red-400
      labelsTextSize: '0.9em',
      nestingSpacing: '1em',
      arrow: {
        color: '#94a3b8', // slate-400
        size: '1.1em',
      },
    },
    codeBlock: {
      backgroundColor: '#0f172a', // slate-950
    },
  },
  scrollYOffset: 0,
  scrollToLabel: true, // Enable scrolling to label when clicking menu items
  hideDownloadButton: false,
  hideHostname: false,
  expandResponses: '200,201',
  requiredPropsFirst: true,
  sortPropsAlphabetically: false,
  pathInMiddlePanel: false, // Show path in right panel to reduce middle panel clutter
  jsonSampleExpandLevel: 2,
  hideSingleRequestSampleTab: true,
  menuToggle: true,
  nativeScrollbars: false, // Let Redoc manage its own scrolling
  disableSearch: false,
  showExtensions: true,
  hideLoading: false,
  noAutoAuth: false,
};

export function ApiDocViewer({ specUrl, spec, className = '' }: ApiDocViewerProps) {
  const [RedocComponent, setRedocComponent] = useState<React.ComponentType<{
    specUrl?: string;
    spec?: object;
    options?: object;
  }> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Dynamically import Redoc to avoid SSR issues
    const loadRedoc = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Import RedocStandalone from redoc
        const { RedocStandalone } = await import('redoc');
        setRedocComponent(() => RedocStandalone);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load Redoc:', err);
        setError(err instanceof Error ? err.message : 'Failed to load API documentation');
        setIsLoading(false);
      }
    };

    loadRedoc();
  }, []);

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setError(null);
          setIsLoading(true);
          window.location.reload();
        }}
      />
    );
  }

  if (isLoading || !RedocComponent) {
    return <LoadingState message="Loading API documentation..." />;
  }

  if (!specUrl && !spec) {
    return <ErrorState message="No API specification provided" />;
  }

  return (
    <div 
      className={`redoc-container ${className}`}
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden', // Redoc handles its own scrolling
      }}
    >
      <RedocComponent
        specUrl={specUrl}
        spec={spec}
        options={redocOptions}
      />
    </div>
  );
}

export default ApiDocViewer;
