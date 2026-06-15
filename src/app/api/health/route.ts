import { NextResponse } from 'next/server';
import { requireAdmin, isAdminError } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Protect this endpoint - admin only
  const session = await requireAdmin();
  if (isAdminError(session)) return session;

  // Minimal diagnostics — don't expose env var names
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      configured: !!(process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL),
      nodeEnv: process.env.NODE_ENV,
    },
  };

  try {
    const { db } = await import('@/lib/db');
    const categoryCount = await db.category.count();
    const productCount = await db.product.count();
    diagnostics.database = {
      connected: true,
      categoryCount,
      productCount,
    };
  } catch {
    diagnostics.database = {
      connected: false,
    };
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
