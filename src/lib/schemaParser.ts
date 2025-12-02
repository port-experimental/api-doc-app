/**
 * Schema Parser Utilities
 * Parse and organize OpenAPI schemas for display
 */

import type { OpenAPISchema, ApiEndpoint, OrganizedApis } from '@/services/portService';

export interface ApiCategory {
  name: string;
  description?: string;
  endpoints: ApiEndpoint[];
  count: number;
}

export interface ParsedSchema {
  title: string;
  version: string;
  description?: string;
  categories: ApiCategory[];
  totalEndpoints: number;
}

/**
 * Parse an OpenAPI schema into a structured format for navigation
 */
export function parseSchemaForNavigation(
  schema: OpenAPISchema,
  organized: OrganizedApis
): ParsedSchema {
  const categories: ApiCategory[] = [];

  // Create categories from kinds
  for (const [kind, endpoints] of Object.entries(organized.byKind)) {
    categories.push({
      name: kind,
      description: getCategoryDescription(kind),
      endpoints,
      count: endpoints.length,
    });
  }

  // Sort categories by name
  categories.sort((a, b) => a.name.localeCompare(b.name));

  return {
    title: schema.info.title,
    version: schema.info.version,
    description: schema.info.description,
    categories,
    totalEndpoints: organized.all.length,
  };
}

/**
 * Get a description for a category based on its name
 */
function getCategoryDescription(kind: string): string {
  const descriptions: Record<string, string> = {
    'Authentication': 'Token management and authentication endpoints',
    'Blueprints': 'Define and manage blueprint schemas',
    'Entities': 'Create, read, update, and delete entities',
    'Scorecards': 'Measure and track quality metrics',
    'Self-Service Actions': 'Define and trigger automated actions',
    'Integrations': 'Connect external tools and services',
    'Webhooks': 'Configure event notifications',
    'Search': 'Search across entities and resources',
    'Audit Log': 'Track changes and access audit history',
    'Other': 'Additional API endpoints',
  };

  return descriptions[kind] || `${kind} API endpoints`;
}

/**
 * Get method color/style class
 */
export function getMethodColor(method: string): string {
  const colors: Record<string, string> = {
    GET: 'bg-emerald-500',
    POST: 'bg-blue-500',
    PUT: 'bg-amber-500',
    PATCH: 'bg-orange-500',
    DELETE: 'bg-red-500',
  };

  return colors[method.toUpperCase()] || 'bg-gray-500';
}

/**
 * Format endpoint path for display
 */
export function formatPath(path: string): string {
  // Highlight path parameters
  return path.replace(/{([^}]+)}/g, '<span class="text-blue-400">{$1}</span>');
}

/**
 * Group endpoints by their base path
 */
export function groupByBasePath(endpoints: ApiEndpoint[]): Record<string, ApiEndpoint[]> {
  const grouped: Record<string, ApiEndpoint[]> = {};

  for (const endpoint of endpoints) {
    // Extract base path (first two segments)
    const segments = endpoint.path.split('/').filter(Boolean);
    const basePath = '/' + segments.slice(0, 2).join('/');

    if (!grouped[basePath]) {
      grouped[basePath] = [];
    }
    grouped[basePath].push(endpoint);
  }

  return grouped;
}

/**
 * Search endpoints by query string
 */
export function searchEndpoints(
  endpoints: ApiEndpoint[],
  query: string
): ApiEndpoint[] {
  if (!query.trim()) {
    return endpoints;
  }

  const lowerQuery = query.toLowerCase();

  return endpoints.filter((endpoint) => {
    return (
      endpoint.path.toLowerCase().includes(lowerQuery) ||
      endpoint.summary?.toLowerCase().includes(lowerQuery) ||
      endpoint.description?.toLowerCase().includes(lowerQuery) ||
      endpoint.operationId?.toLowerCase().includes(lowerQuery) ||
      endpoint.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  });
}

/**
 * Sort endpoints by path and method
 */
export function sortEndpoints(endpoints: ApiEndpoint[]): ApiEndpoint[] {
  const methodOrder = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  return [...endpoints].sort((a, b) => {
    // First sort by path
    const pathCompare = a.path.localeCompare(b.path);
    if (pathCompare !== 0) return pathCompare;

    // Then by method order
    return methodOrder.indexOf(a.method) - methodOrder.indexOf(b.method);
  });
}

/**
 * Get summary statistics for a set of endpoints
 */
export function getEndpointStats(endpoints: ApiEndpoint[]): {
  total: number;
  byMethod: Record<string, number>;
  byKind: Record<string, number>;
} {
  const byMethod: Record<string, number> = {};
  const byKind: Record<string, number> = {};

  for (const endpoint of endpoints) {
    byMethod[endpoint.method] = (byMethod[endpoint.method] || 0) + 1;
    byKind[endpoint.kind] = (byKind[endpoint.kind] || 0) + 1;
  }

  return {
    total: endpoints.length,
    byMethod,
    byKind,
  };
}

