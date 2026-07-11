'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, RotateCw, ZoomIn, ZoomOut, Check, Sparkles, RefreshCw, Trash2, Camera, User } from 'lucide-react';
import { Button, Card } from '@/components/ui/core';

interface ProfilePhotoManagerProps {
  initialValue: string;
  onChange: (url: string) => void;
  label?: string;
  aspectRatio?: '1/1' | '16/9';
}

const GRADIENT_PRESETS = [
  'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)', // Violet to Cyan
  'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)', // Pink to Rose
  'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Emerald to Teal
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Amber to Yellow
  'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', // Indigo to Violet
  'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', // Charcoal Gray
];

export default function ProfilePhotoManager({
  initialValue,
  onChange,
  label = 'Profile Avatar',
  aspectRatio = '1/1'
}: ProfilePhotoManagerProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'generator'>('upload');
  const [imageUrl, setImageUrl] = useState<string>(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);

  // Generator State
  const [initials, setInitials] = useState('SM');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_PRESETS[0]);
  const [generatorStyle, setGeneratorStyle] = useState<'initials' | 'identicon' | 'shapes'>('initials');
  const [randomSeed, setRandomSeed] = useState(0.5);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sourceImage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Center of canvas
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.translate(cx + offset.x, cy + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Draw image centered
    const iw = sourceImage.width;
    const ih = sourceImage.height;
    const size = Math.min(canvas.width, canvas.height);
    
    // Scale image to cover canvas box initially
    const scaleFactor = size / Math.min(iw, ih);
    const dw = iw * scaleFactor;
    const dh = ih * scaleFactor;

    ctx.drawImage(sourceImage, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
  }, [sourceImage, zoom, rotation, offset]);

  // Redraw when image/zoom/rotation/offset changes
  useEffect(() => {
    if (isEditing && sourceImage) {
      drawCanvas();
    }
  }, [isEditing, sourceImage, zoom, rotation, offset, drawCanvas]);

  // Load selected file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          setSourceImage(img);
          setZoom(1);
          setRotation(0);
          setOffset({ x: 0, y: 0 });
          setIsEditing(true);
        };
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag handlers for Canvas positioning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditing) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Crop & Compress to base64 or upload
  const handleCropSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Output high quality WebP/JPEG dataUrl
    const dataUrl = canvas.toDataURL('image/webp', 0.85);
    setImageUrl(dataUrl);
    onChange(dataUrl);
    setIsEditing(false);
    setSourceImage(null);
  };

  // Avatar Generator Render Logic
  const handleGenerateAvatar = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw gradient
    const grad = ctx.createLinearGradient(0, 0, 300, 300);
    // Parse CSS Gradient
    if (selectedGradient.includes('linear-gradient')) {
      const colors = selectedGradient.match(/#[0-9a-fA-F]{6}/g) || ['#a855f7', '#06b6d4'];
      grad.addColorStop(0, colors[0]);
      grad.addColorStop(1, colors[1]);
    } else {
      grad.addColorStop(0, '#a855f7');
      grad.addColorStop(1, '#06b6d4');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 300, 300);

    if (generatorStyle === 'initials') {
      // Draw Text Initials
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 110px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Subtle shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 4;
      ctx.fillText(initials.substring(0, 3).toUpperCase(), 150, 150);
    } else if (generatorStyle === 'identicon') {
      // Identicon-like shape grid
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      const hash = Math.floor(randomSeed * 9999999);
      const cells = 5;
      const cellSize = 40;
      const margin = (300 - cells * cellSize) / 2;

      for (let x = 0; x < cells; x++) {
        // Symmetric grid
        const col = x < 3 ? x : 4 - x;
        for (let y = 0; y < cells; y++) {
          const bitVal = (hash >> (col * cells + y)) & 1;
          if (bitVal === 1) {
            ctx.fillRect(margin + x * cellSize, margin + y * cellSize, cellSize, cellSize);
          }
        }
      }
    } else if (generatorStyle === 'shapes') {
      // Abstract geometric shapes generator
      const hash = randomSeed;
      ctx.save();
      ctx.translate(150, 150);
      
      // Draw 3 layers of random shapes
      for (let i = 0; i < 3; i++) {
        ctx.rotate(hash * Math.PI * (i + 1));
        ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + i * 0.15})`;
        ctx.beginPath();
        if (i % 2 === 0) {
          // Circle
          ctx.arc(30 * i, 10 * i, 40 + i * 15, 0, Math.PI * 2);
        } else {
          // Polygon
          ctx.rect(-30 - i * 10, -30 - i * 10, 60 + i * 20, 60 + i * 20);
        }
        ctx.fill();
      }
      ctx.restore();
    }

    const dataUrl = canvas.toDataURL('image/png');
    setImageUrl(dataUrl);
    onChange(dataUrl);
  };

  const regenerateSeed = () => {
    setRandomSeed(Math.random());
  };

  useEffect(() => {
    if (activeTab === 'generator') {
      handleGenerateAvatar();
    }
  }, [activeTab, initials, selectedGradient, generatorStyle, randomSeed]);

  return (
    <Card className="p-5 space-y-4 bg-charcoal/20 border-white/5 relative">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <label className="text-[12px] font-bold text-warm-white uppercase tracking-wider block">
          {label}
        </label>
        
        {/* Toggle Tabs */}
        <div className="flex bg-charcoal/50 border border-white/5 rounded-lg p-0.5 text-[10px]">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1 rounded cursor-pointer ${activeTab === 'upload' ? 'bg-white/10 text-warm-white font-semibold' : 'text-stone hover:text-warm-white'}`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('generator')}
            className={`px-3 py-1 rounded cursor-pointer ${activeTab === 'generator' ? 'bg-white/10 text-warm-white font-semibold' : 'text-stone hover:text-warm-white'}`}
          >
            AI Generator
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* Image Preview & Editing Zone */}
        <div className="relative shrink-0 select-none">
          <div
            ref={containerRef}
            className={`
              relative w-32 h-32 rounded-2xl overflow-hidden border border-white/10 bg-charcoal/50 shadow-premium flex items-center justify-center
              ${isEditing ? 'cursor-move' : ''}
            `}
            style={{ aspectRatio: aspectRatio === '1/1' ? '1/1' : '16/9' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {isEditing ? (
              <canvas
                ref={canvasRef}
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            ) : imageUrl ? (
              <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center text-stone/50 text-[10px]">
                <User className="w-8 h-8 mb-1" />
                No Image
              </div>
            )}

            {/* Hover Trigger (only when not editing) */}
            {!isEditing && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer text-[10px] text-warm-white font-mono uppercase"
              >
                <Camera className="w-4 h-4" />
                Change
              </div>
            )}
          </div>

          {imageUrl && !isEditing && (
            <button
              onClick={() => { setImageUrl(''); onChange(''); }}
              className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-accent-pink/20 hover:bg-accent-pink border border-accent-pink/30 hover:border-accent-pink text-accent-pink hover:text-white transition-all cursor-pointer shadow-sm"
              title="Delete photo"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tab Controls */}
        <div className="flex-1 w-full space-y-4">
          {activeTab === 'upload' && (
            <div className="space-y-3.5">
              {!isEditing ? (
                <div className="space-y-3">
                  <p className="text-[11px] text-stone leading-relaxed font-light">
                    Upload PNG, JPG, or WEBP. Image will be processed locally on your client device.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-fit text-[11px] py-1.5"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image File</span>
                  </Button>
                </div>
              ) : (
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-3.5">
                  <span className="text-[10px] font-mono text-accent-cyan uppercase tracking-wider block">Image Editor Controls</span>
                  
                  {/* Zoom controls */}
                  <div className="flex items-center gap-2.5 text-[11px]">
                    <ZoomOut className="w-4 h-4 text-stone" />
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="flex-1 accent-accent-cyan h-1 bg-white/5 rounded-lg outline-none cursor-pointer"
                    />
                    <ZoomIn className="w-4 h-4 text-stone" />
                  </div>

                  {/* Rotation controls */}
                  <div className="flex items-center gap-2.5 text-[11px]">
                    <RotateCw className="w-4 h-4 text-stone" />
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="5"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="flex-1 accent-accent-cyan h-1 bg-white/5 rounded-lg outline-none cursor-pointer"
                    />
                    <span className="w-8 text-right font-mono text-[10px] text-stone">{rotation}°</span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-7 text-[10px] px-3"
                      onClick={() => { setIsEditing(false); setSourceImage(null); }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="accent"
                      className="h-7 text-[10px] px-3.5 bg-accent-cyan/15 text-accent-cyan font-bold"
                      onClick={handleCropSave}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Apply Crop
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'generator' && (
            <div className="space-y-4 p-3 bg-white/[0.02] border border-white/5 rounded-xl animate-fadeIn">
              {/* Style selector */}
              <div className="grid grid-cols-3 gap-1.5 p-0.5 bg-charcoal/50 rounded-lg border border-white/5 text-[9px] font-mono">
                {[
                  { id: 'initials', label: 'Initials' },
                  { id: 'identicon', label: 'Identicon' },
                  { id: 'shapes', label: 'Shapes' }
                ].map(style => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setGeneratorStyle(style.id as any)}
                    className={`py-1 rounded cursor-pointer transition-all ${generatorStyle === style.id ? 'bg-white/10 text-warm-white font-bold' : 'text-stone/60 hover:text-warm-white'}`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>

              {generatorStyle === 'initials' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-stone uppercase tracking-wider">Initials text</label>
                  <input
                    type="text"
                    maxLength={3}
                    value={initials}
                    onChange={(e) => setInitials(e.target.value)}
                    className="w-full max-w-[80px] px-2 py-1 text-[12px] bg-charcoal/40 border border-white/5 rounded outline-none text-warm-white focus:border-white/10 text-center font-mono font-bold"
                  />
                </div>
              )}

              {generatorStyle !== 'initials' && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-stone uppercase tracking-wider">Regenerate Pattern</span>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-7 text-[10px] px-2.5"
                    onClick={regenerateSeed}
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Shuffle Layout</span>
                  </Button>
                </div>
              )}

              {/* Gradient selector */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-stone uppercase tracking-wider block">Gradient Palette</span>
                <div className="flex flex-wrap gap-2">
                  {GRADIENT_PRESETS.map((grad, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedGradient(grad)}
                      style={{ background: grad }}
                      className={`w-6 h-6 rounded-full border cursor-pointer hover:scale-105 active:scale-95 transition-all ${selectedGradient === grad ? 'border-white ring-2 ring-accent-cyan/40 scale-105' : 'border-transparent'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </Card>
  );
}
