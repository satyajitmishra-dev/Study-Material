'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Home, 
  Search, 
  Plus, 
  Users, 
  FolderOpen, 
  User,
  Compass
} from 'lucide-react';

interface DockItemProps {
  mouseX: MotionValue;
  title: string;
  icon: React.ComponentType<any>;
  href: string;
  onClick?: () => void;
}

function DockItem({ mouseX, title, icon: Icon, href, onClick }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && href !== '#' && pathname?.startsWith(href));

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [44, 70, 44]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [44, 70, 44]);

  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  
  const height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const Content = (
    <motion.div
      ref={ref}
      style={{ width, height }}
      className={`relative rounded-xl flex items-center justify-center border transition-colors duration-150 group magnetic-item cursor-pointer
        ${isActive 
          ? 'bg-warm-white text-onyx border-warm-white shadow-glow' 
          : 'bg-charcoal/40 text-stone border-white/5 hover:bg-charcoal/80 hover:text-warm-white hover:border-white/10'
        }
      `}
    >
      <Icon className="w-5 h-5" />
      
      {/* Tooltip */}
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded bg-onyx border border-white/10 text-[11px] font-medium tracking-wide text-stone opacity-0 pointer-events-none transition-opacity duration-150 group-hover:opacity-100 whitespace-nowrap shadow-premium">
        {title}
      </span>
    </motion.div>
  );

  if (onClick) {
    return (
      <div onClick={onClick} className="inline-block">
        {Content}
      </div>
    );
  }

  return (
    <Link href={href} className="inline-block">
      {Content}
    </Link>
  );
}

interface FloatingDockProps {
  onSearchClick: () => void;
  onCreateClick: () => void;
}

export default function FloatingDock({ onSearchClick, onCreateClick }: FloatingDockProps) {
  const mouseX = useMotionValue(Infinity);

  const workspaces = [
    { title: 'Home Dashboard', icon: Home, href: '/' },
    { title: 'Explore & Search', icon: Compass, href: '/search' },
    { title: 'Create Menu', icon: Plus, href: '#', onClick: onCreateClick },
    { title: 'Community Hub', icon: Users, href: '/community' },
    { title: 'Workspace (Second Brain)', icon: FolderOpen, href: '/workspace' },
    { title: 'Profile & Settings', icon: User, href: '/profile' }
  ];

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-0 md:right-0 flex justify-center z-40 pointer-events-none">
      {/* Desktop Floating Dock */}
      <motion.div
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 120 }}
        className="hidden md:flex items-end gap-3 px-4 py-3 rounded-2xl bg-onyx/75 border border-white/10 backdrop-blur-md shadow-premium pointer-events-auto"
      >
        {workspaces.map((item, idx) => (
          <div key={idx} className="flex items-end">
            <DockItem
              mouseX={mouseX}
              title={item.title}
              icon={item.icon}
              href={item.href}
              onClick={item.onClick}
            />
            {idx === 2 && <div className="w-[1px] h-8 bg-white/10 mx-1 self-center rounded" />}
          </div>
        ))}
      </motion.div>

      {/* Mobile Bottom Navigation Bar (Safe Area Compliant) */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 120 }}
        className="flex md:hidden items-center justify-around w-full max-w-md px-2 py-3 rounded-2xl bg-onyx/90 border border-white/10 backdrop-blur-md shadow-premium pointer-events-auto pb-[calc(12px+env(safe-area-inset-bottom,0px))]"
      >
        {workspaces.map((item, idx) => {
          const Icon = item.icon;
          const isButton = !!item.onClick;
          const Content = (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-charcoal/20 border border-white/5 text-stone active:bg-charcoal/50 active:text-warm-white transition-all cursor-pointer">
              <Icon className="w-5 h-5" />
            </div>
          );

          return (
            <div key={idx} className="flex items-center">
              {isButton ? (
                <div onClick={item.onClick}>{Content}</div>
              ) : (
                <Link href={item.href}>{Content}</Link>
              )}
              {idx === 2 && <div className="w-[1px] h-6 bg-white/10 mx-1.5 self-center rounded" />}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
