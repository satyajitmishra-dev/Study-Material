'use client';

import React from 'react';
import TipTapRenderer from './TipTapRenderer';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <TipTapRenderer 
      content={content} 
      className={className} 
      theme="dark" // Default reading theme
      fontFamily="sans"
      fontSize="md"
      lineHeight="normal"
      readingWidth="medium"
    />
  );
}
