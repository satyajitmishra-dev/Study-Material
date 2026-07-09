'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, 
  Settings, 
  Bookmark, 
  Terminal, 
  User, 
  ShieldAlert 
} from 'lucide-react';

interface UserDropdownProps {
  sessionUser: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    avatar?: string | null;
    role: 'admin' | 'user';
    status: 'active' | 'disabled';
  };
}

export default function UserDropdown({ sessionUser }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const isAdmin = sessionUser.role === 'admin';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full border border-white/10 hover:border-white/20 overflow-hidden cursor-pointer transition-all duration-150 magnetic-item focus:outline-none"
      >
        <img
          src={sessionUser.avatar || sessionUser.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
          alt={sessionUser.name || 'User Profile'}
          className="w-full h-full object-cover"
        />
      </button>

      {/* Dropdown Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-2.5 w-[220px] bg-charcoal/90 border border-white/10 rounded-xl shadow-premium overflow-hidden backdrop-blur-xl z-50 flex flex-col p-1.5 space-y-1"
          >
            {/* User Meta Information header */}
            <div className="px-3 py-2.5 bg-white/5 rounded-lg mb-1 flex flex-col space-y-1 select-none">
              <span className="text-[12px] font-bold text-warm-white truncate leading-tight">
                {sessionUser.name || 'Developer'}
              </span>
              <span className="text-[10px] text-stone truncate leading-tight">
                {sessionUser.email}
              </span>
              <span className={`w-fit mt-1 text-[8px] font-mono border px-1 rounded uppercase tracking-wider font-semibold
                ${isAdmin 
                  ? 'bg-accent-cyan/15 border-accent-cyan/20 text-accent-cyan' 
                  : 'bg-white/5 border-white/10 text-stone'
                }
              `}>
                {sessionUser.role}
              </span>
            </div>

            {/* Admin Dashboard redirect Link */}
            {isAdmin && (
              <button
                onClick={() => { router.push('/admin'); setIsOpen(false); }}
                className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-stone hover:text-warm-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-left focus:outline-none"
              >
                <Terminal className="w-4 h-4 text-accent-cyan" />
                <span>Publishing Studio</span>
              </button>
            )}

            {/* Profile Action Link */}
            <button
              onClick={() => { alert('Profile configuration is under active development.'); setIsOpen(false); }}
              className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-stone hover:text-warm-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-left focus:outline-none"
            >
              <User className="w-4 h-4" />
              <span>Workspace Profile</span>
            </button>

            {/* Bookmarks Action Link */}
            <button
              onClick={() => { router.push('/projects'); setIsOpen(false); }}
              className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-stone hover:text-warm-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-left focus:outline-none"
            >
              <Bookmark className="w-4 h-4" />
              <span>Bookmarks & Likes</span>
            </button>

            {/* Settings Action Link */}
            <button
              onClick={() => { alert('Settings configurations are under development.'); setIsOpen(false); }}
              className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-stone hover:text-warm-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-left focus:outline-none"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <div className="h-[1px] bg-white/5 my-1" />

            {/* Logout Action Link */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-accent-pink hover:bg-accent-pink/5 hover:text-accent-pink rounded-lg transition-colors cursor-pointer text-left focus:outline-none"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Session</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
