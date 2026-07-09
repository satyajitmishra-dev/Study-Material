import React from 'react';
import { notFound } from 'next/navigation';
import { publicDb } from '@/lib/database/publicDb';
import { Card } from '@/components/ui/core';
import Link from 'next/link';
import { User, Eye, ThumbsUp, ChevronRight, Globe, Github, Twitter, Linkedin } from 'lucide-react';

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function AuthorProfilePage({ params }: PageProps) {
  const { username } = await params;

  // Fetch author posts (mock search by username in sandbox: matches admin or user)
  const isSandboxAdmin = username.toLowerCase() === 'admin' || username.toLowerCase() === 'sandbox-admin-id';
  const authorId = isSandboxAdmin ? 'sandbox-admin-id' : 'sandbox-user-id';

  // Fetch posts written by author
  const { items: posts } = await publicDb.getPublicPosts({ authorId });
  if (posts.length === 0 && !isSandboxAdmin) {
    notFound();
  }

  // Get author profile metadata
  const authorName = isSandboxAdmin ? 'Sandbox Administrator' : 'Sandbox Developer';
  const authorBio = isSandboxAdmin 
    ? 'Principal Software Engineer & Technical Author. Specialize in Next.js, database caching, and CSS micro-animations.'
    : 'Full-stack Developer. Exploring modern frontend engines, compilation tricks, and Tailwind styling scales.';
  const authorAvatar = isSandboxAdmin
    ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
    : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 space-y-10">
      
      {/* Author Card Block */}
      <Card className="p-8 border-white/5 bg-gradient-to-r from-charcoal/20 to-onyx flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute inset-0 grid-background opacity-10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-44 h-44 rounded-full bg-accent-violet glow-glow" />

        <div className="w-24 h-24 rounded-full overflow-hidden border border-white/10 shrink-0 shadow-premium relative">
          <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 space-y-3 relative z-10 text-center md:text-left">
          <div>
            <h1 className="text-2xl font-extrabold text-warm-white">@{username}</h1>
            <span className="text-[12px] text-stone font-mono block mt-0.5">{authorName}</span>
          </div>
          <p className="text-[13px] text-stone leading-relaxed font-light max-w-xl">
            {authorBio}
          </p>

          {/* Social Links */}
          <div className="flex items-center justify-center md:justify-start gap-4 pt-1.5 text-stone">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-warm-white">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-warm-white">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-warm-white">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </Card>

      {/* Author articles feed */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-warm-white border-b border-white/5 pb-3">
          Articles by @{username}
        </h2>

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
                    <span className="text-accent-cyan uppercase font-semibold">{post.categoryRef?.name || 'React'}</span>
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
                  <span>By @{username}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-0.5"><Eye className="w-3.5 h-3.5" /> {post.views}</span>
                    <span className="flex items-center gap-0.5"><ThumbsUp className="w-3.5 h-3.5" /> {post._count?.reactions || 0}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {posts.length === 0 && (
            <div className="py-12 text-center text-[12px] text-stone">
              No published articles.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
