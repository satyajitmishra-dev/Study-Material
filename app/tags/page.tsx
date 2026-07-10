import React from 'react';
import { publicDb } from '@/lib/database/publicDb';
import Link from 'next/link';
import { Tag } from 'lucide-react';
import { Metadata } from 'next';
import { getMetadata } from '@/lib/seo/MetadataEngine';

export async function generateMetadata(): Promise<Metadata> {
  return getMetadata({
    title: 'Tags Taxonomy Directory',
    description: 'Explore technical subtopics, frameworks, and developer tools using taxonomy tags.',
    path: '/tags'
  });
}

export const dynamic = 'force-dynamic';

export default async function TagsCloudPage() {
  const tags = await publicDb.getTags();

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="border-b border-white/5 pb-6">
        <span className="text-[11px] font-semibold text-accent-cyan tracking-[0.2em] uppercase font-mono">Taxonomy Indexes</span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-warm-white mt-1">Tags Index</h1>
        <p className="text-[13px] text-stone font-light mt-1">
          Explore focused subtopics, frameworks, and tools using taxonomy tag links.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 p-6 bg-charcoal/20 border border-white/5 rounded-2xl">
        {tags.map((tag) => (
          <Link key={tag.id} href={`/tags/${tag.slug}`}>
            <span className="px-4 py-2 bg-charcoal/40 border border-white/5 hover:border-white/12 rounded-xl text-[13px] text-stone hover:text-warm-white hover:bg-charcoal/80 transition-all cursor-pointer flex items-center gap-1.5 font-mono">
              <Tag className="w-3.5 h-3.5" />
              <span>#{tag.name}</span>
            </span>
          </Link>
        ))}

        {tags.length === 0 && (
          <div className="w-full text-center py-10 text-[12px] text-stone">
            No tags registered.
          </div>
        )}
      </div>
    </div>
  );
}
