// ===== Shared API utility functions =====
// Common patterns used across admin API routes.

import { NextResponse } from 'next/server'

/**
 * Returns a standardized error JSON response.
 */
export function apiError(message: string, status: number = 500): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Calculates pagination offsets and total page count.
 */
export function paginate(
  page: number,
  limit: number,
  total: number
): { skip: number; take: number; totalPages: number } {
  return {
    skip: (page - 1) * limit,
    take: limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Returns a standard paginated response shape.
 */
export function paginatedResponse(
  data: unknown[],
  total: number,
  page: number,
  totalPages: number
): NextResponse {
  return NextResponse.json({
    data,
    total,
    page,
    totalPages,
  })
}
