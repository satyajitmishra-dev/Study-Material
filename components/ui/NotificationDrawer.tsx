'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, MessageSquare, UserPlus, Sparkles, Trash2, GitFork } from 'lucide-react';
import { Button } from '@/components/ui/core';

export interface NotificationItem {
  id: string;
  type: 'comment' | 'follow' | 'release' | 'mention';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
}) => {
  const [filter, setFilter] = useState<'all' | 'comment' | 'follow' | 'release'>('all');

  const filtered = notifications.filter(n => filter === 'all' || n.type === filter);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'comment': return <MessageSquare className="w-4 h-4 text-accent-cyan" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-accent-violet" />;
      case 'release': return <Sparkles className="w-4 h-4 text-accent-amber" />;
      default: return <Bell className="w-4 h-4 text-stone" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ x: 380 }}
          animate={{ x: 0 }}
          exit={{ x: 380 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm h-full bg-onyx border-l border-white/10 flex flex-col shadow-premium text-warm-white"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-accent-cyan/15 text-accent-cyan relative">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent-cyan rounded-full" />
                )}
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-warm-white">Notifications</h3>
                <p className="text-[11px] text-stone">{unreadCount} unread activity updates</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone hover:text-warm-white hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Bar */}
          <div className="px-4 py-2 border-b border-white/5 flex gap-1.5 overflow-x-auto">
            {(['all', 'comment', 'follow', 'release'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-all shrink-0 ${
                  filter === f
                    ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30'
                    : 'bg-charcoal/30 text-stone hover:text-warm-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {filtered.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Bell className="w-8 h-8 text-stone/30 mx-auto" />
                <p className="text-[12.5px] text-stone">No notifications in this view.</p>
              </div>
            ) : (
              filtered.map(item => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all ${
                    !item.read
                      ? 'bg-charcoal/60 border-accent-cyan/30'
                      : 'bg-charcoal/20 border-white/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white/5 shrink-0">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-bold text-warm-white truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-stone shrink-0 font-mono">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-stone leading-relaxed mt-1 line-clamp-2">
                        {item.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-3 border-t border-white/10 flex items-center justify-between gap-2 bg-charcoal/30">
            <Button
              variant="ghost"
              onClick={onMarkAllRead}
              className="text-[11px] py-1.5 px-3 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-accent-cyan" />
              Mark All Read
            </Button>
            <Button
              variant="secondary"
              onClick={onClearAll}
              className="text-[11px] py-1.5 px-3 flex items-center gap-1.5 text-stone hover:text-accent-red"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
