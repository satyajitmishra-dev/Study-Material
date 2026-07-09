import React from 'react';
import { publicDb } from '@/lib/database/publicDb';
import { Card } from '@/components/ui/core';
import Link from 'next/link';
import { Layers, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await publicDb.getCategories();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="border-b border-white/5 pb-6">
        <span className="text-[11px] font-semibold text-accent-cyan tracking-[0.2em] uppercase font-mono">Topics Cloud</span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-warm-white mt-1">Categories Directory</h1>
        <p className="text-[13px] text-stone font-light mt-1">
          Explore structured content guides organized by technical architectures and framework pillars.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => {
          const accentMap = {
            react: 'hover:border-accent-cyan/20 border-white/5',
            css: 'hover:border-accent-pink/20 border-white/5',
            ai: 'hover:border-accent-violet/20 border-white/5',
            backend: 'hover:border-accent-orange/20 border-white/5',
          };
          const borderClass = accentMap[cat.slug as keyof typeof accentMap] || 'hover:border-white/10 border-white/5';

          return (
            <Card key={cat.id} className={`p-6 flex flex-col justify-between h-[180px] group transition-all duration-200 ${borderClass}`}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-stone group-hover:text-accent-cyan transition-colors" />
                  <h3 className="text-lg font-bold text-warm-white group-hover:text-accent-cyan transition-colors">
                    {cat.name}
                  </h3>
                </div>
                <p className="text-[12px] text-stone leading-relaxed font-light">
                  {cat.description || 'Comprehensive articles, benchmarks, and tutorials for developers.'}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 mt-auto flex items-center justify-between text-[11px] text-stone">
                <span className="font-mono text-[10px]">StudyMaterial Guides</span>
                <Link href={`/categories/${cat.slug}`} className="flex items-center gap-0.5 hover:text-warm-white group-hover:translate-x-0.5 transition-transform">
                  <span>Browse Articles</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
