import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? 'SET (' + process.env.TURSO_DATABASE_URL.substring(0, 30) + '...)' : 'NOT SET',
      TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? 'SET (' + process.env.TURSO_AUTH_TOKEN.substring(0, 20) + '...)' : 'NOT SET',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
    },
  };

  try {
    // Try dynamic import to check adapter availability
    const libsqlModule = await import('@prisma/adapter-libsql');
    diagnostics.adapterExports = Object.keys(libsqlModule);
    diagnostics.adapterAvailable = !!(libsqlModule.PrismaLibSql || libsqlModule.PrismaLibSQL);
    diagnostics.adapterName = libsqlModule.PrismaLibSql ? 'PrismaLibSql' : (libsqlModule.PrismaLibSQL ? 'PrismaLibSQL' : 'NOT FOUND');
  } catch (err) {
    diagnostics.adapterError = (err as Error).message;
  }

  try {
    const { db } = await import('@/lib/db');
    const categoryCount = await db.category.count();
    const productCount = await db.product.count();
    const userCount = await db.user.count();
    diagnostics.database = {
      connected: true,
      categoryCount,
      productCount,
      userCount,
    };
  } catch (err) {
    diagnostics.database = {
      connected: false,
      error: (err as Error).message,
    };
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
