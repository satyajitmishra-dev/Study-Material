'use client';

import React, { useState } from 'react';
import { Card, Button } from '@/components/ui/core';
import { Sparkles, RefreshCw, Clipboard, Check, Wand2 } from 'lucide-react';
import { generateAiContentAction } from '@/lib/actions/cms';

export default function StudioAiPage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiMode, setAiMode] = useState<'summarize' | 'rewrite' | 'faq' | 'seo'>('rewrite');

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      alert('Please enter some text for the AI to process.');
      return;
    }
    setLoading(true);
    try {
      const res = await generateAiContentAction(inputText, aiMode);
      if (res.success && res.text) {
        setOutputText(res.text);
      } else {
        setOutputText(res.error || 'AI inference failed. Please check credentials.');
      }
    } catch (e) {
      setOutputText('An error occurred during OpenAI compilation request.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-warm-white">
      {/* Page Header */}
      <div className="border-b border-white/5 pb-6">
        <span className="text-[10px] font-mono text-accent-cyan font-bold uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Creator Intelligence</span>
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-warm-white mt-1">AI Studio Co-Writer</h1>
        <p className="text-[13px] text-stone font-light mt-1">
          Elegantly summarize technical blogs, rewrite content structures, optimize SEO, and generate dynamic curriculum maps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input area */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-mono text-stone uppercase font-bold">Input Content / Prompt</span>
              <div className="flex gap-1.5 text-[11px]">
                {(['rewrite', 'summarize', 'faq', 'seo'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setAiMode(mode)}
                    className={`px-2.5 py-1 rounded capitalize cursor-pointer transition-colors ${
                      aiMode === mode ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/25 font-bold' : 'text-stone hover:text-warm-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Paste article paragraphs, outline technical details, or enter topic titles here..."
              className="w-full min-h-[300px] bg-charcoal/20 border border-white/5 rounded-xl p-4 text-[13px] text-warm-white outline-none focus:border-white/10 placeholder:text-stone/30 font-light resize-y"
            />

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-2.5 justify-center text-[12px] uppercase tracking-wider font-bold"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-accent-cyan mr-1.5" />
                  Processing Inferences...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-1.5 text-accent-cyan" />
                  Generate AI Output
                </>
              )}
            </Button>
          </Card>
        </div>

        {/* Output area */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-5 space-y-4 relative min-h-[396px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[11px] font-mono text-stone uppercase font-bold">AI Draft Output</span>
                {outputText && (
                  <Button onClick={handleCopy} variant="ghost" className="h-7 text-[10px] px-2.5">
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-accent-emerald mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Clipboard className="w-3.5 h-3.5 mr-1" />
                        Copy text
                      </>
                    )}
                  </Button>
                )}
              </div>

              {outputText ? (
                <div className="text-[13px] text-stone/90 leading-relaxed font-sans whitespace-pre-wrap select-text max-h-[350px] overflow-y-auto pr-1">
                  {outputText}
                </div>
              ) : (
                <div className="py-24 text-center text-stone/30 font-light text-[12px]">
                  AI responses will render here after clicking generate.
                </div>
              )}
            </div>

            <div className="text-[10px] text-stone/40 font-mono text-center border-t border-white/5 pt-3">
              Powered by GPT-4o-mini compiler templates.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
