'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, 
  FolderPlus,
  Upload, 
  Search, 
  X, 
  File, 
  Check, 
  Trash2, 
  Copy, 
  Tag, 
  Crop as CropIcon,
  Maximize2,
  Sliders,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input } from '@/components/ui/core';
import { CmsMedia } from '@/lib/database/cmsDb';
import { uploadMediaAction, deleteMediaAction } from '@/lib/actions/cms';

interface MediaLibraryClientProps {
  initialMedia: CmsMedia[];
  folders: string[];
}

export default function MediaLibraryClient({ initialMedia, folders }: MediaLibraryClientProps) {
  const router = useRouter();

  // Search, folder, and list state
  const [mediaList, setMediaList] = useState<CmsMedia[]>(initialMedia);
  const [activeFolder, setActiveFolder] = useState<string>('/');
  const [searchQuery, setSearchQuery] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [folderList, setFolderList] = useState<string[]>(folders.includes('/') ? folders : ['/', ...folders]);

  // Selected file details & editor modal state
  const [selectedFile, setSelectedFile] = useState<CmsMedia | null>(null);
  const [isEditingImage, setIsEditingImage] = useState(false);

  // File Upload states
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Image Editor parameters
  const [cropAspect, setCropAspect] = useState<'free' | '16:9' | '4:3' | '1:1'>('free');
  const [resizeWidth, setResizeWidth] = useState<number>(800);
  const [compressQuality, setCompressQuality] = useState<number>(0.8);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial prop values
  useEffect(() => {
    setMediaList(initialMedia);
  }, [initialMedia]);

  // Toast feedback
  const [toast, setToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Filtered Media list
  const filteredMedia = useMemo(() => {
    let items = mediaList.filter(m => m.folder === activeFolder);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(m => 
        m.filename.toLowerCase().includes(q) || 
        (m.tags as string[])?.some((t: string) => t.toLowerCase().includes(q))
      );
    }
    return items;
  }, [mediaList, activeFolder, searchQuery]);

  // Drag & Drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Safe file validations
  const validateAndUpload = async (file: File) => {
    setUploadError('');
    
    // File Size: Limit to 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError(`File ${file.name} is too large. Max size is 5MB.`);
      return;
    }

    // File Type: Limit to images/pdfs/documents
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError(`File format ${file.type} is not supported. Use JPG, PNG, WEBP, or PDF.`);
      return;
    }

    setIsUploading(true);
    
    // Simulate CDN upload by converting file to base64 data-url
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const res = await uploadMediaAction({
          filename: file.name,
          url: dataUrl, // base64 URL representing uploaded asset
          size: file.size,
          type: file.type,
          folder: activeFolder,
          tags: [file.name.split('.')[1] || 'asset'],
        });

        if (res.success && res.media) {
          triggerToast('Asset uploaded successfully');
          setMediaList(prev => [res.media!, ...prev]);
        } else {
          setUploadError(res.error || 'Upload transaction failed');
        }
      } catch (e) {
        setUploadError('Network error uploading asset');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    const res = await deleteMediaAction(id);
    if (res.success) {
      triggerToast('Asset deleted successfully');
      setMediaList(prev => prev.filter(m => m.id !== id));
      setSelectedFile(null);
    } else {
      alert(res.error || 'Failed to delete asset');
    }
  };

  // Add folder helper
  const handleAddFolder = () => {
    if (!newFolderName) return;
    const formattedPath = newFolderName.startsWith('/') ? newFolderName : `/${newFolderName}`;
    if (!folderList.includes(formattedPath)) {
      setFolderList(prev => [...prev, formattedPath]);
      setActiveFolder(formattedPath);
    }
    setNewFolderName('');
    setShowFolderInput(false);
  };

  // Canvas Image Editor triggers
  const processCanvasImage = () => {
    if (!selectedFile) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedFile.url;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Crop calculation based on aspect ratio
      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = img.width;
      let sourceHeight = img.height;

      if (cropAspect !== 'free') {
        const aspectNum = cropAspect === '16:9' ? 16 / 9 : cropAspect === '4:3' ? 4 / 3 : 1;
        if (img.width / img.height > aspectNum) {
          sourceWidth = img.height * aspectNum;
          sourceX = (img.width - sourceWidth) / 2;
        } else {
          sourceHeight = img.width / aspectNum;
          sourceY = (img.height - sourceHeight) / 2;
        }
      }

      // Resize calculation
      const targetWidth = resizeWidth;
      const targetHeight = (sourceHeight / sourceWidth) * targetWidth;

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.clearRect(0, 0, targetWidth, targetHeight);
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight, // Source frame
        0, 0, targetWidth, targetHeight // Target frame
      );
    };
  };

  // Re-run canvas update on parameter modifications
  useEffect(() => {
    if (isEditingImage && selectedFile) {
      processCanvasImage();
    }
  }, [isEditingImage, cropAspect, resizeWidth, selectedFile]);

  // Save the cropped & compressed canvas version to the library
  const saveProcessedImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedFile) return;

    const mime = selectedFile.type;
    const dataUrl = canvas.toDataURL(mime, compressQuality);

    setIsUploading(true);
    try {
      const res = await uploadMediaAction({
        filename: `edited_${selectedFile.filename}`,
        url: dataUrl,
        size: Math.round((dataUrl.length * 3) / 4), // Estimate size in bytes
        type: mime,
        folder: activeFolder,
        tags: [...selectedFile.tags, 'edited'],
      });

      if (res.success && res.media) {
        triggerToast('Edited image version saved');
        setMediaList(prev => [res.media!, ...prev]);
        setIsEditingImage(false);
        setSelectedFile(null);
      } else {
        alert(res.error || 'Failed to save edited image');
      }
    } catch (e) {
      alert('Error saving transaction');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-12 select-none">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-55 flex items-center gap-2 px-4 py-3 rounded-xl border border-accent-emerald/20 bg-accent-emerald/10 text-accent-emerald shadow-premium backdrop-blur-md text-[12px] font-semibold"
          >
            <Check className="w-4.5 h-4.5" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT SIDEBAR: Folder Manager (3 cols) */}
      <Card className="lg:col-span-3 p-5 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider">Directories</h3>
          <button 
            onClick={() => setShowFolderInput(!showFolderInput)} 
            className="text-stone hover:text-warm-white cursor-pointer"
            aria-label="Create Folder"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>

        {showFolderInput && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="flex-1 bg-charcoal/20 border border-white/5 rounded-lg text-[12px] px-2.5 py-1.5 text-warm-white outline-none focus:border-white/20"
            />
            <Button onClick={handleAddFolder} variant="primary" className="py-1 px-2.5 text-[10px]">
              Add
            </Button>
          </motion.div>
        )}

        <nav className="space-y-1">
          {folderList.map((folder) => {
            const isActive = activeFolder === folder;
            const itemsCount = mediaList.filter(m => m.folder === folder).length;

            return (
              <button
                key={folder}
                onClick={() => setActiveFolder(folder)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium tracking-wide text-left cursor-pointer transition-colors
                  ${isActive 
                    ? 'bg-warm-white text-onyx font-bold' 
                    : 'text-stone hover:text-warm-white hover:bg-white/5'
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <Folder className="w-4 h-4 shrink-0" />
                  <span className="truncate max-w-[130px]">{folder}</span>
                </div>
                <span className={`text-[10px] font-mono ${isActive ? 'text-onyx/85' : 'text-stone/60'}`}>
                  {itemsCount}
                </span>
              </button>
            );
          })}
        </nav>
      </Card>

      {/* MAIN GALLERY: DragDrop Upload & File List (9 cols) */}
      <div className="lg:col-span-9 space-y-6">
        
        {/* Search & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-2xl font-extrabold text-warm-white">Media Library</h1>
            <p className="text-[12px] text-stone">Browse, upload, and perform canvas cropping operations on asset files in {activeFolder}.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
            <input
              type="text"
              placeholder="Search files by filename/tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-[12px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/20 placeholder:text-stone/40"
            />
          </div>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer select-none
            ${dragActive 
              ? 'border-accent-cyan bg-accent-cyan/5' 
              : 'border-white/10 bg-charcoal/10 hover:border-white/20 hover:bg-charcoal/20'
            }
          `}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden" 
            accept="image/*,application/pdf"
          />
          <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-stone">
            <Upload className={`w-6 h-6 ${isUploading ? 'animate-bounce text-accent-cyan' : ''}`} />
          </div>
          <div className="space-y-1">
            <p className="text-[13px] font-bold text-warm-white">
              {isUploading ? 'Uploading transaction...' : 'Drag and drop assets here'}
            </p>
            <p className="text-[11px] text-stone">Support images up to 5MB (JPG, PNG, WEBP)</p>
          </div>

          {uploadError && (
            <div className="flex items-center gap-1.5 text-[11px] text-accent-pink font-mono mt-2 bg-accent-pink/5 px-2.5 py-1 rounded border border-accent-pink/15">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* Media Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {filteredMedia.map((file) => {
            const isImage = file.type.startsWith('image/');
            const sizeKB = `${(file.size / 1024).toFixed(1)} KB`;

            return (
              <div 
                key={file.id} 
                onClick={() => {
                  setSelectedFile(file);
                  setIsEditingImage(false);
                }}
                className="group cursor-pointer space-y-2"
              >
                <div className="aspect-square bg-charcoal/20 border border-white/5 hover:border-white/12 rounded-2xl relative overflow-hidden transition-all duration-300">
                  {isImage ? (
                    <img 
                      src={file.url} 
                      alt={file.filename} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-stone gap-2 bg-charcoal/30">
                      <File className="w-8 h-8 text-stone/50" />
                      <span className="text-[9px] uppercase font-bold tracking-widest font-mono">PDF Doc</span>
                    </div>
                  )}

                  {/* Thumbnail Cover Hover HUD overlay */}
                  <div className="absolute inset-0 bg-onyx/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    <Button variant="secondary" className="px-2.5 py-1 text-[10px] rounded-lg">
                      Inspect
                    </Button>
                  </div>
                </div>

                <div className="px-1 text-[11px] truncate max-w-full space-y-0.5">
                  <span className="font-bold text-warm-white block truncate">{file.filename}</span>
                  <div className="flex justify-between items-center text-[10px] text-stone font-mono">
                    <span>{sizeKB}</span>
                    <span>{file.type.split('/')[1]?.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredMedia.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-2 border border-white/5 rounded-2xl">
              <ImageIcon className="w-12 h-12 text-stone/40" />
              <div className="text-center">
                <h4 className="text-[13px] font-bold text-warm-white">No assets found</h4>
                <p className="text-[11px] text-stone">Drag and drop assets above or search different directories.</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* METADATA INSPECT & CANVAS EDITOR MODAL WINDOW */}
      <AnimatePresence>
        {selectedFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-onyx/80 backdrop-blur-sm select-text">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-4xl bg-charcoal/95 border border-white/10 rounded-2xl overflow-hidden shadow-premium flex flex-col md:flex-row h-[540px]"
            >
              
              {/* Preview Window (Left / Top) */}
              <div className="flex-1 bg-onyx/30 border-r border-white/5 p-8 flex items-center justify-center relative min-w-0">
                <button 
                  onClick={() => setSelectedFile(null)} 
                  className="absolute top-4 right-4 text-stone hover:text-warm-white cursor-pointer z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                {!isEditingImage ? (
                  selectedFile.type.startsWith('image/') ? (
                    <img 
                      src={selectedFile.url} 
                      alt={selectedFile.filename} 
                      className="max-w-full max-h-[380px] rounded-lg object-contain border border-white/5" 
                    />
                  ) : (
                    <div className="text-center space-y-2">
                      <File className="w-16 h-16 mx-auto text-stone/50" />
                      <p className="text-[13px] text-stone font-mono">{selectedFile.filename}</p>
                    </div>
                  )
                ) : (
                  <div className="space-y-4 flex flex-col items-center">
                    <canvas 
                      ref={canvasRef} 
                      className="max-w-full max-h-[340px] rounded-lg border border-white/15 bg-charcoal/20"
                    />
                    <span className="text-[10px] text-accent-cyan font-mono">Live canvas processing...</span>
                  </div>
                )}
              </div>

              {/* Controls panel (Right / Bottom) */}
              <div className="w-full md:w-80 p-6 flex flex-col justify-between overflow-y-auto custom-scrollbar border-t md:border-t-0 border-white/5">
                
                {/* Meta View */}
                {!isEditingImage ? (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-[14px] font-bold text-warm-white truncate">{selectedFile.filename}</h3>
                      <span className="text-[10px] text-stone uppercase tracking-wider font-mono">File Metadata</span>
                    </div>

                    <div className="space-y-3.5 text-[11px] font-mono text-stone">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span>Directory:</span>
                        <span className="text-warm-white">{selectedFile.folder}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span>Mime Type:</span>
                        <span className="text-warm-white">{selectedFile.type}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span>File Size:</span>
                        <span className="text-warm-white">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span>Upload Date:</span>
                        <span className="text-warm-white">{new Date(selectedFile.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button 
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedFile.url);
                          triggerToast('CDN link copied to clipboard');
                        }}
                        variant="secondary" 
                        className="w-full text-[12px] py-2"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy CDN Link</span>
                      </Button>

                      {selectedFile.type.startsWith('image/') && (
                        <Button 
                          type="button"
                          onClick={() => {
                            setIsEditingImage(true);
                            setResizeWidth(800);
                            setCropAspect('free');
                          }}
                          variant="accent" 
                          className="w-full text-[12px] py-2"
                        >
                          <CropIcon className="w-3.5 h-3.5" />
                          <span>Crop & Compress</span>
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  // Canvas Editing Controls
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <h3 className="text-[14px] font-bold text-warm-white">Canvas Editor</h3>
                      <span className="text-[10px] text-stone uppercase tracking-wider font-mono">Process Pixels</span>
                    </div>

                    {/* Aspect ratios */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-stone uppercase font-bold tracking-wider flex items-center gap-1.5">
                        <CropIcon className="w-3.5 h-3.5" />
                        Aspect Ratio
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['free', '16:9', '4:3', '1:1'] as const).map(ratio => (
                          <button
                            key={ratio}
                            onClick={() => setCropAspect(ratio)}
                            className={`px-2 py-1.5 border rounded-lg text-[10px] uppercase font-bold cursor-pointer transition-colors
                              ${cropAspect === ratio 
                                ? 'bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan' 
                                : 'bg-transparent border-white/5 text-stone hover:text-warm-white'
                              }
                            `}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Max Width */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-stone uppercase font-bold tracking-wider flex items-center gap-1.5">
                        <Maximize2 className="w-3.5 h-3.5" />
                        Max Width (px)
                      </label>
                      <input 
                        type="number"
                        value={resizeWidth}
                        onChange={(e) => setResizeWidth(Math.max(100, parseInt(e.target.value) || 800))}
                        className="w-full bg-charcoal/20 border border-white/5 rounded-lg text-[12px] px-3 py-2 text-warm-white outline-none focus:border-white/20 font-mono"
                      />
                    </div>

                    {/* Compress Quality slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-stone uppercase font-bold tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5" />
                          Quality
                        </span>
                        <span>{Math.round(compressQuality * 100)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.1" 
                        max="1.0" 
                        step="0.05"
                        value={compressQuality}
                        onChange={(e) => setCompressQuality(parseFloat(e.target.value))}
                        className="w-full accent-accent-cyan cursor-pointer bg-white/5"
                      />
                    </div>

                    <div className="space-y-2 pt-4 border-t border-white/5">
                      <Button onClick={saveProcessedImage} variant="accent" className="w-full text-[12px] py-2" disabled={isUploading}>
                        Save Edited Version
                      </Button>
                      <Button onClick={() => setIsEditingImage(false)} variant="secondary" className="w-full text-[12px] py-2">
                        Cancel Edits
                      </Button>
                    </div>

                  </div>
                )}

                {/* Hard Delete button */}
                <div className="border-t border-white/5 pt-4 mt-6">
                  <Button 
                    onClick={() => {
                      if (confirm('Are you sure you want to permanently delete this asset file?')) {
                        handleDeleteMedia(selectedFile.id);
                      }
                    }}
                    variant="ghost" 
                    className="w-full text-accent-pink hover:bg-accent-pink/5 text-[12px] py-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Delete File</span>
                  </Button>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
