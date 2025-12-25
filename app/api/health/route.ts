import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Next.js API is running',
    },
  });
}
