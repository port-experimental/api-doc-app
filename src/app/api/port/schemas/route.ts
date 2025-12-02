/**
 * API Route: /api/port/schemas
 * Fetches OpenAPI schemas from entities in Port
 * Supports multiple blueprints configured via OPENAPI_SOURCES env var
 */

import { NextResponse } from 'next/server';
import { fetchAllSources, groupSpecsBySource, type ServiceSpec } from '@/services/portService';
import { config } from '@/lib/config';

export async function GET() {
  try {
    // Fetch specs from all configured sources
    const allSpecs = await fetchAllSources();
    
    // Group by source label for organized display
    const grouped = groupSpecsBySource(allSpecs);
    
    // Calculate stats
    const available = allSpecs.filter(s => s.schema !== undefined && s.schema !== null);
    const failed = allSpecs.filter(s => s.error !== undefined && s.error !== null);
    
    return NextResponse.json({
      // Current configuration (all sources)
      config: {
        sources: config.openapi.sources,
      },
      // All specs flat list (for backwards compatibility)
      services: allSpecs,
      // Grouped by source label
      grouped,
      // Stats
      count: allSpecs.length,
      available: available.length,
      failed: failed.length,
      // Source labels for easy iteration
      sourceLabels: Object.keys(grouped),
    });
  } catch (error) {
    console.error('[API] Error fetching service specs:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to fetch service API specs',
        details: errorMessage,
        config: {
          sources: config.openapi.sources,
        },
      },
      { status: 500 }
    );
  }
}

// POST endpoint for refreshing cache
export async function POST() {
  try {
    // Force refresh by passing refresh=true
    const allSpecs = await fetchAllSources(true);
    const grouped = groupSpecsBySource(allSpecs);
    
    const available = allSpecs.filter(s => s.schema !== undefined && s.schema !== null);
    const failed = allSpecs.filter(s => s.error !== undefined && s.error !== null);
    
    return NextResponse.json({
      message: 'Cache refreshed successfully',
      config: {
        sources: config.openapi.sources,
      },
      services: allSpecs,
      grouped,
      count: allSpecs.length,
      available: available.length,
      failed: failed.length,
      sourceLabels: Object.keys(grouped),
    });
  } catch (error) {
    console.error('[API] Error refreshing specs:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to refresh specs',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
