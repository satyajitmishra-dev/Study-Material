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
  BarChart, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Calendar,
  Settings,
  Users,
  Shield,
  Database,
  MessageSquare,
  Terminal
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import ProjectSwitcher from './ProjectSwitcher';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

interface AdminSidebarProps {
  activeProject?: {
    projectId: string;
    projectName: string;
    projectSlug: string;
    organizationName: string;
  };
  userRole?: string;
  emailVerified?: Date | null;
}

export default function AdminSidebar({ activeProject, userRole, emailVerified }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const pathname = usePathname();
  const isAdmin = userRole === 'admin';

  // Desktop sidebar items
  const sidebarItems: SidebarItem[] = isAdmin ? [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users Directory', href: '/admin/users', icon: Users },
    { name: 'Content Manager', href: '/admin/projects', icon: FolderGit },
    { name: 'Moderation Reports', href: '/admin/moderation', icon: Shield },
    { name: 'Categories Tree', href: '/admin/categories', icon: Database },
    { name: 'Community Content', href: '/admin/community-mod', icon: MessageSquare },
    { name: 'Media Library', href: '/admin/media', icon: Image },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
    { name: 'Operations Panel', href: '/admin/operations', icon: Terminal },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ] : [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'My Content', href: '/admin/projects', icon: FolderGit },
    { name: 'Calendar Schedule', href: '/admin/calendar', icon: Calendar },
    { name: 'Media Library', href: '/admin/media', icon: Image },
    { name: 'My Analytics', href: '/admin/analytics', icon: BarChart },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  // Mobile bottom capsule items (capped at 5 to prevent squishing)
  const mobileItems: SidebarItem[] = isAdmin ? [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Content', href: '/admin/projects', icon: FolderGit },
    { name: 'Moderation', href: '/admin/moderation', icon: Shield },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ] : [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Content', href: '/admin/projects', icon: FolderGit },
    { name: 'Media', href: '/admin/media', icon: Image },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  // Mock active project if none provided (sandbox dev mode)
  const resolvedActiveProject = activeProject || {
    projectId: 'proj_sandbox_1',
    projectName: 'Study Materials',
    projectSlug: 'study-materials',
    organizationName: 'Sandbox Org'
  };

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="hidden md:flex relative z-30 h-[calc(100vh-2rem)] rounded-2xl bg-charcoal/30 border border-white/5 backdrop-blur-md flex-col justify-between py-6 px-3 shadow-premium transition-all select-none shrink-0"
      >
        <div className="space-y-6">
          {/* Sidebar Header with Switcher */}
          <div className="flex items-center gap-1.5 justify-between px-1 h-12">
            {!collapsed ? (
              <div className="flex-1 min-w-0">
                <ProjectSwitcher activeProject={resolvedActiveProject} />
              </div>
            ) : (
              <div 
                onClick={() => setCollapsed(false)}
                className="w-7 h-7 mx-auto rounded-lg bg-gradient-to-tr from-accent-violet to-accent-cyan flex items-center justify-center text-[11px] font-extrabold text-white cursor-pointer shadow-glow-violet/5 hover:scale-105 active:scale-95 transition-all shrink-0 font-mono"
              >
                {resolvedActiveProject.projectName.charAt(0).toUpperCase()}
              </div>
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`w-6 h-6 rounded-md hover:bg-white/5 border border-transparent hover:border-white/5 flex items-center justify-center text-stone hover:text-warm-white cursor-pointer transition-all shrink-0
                ${collapsed ? 'mx-auto' : ''}
              `}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link key={item.name} href={item.href} className="block relative">
                  <div
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium tracking-wide transition-all relative group cursor-pointer
                      ${isActive ? 'text-onyx font-bold' : 'text-stone hover:text-warm-white'}
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

      {/* Mobile Bottom Navigation Capsule (Safe Area Compliant, prevents squishing) */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-charcoal/90 border border-white/5 backdrop-blur-md rounded-2xl py-2.5 px-4 flex items-center justify-around shadow-premium pb-[calc(10px+env(safe-area-inset-bottom,0px))]">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href} className="relative p-2 rounded-xl transition-colors">
              <Icon className={`w-5 h-5 ${isActive ? 'text-accent-cyan' : 'text-stone hover:text-warm-white'}`} />
              {isActive && (
                <motion.div 
                  layoutId="activeTabMobileAdmin"
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
