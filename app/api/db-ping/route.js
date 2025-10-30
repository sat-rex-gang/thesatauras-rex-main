import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const start = Date.now();
  try {
    // Minimal roundtrip to validate connectivity
    const res = await prisma.$queryRaw`SELECT 1 as ok`;
    const ms = Date.now() - start;
    return NextResponse.json({
      ok: true,
      result: res,
      latencyMs: ms,
      note: 'Database connectivity OK'
    });
  } catch (error) {
    const ms = Date.now() - start;
    // Surface useful diagnostics without leaking secrets
    return NextResponse.json({
      ok: false,
      error: error.message,
      name: error.name,
      code: error.code,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
      latencyMs: ms,
    }, { status: 500 });
  }
}


