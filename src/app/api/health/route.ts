import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Protect this endpoint - only authenticated admins
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } catch {
    // If auth check fails, deny access
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? 'SET' : 'NOT SET',
      TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? 'SET' : 'NOT SET',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET',
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
  } catch (err) {
    diagnostics.database = {
      connected: false,
      error: (err as Error).message,
    };
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
