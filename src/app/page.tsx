'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ApiDocViewer from '@/components/ApiDocViewer';
import LoadingState from '@/components/LoadingState';
import type { ServiceSpec } from '@/services/portService';
import type { OpenAPISource } from '@/lib/config';

interface ApiResponse {
  config: {
    sources: OpenAPISource[];
  };
  services: ServiceSpec[];
  grouped: Record<string, ServiceSpec[]>;
  sourceLabels: string[];
  count: number;
  available: number;
  failed: number;
}

export default function Home() {
  const [serviceSpecs, setServiceSpecs] = useState<ServiceSpec[]>([]);
  const [grouped, setGrouped] = useState<Record<string, ServiceSpec[]>>({});
  const [sourceLabels, setSourceLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceSpec | null>(null);

  // Fetch service specs on mount
  useEffect(() => {
    fetchServiceSpecs();
  }, []);

  const fetchServiceSpecs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/port/schemas');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch service specs: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      setServiceSpecs(data.services || []);
      setGrouped(data.grouped || {});
      setSourceLabels(data.sourceLabels || []);

      // Auto-select first service with a valid schema
      if (data.services && data.services.length > 0) {
        const firstWithSchema = data.services.find((s: ServiceSpec) => s.schema !== null && s.schema !== undefined);
        if (firstWithSchema) {
          setSelectedService(firstWithSchema);
        }
      }
    } catch (err) {
      console.error('Error fetching service specs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load API documentation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <LoadingState message="Loading API Documentation..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Documentation</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchServiceSpecs}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 flex">
      {/* Sidebar with grouped data */}
      <Sidebar
        serviceSpecs={serviceSpecs}
        grouped={grouped}
        sourceLabels={sourceLabels}
        onServiceSelect={setSelectedService}
        selectedService={selectedService}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">
                {selectedService?.schema?.info.title || selectedService?.service.title || 'API Documentation'}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {selectedService?.schema?.info.description || 
                 (selectedService ? `API documentation for ${selectedService.service.title}` : 'Select a service to view its API documentation')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {selectedService?.schema && (
                <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-sm rounded-full">
                  v{selectedService.schema.info.version}
                </span>
              )}
              <button
                onClick={fetchServiceSpecs}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Refresh"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Service Info with Blueprint context */}
          {selectedService && (
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Blueprint:</span>
                <span className="text-sm text-cyan-400 font-medium">{selectedService.sourceLabel}</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Spec:</span>
                <a
                  href={selectedService.specUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:underline truncate max-w-sm"
                >
                  {selectedService.specUrl}
                </a>
              </div>
            </div>
          )}
        </header>

        {/* API Documentation Viewer */}
        <div className="flex-1 relative overflow-hidden">
          {!selectedService ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-8">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Select an API
                </h2>
                <p className="text-slate-400 max-w-md">
                  Choose an API from the sidebar to view its documentation.
                  APIs are organized by blueprint source.
                </p>
              </div>
            </div>
          ) : selectedService && !selectedService.schema ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Failed to Load Spec
                </h2>
                <p className="text-slate-400 max-w-md mb-4">
                  {selectedService.error || 'Unable to fetch the OpenAPI specification for this service.'}
                </p>
                <a
                  href={selectedService.specUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline text-sm"
                >
                  View spec URL →
                </a>
              </div>
            </div>
          ) : selectedService?.schema ? (
            <ApiDocViewer spec={selectedService.schema} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <LoadingState message="Preparing documentation..." />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
