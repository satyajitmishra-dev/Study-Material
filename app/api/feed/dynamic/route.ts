import { NextRequest, NextResponse } from 'next/server';
import { publicDb } from '@/lib/database/publicDb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const type = searchParams.get('type') || 'all';
  const technology = searchParams.get('technology') || undefined;
  const difficulty = searchParams.get('difficulty') || undefined;
  const sortBy = (searchParams.get('sortBy') as any) || 'latest';
  const limit = parseInt(searchParams.get('limit') || '15');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const data = await publicDb.getUniversalFeed({
      type,
      technology,
      difficulty,
      sortBy,
      limit,
      offset
    });
    return NextResponse.json({ success: true, ...data });
  } catch (err: any) {
    console.error('Error fetching dynamic feed:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
