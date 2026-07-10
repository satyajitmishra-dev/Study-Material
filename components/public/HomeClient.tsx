'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Bookmark, 
  Flame, 
  Search, 
  Mail, 
  Check, 
  ChevronRight,
  TrendingUp,
  BookmarkCheck,
  Calendar,
  Layers,
  ArrowUpRight,
  ThumbsUp,
  User,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/components/ui/core';
import { reactToPostAction, bookmarkPostAction, subscribeNewsletterDigestAction, logShareEventAction } from '@/lib/actions/public';

interface HomeClientProps {
  initialPosts: any[];
  categories: any[];
  tags: any[];
  layout: string[];
  sessionUser: any;
}

export default function HomeClient({ 
  initialPosts, 
  categories, 
  tags, 
  layout, 
  sessionUser 
}: HomeClientProps) {
  const router = useRouter();
  const [visitorId, setVisitorId] = useState('');
  
  // Newsletter Form State
  const [email, setEmail] = useState('');
  const [digestType, setDigestType] = useState<'daily' | 'weekly'>('weekly');
  const [newsletterSubbed, setNewsletterSubbed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([]);

  useEffect(() => {
    // Generate or retrieve visitor cookie
    let vid = localStorage.getItem('sm_visitor_id');
    if (!vid) {
      vid = `vis_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
      localStorage.setItem('sm_visitor_id', vid);
    }
    setVisitorId(vid);
  }, []);

  // Filter posts search autocomplete suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSuggestions([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const matches = initialPosts.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query)
    ).slice(0, 5);
    setFilteredSuggestions(matches);
  }, [searchQuery, initialPosts]);

  // Handle newsletter submit
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || subscribing) return;
    setSubscribing(true);
    const res = await subscribeNewsletterDigestAction(email, digestType);
    setSubscribing(false);
    if (res.success) {
      setNewsletterSubbed(true);
      setEmail('');
    } else {
      alert('Failed to subscribe. Please try again.');
    }
  };

  // Get featured post (first post) and remaining posts
  const featuredPost = initialPosts[0];
  const trendingPosts = initialPosts.slice(0, 3);
  const latestPosts = initialPosts.slice(1, 7);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="w-full space-y-16 pb-16">
      {/* Dynamic Render Based on CMS Setting layout */}
      {layout.map((section, idx) => {
        if (section === 'hero' && featuredPost) {
          return (
            <motion.div 
              key="hero"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative rounded-3xl overflow-hidden border border-white/5 bg-gradient-to-r from-charcoal/20 to-onyx shadow-premium p-6 md:p-12 flex flex-col md:flex-row items-center gap-8"
            >
              {/* Background gradient blur */}
              <div className="absolute inset-0 grid-background opacity-20 pointer-events-none" />
              <div className="absolute top-1/2 left-1/4 w-72 h-72 rounded-full bg-accent-cyan glow-glow -translate-y-1/2" />

              <div className="flex-1 space-y-5 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Editor's Pick</span>
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-warm-white hover:text-accent-cyan transition-colors">
                  <Link href={`/posts/${featuredPost.slug}`}>{featuredPost.title}</Link>
                </h1>
                <p className="text-[14px] text-stone leading-relaxed max-w-xl font-light">
                  {featuredPost.description}
                </p>

                <div className="flex items-center gap-3 text-stone text-[12px] pt-2">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-warm-white overflow-hidden shrink-0">
                    {featuredPost.author.avatar ? (
                      <img src={featuredPost.author.avatar} alt={featuredPost.author.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-stone" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-warm-white block">@{featuredPost.author.name}</span>
                    <span className="text-[10px] text-stone/80">Published in {featuredPost.categoryRef?.name || 'General'}</span>
                  </div>
                </div>

                  <Link 
                    href={`/posts/${featuredPost.slug}`}
                    className="relative px-4 py-2 text-[13px] font-medium tracking-wide rounded-lg flex items-center justify-center gap-2 transition-all duration-150 outline-none select-none active:scale-[0.98] bg-warm-white text-onyx hover:bg-mist border border-warm-white shadow-sm font-sans"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
              </div>

              {featuredPost.coverImage && (
                <div className="w-full md:w-2/5 aspect-[4/3] rounded-2xl overflow-hidden border border-white/5 relative group shrink-0 shadow-premium">
                  <img 
                    src={featuredPost.coverImage} 
                    alt={featuredPost.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-onyx/40 to-transparent pointer-events-none" />
                </div>
              )}
            </motion.div>
          );
        }

        if (section === 'trending' && trendingPosts.length > 0) {
          return (
            <div key="trending" className="space-y-6">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <TrendingUp className="w-5 h-5 text-accent-amber" />
                <h2 className="text-xl font-bold tracking-tight text-warm-white">Trending Content</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {trendingPosts.map((post, postIdx) => (
                  <Card key={post.id} className="flex flex-col justify-between hover:border-white/10 group h-[260px] relative overflow-hidden">
                    {post.coverImage && (
                      <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-200">
                        <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="space-y-3 relative z-10">
                      <div className="flex items-center justify-between text-[10px] font-mono text-stone">
                        <span className="text-accent-amber uppercase font-semibold">#0{postIdx + 1} Trending</span>
                        <span>5 min read</span>
                      </div>
                      <h3 className="text-[15px] font-bold text-warm-white group-hover:text-accent-amber transition-colors line-clamp-2 leading-snug">
                        <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                      </h3>
                      <p className="text-[12px] text-stone/80 line-clamp-3 leading-relaxed font-light">
                        {post.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto relative z-10 text-[11px] text-stone font-mono">
                      <span className="hover:text-warm-white">@{post.author.name}</span>
                      <Link href={`/posts/${post.slug}`} className="flex items-center gap-1 hover:text-warm-white group-hover:translate-x-0.5 transition-transform">
                        <span>Read</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        }

        if (section === 'categories') {
          return (
            <div key="categories" className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-accent-cyan" />
                  <h2 className="text-xl font-bold tracking-tight text-warm-white">Explore Categories</h2>
                </div>
                <Link href="/categories" className="text-[12px] text-stone hover:text-warm-white flex items-center gap-1">
                  <span>View All</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map(cat => {
                  const colors = {
                    react: 'hover:border-accent-cyan/30 text-accent-cyan',
                    css: 'hover:border-accent-pink/30 text-accent-pink',
                    ai: 'hover:border-accent-violet/30 text-accent-violet',
                    backend: 'hover:border-accent-orange/30 text-accent-orange',
                  };
                  const colClass = colors[cat.slug as keyof typeof colors] || 'hover:border-white/10 text-warm-white';
                  
                  return (
                    <Link key={cat.id} href={`/categories/${cat.slug}`}>
                      <Card className={`p-5 flex flex-col justify-between h-[130px] group transition-all duration-200 cursor-pointer ${colClass}`}>
                        <div>
                          <h4 className="text-[14px] font-bold text-warm-white group-hover:text-current transition-colors">
                            {cat.name}
                          </h4>
                          <p className="text-[11px] text-stone/80 line-clamp-2 mt-1 leading-relaxed font-light">
                            {cat.description}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-stone group-hover:text-warm-white transition-colors mt-auto block">
                          Browse Articles →
                        </span>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        }

        if (section === 'latest' && latestPosts.length > 0) {
          return (
            <div key="latest" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left: Latest Articles list */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <BookOpen className="w-5 h-5 text-accent-violet" />
                  <h2 className="text-xl font-bold tracking-tight text-warm-white">Latest Articles</h2>
                </div>

                <div className="space-y-4">
                  {latestPosts.map(post => (
                    <Card key={post.id} className="p-5 hover:border-white/10 group flex flex-col md:flex-row gap-6">
                      {post.coverImage && (
                        <div className="w-full md:w-1/3 aspect-[16/10] rounded-xl overflow-hidden border border-white/5 shrink-0 relative">
                          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102" />
                        </div>
                      )}
                      <div className="flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-mono text-stone">
                            <span className="text-accent-violet font-semibold uppercase">{post.categoryRef?.name || 'General'}</span>
                            <span suppressHydrationWarning>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}</span>
                          </div>
                          <h3 className="text-[16px] font-bold text-warm-white group-hover:text-accent-violet transition-colors leading-snug">
                            <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                          </h3>
                          <p className="text-[12px] text-stone leading-relaxed font-light line-clamp-2">
                            {post.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[11px] text-stone font-mono">
                          <span>By @{post.author.name}</span>
                          <span className="flex items-center gap-2">
                            <span className="flex items-center gap-0.5"><ThumbsUp className="w-3.5 h-3.5" /> {post._count?.reactions || 0}</span>
                            <span className="flex items-center gap-0.5"><Bookmark className="w-3.5 h-3.5" /> {post._count?.bookmarks || 0}</span>
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Right: Personalization / Sidebar widgets */}
              <div className="lg:col-span-4 space-y-8">
                {/* Search widget */}
                <div className="space-y-3">
                  <h4 className="text-[12px] font-semibold text-stone uppercase tracking-wider">Search Palette</h4>
                  <div className="relative bg-charcoal/20 border border-white/5 rounded-xl p-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search posts..." 
                        className="w-full bg-charcoal/30 border border-white/5 rounded-lg pl-9 pr-4 py-2 text-[12px] text-warm-white outline-none focus:border-white/10"
                      />
                    </div>
                    {/* Autocomplete suggestions */}
                    <AnimatePresence>
                      {filteredSuggestions.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute left-0 right-0 top-16 bg-onyx border border-white/10 rounded-xl p-2 z-30 shadow-premium space-y-1"
                        >
                          {filteredSuggestions.map(p => (
                            <Link key={p.id} href={`/posts/${p.slug}`} className="block">
                              <div className="p-2 rounded-lg hover:bg-white/5 cursor-pointer text-left">
                                <span className="text-[12px] font-bold text-warm-white block truncate">{p.title}</span>
                                <span className="text-[9px] text-stone font-mono block">/{p.slug}</span>
                              </div>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Tags Cloud */}
                <div className="space-y-3">
                  <h4 className="text-[12px] font-semibold text-stone uppercase tracking-wider">Trending Tags</h4>
                  <div className="flex flex-wrap gap-2 p-4 bg-charcoal/20 border border-white/5 rounded-xl">
                    {tags.map(tag => (
                      <Link key={tag.id} href={`/tags/${tag.slug}`}>
                        <span className="text-[11px] bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg text-stone hover:text-warm-white hover:border-white/10 transition-all cursor-pointer">
                          #{tag.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Continue reading widget if logged in */}
                {sessionUser && (
                  <div className="space-y-3">
                    <h4 className="text-[12px] font-semibold text-stone uppercase tracking-wider font-mono">Personalized Stream</h4>
                    <Card className="p-4 border-dashed border-white/10 bg-transparent flex flex-col justify-between h-[140px]">
                      <div>
                        <span className="text-[9px] bg-accent-cyan/10 border border-accent-cyan/20 px-2 py-0.5 rounded-full text-accent-cyan font-bold uppercase tracking-wider">Resume Reading</span>
                        <h5 className="text-[13px] font-bold text-warm-white mt-2 truncate">Introducing Partial Prerendering</h5>
                        <p className="text-[11px] text-stone mt-1">Streaks active: 3 days reading streak!</p>
                      </div>
                      <Link href="/posts/introducing-partial-prerendering" className="text-[11px] text-accent-cyan hover:underline flex items-center gap-1 mt-3">
                        <span>Continue Reading</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          );
        }

        if (section === 'newsletter') {
          return (
            <div key="newsletter" className="relative rounded-3xl overflow-hidden border border-white/5 bg-charcoal/10 p-8 md:p-12 text-center shadow-premium">
              <div className="absolute inset-0 grid-background opacity-10 pointer-events-none" />
              <div className="max-w-md mx-auto space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-accent-violet">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight text-warm-white">Subscribe to Tech Digests</h3>
                <p className="text-[12px] text-stone leading-relaxed font-light">
                  Get high-fidelity technical articles, compiler breakdowns, and design guides delivered directly to your inbox.
                </p>

                {newsletterSubbed ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-3 bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-[12px] font-bold rounded-xl flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Subscribed successfully to {digestType} digests!</span>
                  </motion.div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="space-y-3 pt-2">
                    <div className="flex gap-2">
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email address..."
                        className="flex-1 bg-charcoal/30 border border-white/5 rounded-lg px-3 py-2 text-[12px] text-warm-white outline-none focus:border-white/10 placeholder:text-stone/50"
                        suppressHydrationWarning
                      />
                      <select 
                        value={digestType}
                        onChange={(e) => setDigestType(e.target.value as any)}
                        className="bg-charcoal/40 border border-white/5 rounded-lg px-2 text-[12px] text-stone outline-none cursor-pointer"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="daily">Daily</option>
                      </select>
                    </div>
                    <Button type="submit" variant="primary" className="w-full justify-center text-[12px]">
                      {subscribing ? 'Subscribing...' : 'Subscribe'}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          );
        }

        return null;
      })}

      {/* Structured sitemap footer */}
      <footer className="border-t border-white/5 pt-12 mt-16 text-[12px] text-stone">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8">
          <div className="space-y-3">
            <span className="font-semibold text-warm-white block font-mono">StudyMaterial</span>
            <p className="text-[11px] leading-relaxed font-light">
              An immersive desktop-grade technical publication platform engineered for modern web developers.
            </p>
          </div>
          <div className="space-y-3">
            <span className="font-semibold text-warm-white block font-mono">Platform</span>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/posts" className="hover:text-warm-white">All Articles</Link></li>
              <li><Link href="/categories" className="hover:text-warm-white">Categories</Link></li>
              <li><Link href="/tags" className="hover:text-warm-white">Trending Tags</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <span className="font-semibold text-warm-white block font-mono">Personal Space</span>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/saved" className="hover:text-warm-white">Saved Collections</Link></li>
              <li><Link href="/profile" className="hover:text-warm-white">Streaks Dashboard</Link></li>
              <li><Link href="/history" className="hover:text-warm-white">History Stream</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <span className="font-semibold text-warm-white block font-mono">CMS Studio</span>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/admin" className="hover:text-warm-white">Dashboard</Link></li>
              <li><Link href="/admin/projects" className="hover:text-warm-white">Content Manager</Link></li>
              <li><Link href="/admin/engagement" className="hover:text-warm-white flex items-center gap-1"><span>Moderation Hub</span><ExternalLink className="w-3 h-3" /></Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 py-6 text-center text-[10px] text-stone/60">
          © {new Date().getFullYear()} StudyMaterial. Built on Next.js 16 & Prisma Postgres. Complies with speakable sitemaps.
        </div>
      </footer>
    </div>
  );
}
