'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  MessageSquare, 
  ThumbsUp, 
  Sparkles, 
  ShieldAlert, 
  Info, 
  CheckCircle,
  X,
  Play
} from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'reply' | 'publish' | 'ai_generation' | 'automation' | 'security' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Seed default notifications
  useEffect(() => {
    setNotifications([
      { id: 'n1', type: 'like', title: 'New Post Reaction', message: 'Satyajit Mishra liked your post "Introducing Partial Prerendering".', time: '10m ago', isRead: false },
      { id: 'n2', type: 'comment', title: 'Content Comment Received', message: 'Alex Carter added a comment on "Mastering Framer Motion springs".', time: '30m ago', isRead: false },
      { id: 'n3', type: 'ai_generation', title: 'AI Automation Ready', message: 'LinkedIn automation draft generated successfully with 95% confidence score.', time: '1h ago', isRead: true },
      { id: 'n4', type: 'security', title: 'Security Session Alert', message: 'New device session authenticated from Chrome on Windows (Delhi, IN).', time: '2h ago', isRead: false },
      { id: 'n5', type: 'system', title: 'System Build Completed', message: 'Edge production build deployed successfully. Next.js 16 resolved.', time: '5h ago', isRead: true }
    ]);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Simulate a live notification trigger
  const handleSimulateNotification = () => {
    const simulationTemplates: Omit<NotificationItem, 'id' | 'time' | 'isRead'>[] = [
      { type: 'like', title: 'New Post Reaction', message: 'User reaction recorded: 👍 GREAT on "Introducing Partial Prerendering".' },
      { type: 'reply', title: 'New Comment Reply', message: 'Author replied: "PPR stream holes resolved in suspense fallback."' },
      { type: 'publish', title: 'Scheduled Publish Executed', message: 'Post "Introducing Partial Prerendering" was auto-published to Production.' },
      { type: 'automation', title: 'Webhook Trigger Executed', message: 'GitHub push webhook processed. Lint and build verified.' },
      { type: 'security', title: 'Security Credentials Change', message: 'API key "Dev SDK Token" was modified by administrator account.' }
    ];

    const randomTemplate = simulationTemplates[Math.floor(Math.random() * simulationTemplates.length)];
    const mockNew: NotificationItem = {
      ...randomTemplate,
      id: `n_${Date.now()}`,
      time: 'Just now',
      isRead: false
    };

    setNotifications(prev => [mockNew, ...prev]);
  };

  const iconMap = {
    like: <ThumbsUp className="w-3.5 h-3.5 text-accent-amber" />,
    comment: <MessageSquare className="w-3.5 h-3.5 text-accent-cyan" />,
    reply: <MessageSquare className="w-3.5 h-3.5 text-accent-cyan" />,
    publish: <CheckCircle className="w-3.5 h-3.5 text-accent-emerald" />,
    ai_generation: <Sparkles className="w-3.5 h-3.5 text-accent-violet" />,
    automation: <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />,
    security: <ShieldAlert className="w-3.5 h-3.5 text-accent-pink" />,
    system: <Info className="w-3.5 h-3.5 text-stone/85" />
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Capsule */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-charcoal/40 hover:bg-charcoal/70 border border-white/5 hover:border-white/10 text-stone hover:text-warm-white transition-all cursor-pointer select-none active:scale-[0.98]"
        aria-label="Notification Hub"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent-pink text-[9px] font-extrabold text-white flex items-center justify-center font-mono border border-onyx select-none animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-80 p-1.5 rounded-xl bg-onyx-dark/95 border border-white/10 backdrop-blur-xl shadow-premium z-50 overflow-hidden"
          >
            {/* Header controls */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2 px-3 pt-2">
              <span className="text-[12.5px] font-bold text-warm-white">Notifications</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleSimulateNotification}
                  className="text-[9.5px] font-mono text-accent-cyan hover:text-white flex items-center gap-1 bg-accent-cyan/5 border border-accent-cyan/15 hover:border-accent-cyan/25 px-1.5 py-0.5 rounded cursor-pointer transition-all"
                  title="Simulate Event"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>Simulate</span>
                </button>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-stone hover:text-warm-white font-medium cursor-pointer transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Notification items list */}
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar divide-y divide-white/5 pr-0.5">
              {notifications.map(item => (
                <div 
                  key={item.id}
                  onClick={() => handleToggleRead(item.id)}
                  className={`p-3 text-[12px] flex gap-3 relative cursor-pointer hover:bg-white/[0.01] transition-colors group
                    ${item.isRead ? 'opacity-60' : ''}`}
                >
                  {/* Left Icon Capsule */}
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                    {iconMap[item.type] || <Info className="w-3.5 h-3.5 text-stone" />}
                  </div>

                  {/* Message Detail */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex justify-between items-center gap-2">
                      <span className={`font-bold truncate ${item.isRead ? 'text-stone' : 'text-warm-white'}`}>
                        {item.title}
                      </span>
                      <span className="text-[9px] font-mono text-stone/40 shrink-0">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-stone/75 leading-relaxed font-light line-clamp-2 pr-4 text-[11px]">
                      {item.message}
                    </p>
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button 
                      onClick={(e) => handleDismiss(item.id, e)}
                      className="p-0.5 rounded hover:bg-white/5 text-stone/40 hover:text-accent-pink transition-colors cursor-pointer"
                      title="Dismiss"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Unread circle dot */}
                  {!item.isRead && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-accent-cyan" />
                  )}
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="py-12 text-center text-stone/50 flex flex-col items-center justify-center gap-1">
                  <Bell className="w-6 h-6 text-stone/30" />
                  <span className="text-[12px]">Notification log is empty.</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
