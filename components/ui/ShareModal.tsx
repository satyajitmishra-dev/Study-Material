'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, Code, Globe, Twitter, Linkedin, Send } from 'lucide-react';
import { Button } from '@/components/ui/core';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url?: string;
  description?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  url,
  description
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'embed'>('link');

  const shareUrl = typeof window !== 'undefined' ? (url || window.location.href) : (url || '');
  const embedCode = `<a href="${shareUrl}" target="_blank" rel="noopener noreferrer"><strong>${title}</strong></a>`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyEmbed = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    }
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`Check out "${title}" on developer platform!`);
    const link = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${link}`, '_blank');
  };

  const shareLinkedIn = () => {
    const link = encodeURIComponent(shareUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${link}`, '_blank');
  };

  const shareReddit = () => {
    const link = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(title);
    window.open(`https://www.reddit.com/submit?url=${link}&title=${text}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-md bg-onyx border border-white/10 rounded-2xl p-5 shadow-premium space-y-4 text-warm-white"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-accent-cyan/10 text-accent-cyan">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-warm-white">Share Options</h3>
                <p className="text-[11px] text-stone font-light line-clamp-1">{title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone hover:text-warm-white hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Social One-Click Share Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={shareTwitter}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-charcoal/40 border border-white/5 hover:border-accent-cyan/40 hover:bg-charcoal/70 transition-all text-[11.5px] font-medium text-stone hover:text-warm-white"
            >
              <Twitter className="w-4 h-4 text-accent-cyan" />
              <span>X / Twitter</span>
            </button>
            <button
              onClick={shareLinkedIn}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-charcoal/40 border border-white/5 hover:border-accent-violet/40 hover:bg-charcoal/70 transition-all text-[11.5px] font-medium text-stone hover:text-warm-white"
            >
              <Linkedin className="w-4 h-4 text-accent-violet" />
              <span>LinkedIn</span>
            </button>
            <button
              onClick={shareReddit}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-charcoal/40 border border-white/5 hover:border-accent-orange/40 hover:bg-charcoal/70 transition-all text-[11.5px] font-medium text-stone hover:text-warm-white"
            >
              <Send className="w-4 h-4 text-accent-orange" />
              <span>Reddit</span>
            </button>
          </div>

          {/* Switcher: Link vs Embed */}
          <div className="flex border-b border-white/5 text-[12px]">
            <button
              onClick={() => setActiveTab('link')}
              className={`flex-1 py-2 font-semibold transition-colors border-b-2 ${
                activeTab === 'link'
                  ? 'border-accent-cyan text-warm-white'
                  : 'border-transparent text-stone hover:text-warm-white'
              }`}
            >
              Copy Link
            </button>
            <button
              onClick={() => setActiveTab('embed')}
              className={`flex-1 py-2 font-semibold transition-colors border-b-2 ${
                activeTab === 'embed'
                  ? 'border-accent-cyan text-warm-white'
                  : 'border-transparent text-stone hover:text-warm-white'
              }`}
            >
              Embed Snippet
            </button>
          </div>

          {activeTab === 'link' ? (
            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase text-stone">Direct Page URL</label>
              <div className="flex items-center gap-2 bg-charcoal/50 border border-white/10 rounded-xl p-1.5 pl-3">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-transparent text-[12px] text-stone font-mono outline-none truncate"
                />
                <Button
                  variant="primary"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 text-[11px] shrink-0 flex items-center gap-1.5"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase text-stone">HTML Card Snippet</label>
              <div className="flex flex-col gap-2 bg-charcoal/50 border border-white/10 rounded-xl p-3">
                <code className="text-[11px] text-accent-cyan font-mono break-all line-clamp-3">
                  {embedCode}
                </code>
                <div className="flex justify-end pt-1">
                  <Button
                    variant="secondary"
                    onClick={handleCopyEmbed}
                    className="px-3 py-1 text-[11px] flex items-center gap-1.5"
                  >
                    {copiedEmbed ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Code className="w-3.5 h-3.5" />}
                    {copiedEmbed ? 'Snippet Copied' : 'Copy Snippet'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
