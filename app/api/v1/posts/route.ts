import { NextResponse } from 'next/server';
import { publicDb } from '@/lib/database/publicDb';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const categorySlug = searchParams.get('category') || undefined;
    const tagSlug = searchParams.get('tag') || undefined;
    const authorId = searchParams.get('authorId') || undefined;
    const sortBy = (searchParams.get('sortBy') as any) || 'publishedAt';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const data = await publicDb.getPublicPosts({
      search,
      categorySlug,
      tagSlug,
      authorId,
      sortBy,
      limit,
      offset
    });

    return NextResponse.json({
      success: true,
      data: data.items,
      total: data.total,
      limit,
      offset
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
