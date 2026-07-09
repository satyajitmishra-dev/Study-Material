import React from 'react';
import { notFound } from 'next/navigation';
import { publicDb } from '@/lib/database/publicDb';
import { Card } from '@/components/ui/core';
import Link from 'next/link';
import { Tag, ChevronRight, Eye, ThumbsUp } from 'lucide-react';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function TagDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const tag = await publicDb.getTagBySlug(slug);
  if (!tag) {
    notFound();
  }

  // Fetch posts linked to tag
  const { items: posts } = await publicDb.getPublicPosts({ tagSlug: slug });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Tag Header */}
      <div className="border-b border-white/5 pb-6">
        <span className="text-[11px] font-semibold text-accent-cyan tracking-[0.2em] uppercase font-mono">Taxonomy Archives</span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-warm-white mt-1 flex items-center gap-2">
          <Tag className="w-8 h-8 text-accent-cyan" />
          <span>#{tag.name}</span>
        </h1>
        <p className="text-[13px] text-stone font-light mt-1.5 leading-relaxed max-w-xl">
          {tag.description || 'Collection of technical articles and guides tagged under this specific topic.'}
        </p>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="p-5 hover:border-white/10 group flex flex-col md:flex-row gap-6">
            {post.coverImage && (
              <div className="w-full md:w-44 aspect-[16/10] rounded-xl overflow-hidden border border-white/5 shrink-0">
                <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-stone">
                  <span className="text-accent-cyan uppercase font-semibold">#{tag.name}</span>
                  <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-[15px] font-bold text-warm-white group-hover:text-accent-cyan transition-colors leading-snug">
                  <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="text-[12px] text-stone leading-relaxed font-light line-clamp-2">
                  {post.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px] text-stone font-mono">
                <span>By @{post.author.name}</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-0.5"><Eye className="w-3.5 h-3.5" /> {post.views}</span>
                  <span className="flex items-center gap-0.5"><ThumbsUp className="w-3.5 h-3.5" /> {post._count?.reactions || 0}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {posts.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl">
            <Tag className="w-12 h-12 text-stone/40 animate-pulse" />
            <h4 className="text-[13px] font-bold text-warm-white mt-3">No articles under tag</h4>
            <p className="text-[11px] text-stone mt-1">Check back later for newly tagged guides.</p>
          </div>
        )}
      </div>
    </div>
  );
}
