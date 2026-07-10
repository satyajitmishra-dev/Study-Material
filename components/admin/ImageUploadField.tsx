'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Link2, ImageIcon, AlertCircle, Check, RefreshCw } from 'lucide-react';
import { Button, Input } from '@/components/ui/core';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  field: 'coverImage' | 'thumbnail';
  aspectRatio?: string; // e.g. '16/10' or '1/1'
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];

function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    if (!['http:', 'https:'].includes(u.protocol)) return false;
    // Check common image hosting patterns OR file extension
    const ext = u.pathname.split('.').pop()?.toLowerCase() || '';
    const hasImageExtension = ALLOWED_EXTENSIONS.includes(ext);
    const isImageHost = /unsplash|cloudinary|imgur|pexels|pixabay|images|img|cdn|media|static|photos/.test(u.hostname);
    return hasImageExtension || isImageHost;
  } catch {
    return false;
  }
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  field,
  aspectRatio = field === 'thumbnail' ? '1/1' : '16/9',
}: ImageUploadFieldProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [urlInputMode, setUrlInputMode] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    setUploadError(null);
    setPreviewError(false);

    // Client-side type validation
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext) && !file.type.startsWith('image/')) {
      setUploadError(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ').toUpperCase()}`);
      return;
    }

    // Client-side size validation
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploadError(`File too large (${sizeMB} MB). Maximum allowed is 10 MB.`);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('field', field);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.url) {
        onChange(data.url);
        setUploadError(null);
      } else {
        setUploadError(data.error || 'Upload failed. Please try again.');
      }
    } catch (err) {
      setUploadError('Network error. Please try pasting a URL instead.');
    } finally {
      setIsUploading(false);
    }
  }, [field, onChange]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    } else {
      // Check for dropped URL text
      const text = e.dataTransfer.getData('text/plain');
      if (text && isValidImageUrl(text)) {
        onChange(text);
        setUploadError(null);
      }
    }
  };

  // Handle URL paste in the input
  const handleUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text/plain').trim();
    if (isValidImageUrl(pastedText)) {
      onChange(pastedText);
      setUploadError(null);
      setPreviewError(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setPreviewError(false);
    if (val && !isValidImageUrl(val)) {
      // Don't show error while typing, only clear preview
    } else {
      setUploadError(null);
    }
  };

  const clearImage = () => {
    onChange('');
    setUploadError(null);
    setPreviewError(false);
  };

  const hasPreview = value && !previewError;

  return (
    <div className="space-y-2.5">
      <label className="text-[11px] font-semibold text-stone uppercase tracking-wider block">
        {label}
      </label>

      {/* Preview + Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative rounded-xl border-2 border-dashed overflow-hidden transition-all duration-200
          ${isDragging
            ? 'border-accent-cyan/50 bg-accent-cyan/5 scale-[1.01]'
            : value
              ? 'border-white/10 bg-charcoal/20'
              : 'border-white/5 bg-charcoal/10 hover:border-white/10 hover:bg-charcoal/20'
          }
        `}
      >
        {/* Image Preview */}
        {hasPreview ? (
          <div className="relative group">
            <div
              className="w-full overflow-hidden bg-charcoal/40"
              style={{ aspectRatio }}
            >
              <img
                src={value}
                alt={label}
                className="w-full h-full object-cover"
                onError={() => setPreviewError(true)}
              />
            </div>

            {/* Overlay controls */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="secondary"
                className="h-8 text-[10px] px-3 bg-white/10 backdrop-blur-sm border-white/20"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-3.5 h-3.5" />
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-8 text-[10px] px-3 text-accent-pink hover:bg-accent-pink/10"
                onClick={clearImage}
              >
                <X className="w-3.5 h-3.5" />
                Remove
              </Button>
            </div>

            {/* Aspect ratio badge */}
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[9px] font-mono text-stone">
              {aspectRatio.replace('/', ':')}
            </div>
          </div>
        ) : (
          /* Empty state drop zone */
          <div
            className="flex flex-col items-center justify-center py-8 px-4 cursor-pointer"
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-8 h-8 text-accent-cyan animate-spin mb-2" />
                <p className="text-[12px] text-accent-cyan font-medium">Uploading & compressing...</p>
                <p className="text-[10px] text-stone mt-0.5">Auto-optimizing via Cloudinary</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-2 group-hover:bg-white/10 transition-colors">
                  <ImageIcon className="w-6 h-6 text-stone/60" />
                </div>
                <p className="text-[12px] text-stone font-medium">
                  Drop image here or <span className="text-accent-cyan">click to upload</span>
                </p>
                <p className="text-[10px] text-stone/60 mt-0.5">
                  JPG, PNG, WebP, GIF, SVG • Max 10 MB • {aspectRatio.replace('/', ':')} ratio
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {(uploadError || previewError) && (
        <div className="flex items-start gap-2 p-2.5 bg-accent-pink/5 border border-accent-pink/15 rounded-lg">
          <AlertCircle className="w-3.5 h-3.5 text-accent-pink shrink-0 mt-0.5" />
          <p className="text-[11px] text-accent-pink leading-relaxed">
            {uploadError || 'Image failed to load. The URL may be invalid or the image was removed.'}
          </p>
        </div>
      )}

      {/* URL Input Row */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label=""
            value={value}
            onChange={handleUrlChange}
            onPaste={handleUrlPaste}
            placeholder="Paste image URL or upload a file..."
            className="text-[12px] !py-1.5"
          />
        </div>

        <Button
          type="button"
          variant="secondary"
          className="h-[34px] text-[10px] px-3 shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload</span>
        </Button>
      </div>

      {/* URL auto-detect indicator */}
      {value && isValidImageUrl(value) && !previewError && (
        <div className="flex items-center gap-1.5 text-[10px] text-accent-emerald font-mono">
          <Check className="w-3 h-3" />
          <span>Valid image URL detected</span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
