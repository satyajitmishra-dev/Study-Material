'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FolderGit, 
  Image, 
  Search, 
  Globe, 
  BarChart, 
  Activity, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Sparkles,
  Calendar
} from 'lucide-react';
import { signOut } from 'next-auth/react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Projects', href: '/admin/projects', icon: FolderGit },
  { name: 'Calendar', href: '/admin/calendar', icon: Calendar },
  { name: 'Media Library', href: '/admin/media', icon: Image },
  { name: 'SEO Studio', href: '/admin/seo', icon: Globe },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
  { name: 'System Health', href: '/admin/system', icon: Activity },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = React.useState(false);
  const pathname = usePathname();

  return (
    <>
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="hidden md:flex relative z-30 h-[calc(100vh-2rem)] rounded-2xl bg-charcoal/30 border border-white/5 backdrop-blur-md flex-col justify-between py-6 px-3 shadow-premium transition-all select-none shrink-0"
    >
      <div className="space-y-6">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-3 h-8">
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-5 h-5 rounded bg-accent-violet flex items-center justify-center text-[10px] font-extrabold text-white">
                C
              </div>
              <span className="text-[14px] font-bold text-warm-white tracking-tight">Studio CMS</span>
            </motion.div>
          )}

          {collapsed && (
            <div className="w-6 h-6 mx-auto rounded bg-accent-violet flex items-center justify-center text-[10px] font-extrabold text-white">
              C
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-6 h-6 rounded-md hover:bg-white/5 border border-transparent hover:border-white/5 flex items-center justify-center text-stone hover:text-warm-white cursor-pointer transition-all"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link key={item.name} href={item.href} className="block relative">
                <div
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium tracking-wide transition-all relative group cursor-pointer
                    ${isActive ? 'text-onyx' : 'text-stone hover:text-warm-white'}
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-sidebar-pill"
                      transition={{ type: 'spring', damping: 25, stiffness: 260 }}
                      className="absolute inset-0 bg-warm-white rounded-lg -z-10"
                    />
                  )}

                  <Icon className="w-4 h-4 shrink-0" />
                  
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      {item.name}
                    </motion.span>
                  )}

                  {collapsed && (
                    <span className="absolute left-16 px-2 py-1 rounded bg-onyx border border-white/10 text-[10px] text-stone opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-premium">
                      {item.name}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="space-y-2">
        <button
          onClick={() => {
            const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'k' });
            window.dispatchEvent(event);
          }}
          className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-mono text-stone hover:text-warm-white hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          {!collapsed && <span>Cmd + K</span>}
        </button>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium text-stone hover:text-accent-red hover:bg-accent-red/5 transition-all group cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </motion.aside>

    {/* Mobile Bottom Navigation Capsule */}
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-charcoal/90 border border-white/5 backdrop-blur-md rounded-2xl py-2.5 px-4 flex items-center justify-around shadow-premium">
      {SIDEBAR_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link key={item.name} href={item.href} className="relative p-2 rounded-xl transition-colors">
            <Icon className={`w-5 h-5 ${isActive ? 'text-accent-cyan' : 'text-stone hover:text-warm-white'}`} />
            {isActive && (
              <motion.div 
                layoutId="activeTabMobile"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent-cyan" 
              />
            )}
          </Link>
        );
      })}
    </div>
    </>
  );
}
