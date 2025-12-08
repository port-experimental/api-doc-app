'use client';

import React, { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AuthBar() {
  const { 
    token, setToken, clearToken, isAuthenticated,
    baseUrl, setBaseUrl, clearBaseUrl, hasCustomBaseUrl 
  } = useAuth();
  const [tokenInput, setTokenInput] = useState('');
  const [baseUrlInput, setBaseUrlInput] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleApplyToken = useCallback(() => {
    if (tokenInput.trim()) {
      // Strip "Bearer " prefix if user included it
      let tokenValue = tokenInput.trim();
      if (tokenValue.toLowerCase().startsWith('bearer ')) {
        tokenValue = tokenValue.substring(7);
      }
      setToken(tokenValue);
      setTokenInput('');
    }
  }, [tokenInput, setToken]);

  const handleClearToken = useCallback(() => {
    clearToken();
    setTokenInput('');
  }, [clearToken]);

  const handleApplyBaseUrl = useCallback(() => {
    if (baseUrlInput.trim()) {
      setBaseUrl(baseUrlInput.trim());
      setBaseUrlInput('');
    }
  }, [baseUrlInput, setBaseUrl]);

  const handleClearBaseUrl = useCallback(() => {
    clearBaseUrl();
    setBaseUrlInput('');
  }, [clearBaseUrl]);

  const handleTokenKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyToken();
    }
  }, [handleApplyToken]);

  const handleBaseUrlKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyBaseUrl();
    }
  }, [handleApplyBaseUrl]);

  // Mask the token for display
  const maskedToken = token 
    ? `${token.substring(0, 8)}${'•'.repeat(Math.min(20, token.length - 8))}` 
    : '';

  // Truncate base URL for display
  const truncatedBaseUrl = baseUrl && baseUrl.length > 40
    ? `${baseUrl.substring(0, 40)}...`
    : baseUrl;

  return (
    <div className="bg-slate-800/50 border-b border-slate-700">
      {/* Collapsed State - Just a toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-slate-800/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-sm text-slate-300">Authentication</span>
          {isAuthenticated && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-xs text-green-400">Using custom token</span>
            </span>
          )}
          {!isAuthenticated && (
            <span className="text-xs text-slate-500">Using server credentials</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {hasCustomBaseUrl && !isExpanded && (
            <span className="text-xs text-cyan-400 font-mono" title={baseUrl || ''}>
              {truncatedBaseUrl}
            </span>
          )}
          {isAuthenticated && !isExpanded && (
            <span className="text-xs text-slate-500 font-mono">{maskedToken}</span>
          )}
        </div>
      </button>

      {/* Expanded State - Input forms */}
      {isExpanded && (
        <div className="px-4 pb-3 pt-1 space-y-4">
          {/* Token Input */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              API Token (JWT)
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  onKeyDown={handleTokenKeyDown}
                  placeholder={isAuthenticated ? 'Enter new token to replace...' : 'Enter Port API token...'}
                  className="w-full px-3 py-2 pr-10 bg-slate-900 border border-slate-600 rounded-md text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  title={showToken ? 'Hide token' : 'Show token'}
                >
                  {showToken ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <button
                onClick={handleApplyToken}
                disabled={!tokenInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Apply
              </button>
              {isAuthenticated && (
                <button
                  onClick={handleClearToken}
                  className="px-4 py-2 border border-slate-600 text-slate-300 text-sm rounded-md hover:bg-slate-700 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            {isAuthenticated && (
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-xs text-slate-500">Current:</span>
                <span className="text-xs text-slate-400 font-mono">{maskedToken}</span>
              </div>
            )}
          </div>

          {/* Base URL Input */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              Base URL (for &quot;Try it out&quot;)
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={baseUrlInput}
                  onChange={(e) => setBaseUrlInput(e.target.value)}
                  onKeyDown={handleBaseUrlKeyDown}
                  placeholder={hasCustomBaseUrl ? 'Enter new base URL to replace...' : 'https://api.example.com'}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleApplyBaseUrl}
                disabled={!baseUrlInput.trim()}
                className="px-4 py-2 bg-cyan-600 text-white text-sm rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Apply
              </button>
              {hasCustomBaseUrl && (
                <button
                  onClick={handleClearBaseUrl}
                  className="px-4 py-2 border border-slate-600 text-slate-300 text-sm rounded-md hover:bg-slate-700 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            {hasCustomBaseUrl && (
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-xs text-slate-500">Current:</span>
                <span className="text-xs text-cyan-400 font-mono" title={baseUrl || ''}>{truncatedBaseUrl}</span>
              </div>
            )}
          </div>

          {/* Help text */}
          <p className="text-xs text-slate-500 border-t border-slate-700 pt-3">
            <strong className="text-slate-400">Token:</strong> Use your own Port API JWT for authentication.{' '}
            <strong className="text-slate-400">Base URL:</strong> Override the API server for testing (e.g., local dev server).
          </p>
        </div>
      )}
    </div>
  );
}

