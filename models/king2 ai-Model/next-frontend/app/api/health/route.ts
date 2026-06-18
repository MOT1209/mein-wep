import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const start = Date.now();
  const checks: Record<string, 'healthy' | 'unhealthy'> = {};

  checks.server = 'healthy';

  try {
    const { error } = await supabase.from('users').select('id', { count: 'exact', head: true });
    checks.database = error ? 'unhealthy' : 'healthy';
  } catch {
    checks.database = 'unhealthy';
  }

  const allHealthy = Object.values(checks).every((s) => s === 'healthy');

  return NextResponse.json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    latency: Date.now() - start,
    checks,
  });
}
