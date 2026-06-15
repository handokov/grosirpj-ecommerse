import { NextResponse } from 'next/server';
import { requireAdmin, isAdminError } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Protect this endpoint - admin only
  const session = await requireAdmin();
  if (isAdminError(session)) return session;

  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? 'SET' : 'NOT SET',
      TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? 'SET' : 'NOT SET',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
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
