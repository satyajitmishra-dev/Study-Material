import React from 'react';
import { Metadata } from 'next';
import { getMetadata } from '@/lib/seo/MetadataEngine';
import { publicDb } from '@/lib/database/publicDb';
import { SchemaMarkup } from '@/lib/seo/SchemaMarkup';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, Button } from '@/components/ui/core';
import { 
  Download, 
  ArrowLeft, 
  ThumbsUp, 
  Bookmark, 
  Share2, 
  MessageCircle, 
  FileText, 
  Calendar,
  Layers,
  User,
  ShieldCheck,
  Globe
} from 'lucide-react';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = await publicDb.getNoteBySlug(slug);
  if (!note) {
    return getMetadata({ title: 'Note Not Found', path: `/notes/${slug}` });
  }

  return getMetadata({
    title: note.seoTitle || `${note.title} Notes`,
    description: note.seoDescription || note.description || `Study material notes on ${note.title}.`,
    path: `/notes/${slug}`,
    tags: note.tags
  });
}

export const dynamic = 'force-dynamic';

export default async function NoteDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const note = await publicDb.getNoteBySlug(slug);
  if (!note) {
    notFound();
  }

  // Fetch related notes
  const allNotes = await publicDb.getNotes({ visibility: 'public' });
  const relatedNotes = allNotes
    .filter(n => n.id !== note.id && (n.category === note.category || n.technology === note.technology))
    .slice(0, 3);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://studymaterial.utool.in';
  
  // SEO structured data sitemap
  const sitemapSchema = SchemaMarkup.breadcrumb([
    { name: 'Home', url: baseUrl },
    { name: 'Notes', url: `${baseUrl}?tab=note` },
    { name: note.title, url: `${baseUrl}/notes/${note.slug}` }
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sitemapSchema) }}
      />

      <div className="w-full max-w-6xl mx-auto px-4 pt-12 pb-16 font-sans">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] text-stone hover:text-warm-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to discovery feed
          </Link>
        </div>

        {/* Main Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Note Details & Preview */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header info */}
            <Card className="p-6 border-white/5 bg-charcoal/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider bg-accent-amber/10 border border-accent-amber/20 text-accent-amber">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Notes Upload</span>
                </span>
                <span className="text-[11px] text-stone font-mono flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  {note.visibility} visibility
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-warm-white leading-tight">
                {note.title}
              </h1>

              {note.description && (
                <p className="text-[13px] text-stone leading-relaxed font-light">
                  {note.description}
                </p>
              )}

              {/* Tags */}
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {note.tags.map((tag: string, idx: number) => (
                    <span key={idx} className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-stone">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            {/* Preview Box */}
            <Card className="p-6 border-white/5 bg-charcoal/20 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-[13px] font-bold text-warm-white font-mono uppercase tracking-wider">
                  Document Preview
                </h3>
                <span className="text-[11px] text-stone font-mono">
                  {note.fileType} • {(note.fileSize / (1024 * 1024)).toFixed(1)} MB
                </span>
              </div>

              {note.fileType === 'PDF' ? (
                <div className="w-full h-[500px] border border-white/5 rounded-xl overflow-hidden bg-charcoal/40 flex items-center justify-center relative">
                  {/* Since sandbox uses mock paths, render a clean simulator preview */}
                  <div className="absolute inset-0 bg-charcoal/50 flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <FileText className="w-16 h-16 text-stone/40 animate-pulse" />
                    <div className="space-y-1">
                      <h4 className="text-[14px] font-bold text-warm-white">{note.title}</h4>
                      <p className="text-[12px] text-stone leading-relaxed max-w-md font-light">
                        PDF presentation and document files are optimized for offline learning. Click the button below to download the complete file.
                      </p>
                    </div>
                    <a href={note.fileUrl} download>
                      <Button variant="primary" className="text-[12px] uppercase font-bold py-2 px-6">
                        <Download className="w-4 h-4" /> Download Complete PDF
                      </Button>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-8 border border-white/5 rounded-xl bg-charcoal/40 text-center space-y-4">
                  <Layers className="w-12 h-12 text-stone/40 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-[13.5px] font-bold text-warm-white">Preview unavailable for {note.fileType} format</h4>
                    <p className="text-[11.5px] text-stone font-light max-w-sm mx-auto">
                      This note is compiled in a {note.fileType} file structure. Download to access full guides and attachments.
                    </p>
                  </div>
                  <a href={note.fileUrl} download>
                    <Button variant="primary" className="text-[11.5px] py-1.5 px-4 font-semibold uppercase">
                      <Download className="w-4 h-4" /> Download Notes File
                    </Button>
                  </a>
                </div>
              )}
            </Card>

            {/* Comments Placeholder */}
            <Card className="p-6 border-white/5 bg-charcoal/20 space-y-4">
              <h3 className="text-[13px] font-bold text-warm-white font-mono uppercase tracking-wider flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-stone" /> Discussion & Reviews (0)
              </h3>
              <div className="py-10 text-center text-stone text-[12px] border border-dashed border-white/5 rounded-xl">
                No reviews yet. Be the first to share feedback!
              </div>
            </Card>

          </div>

          {/* Right Column: Metadata & Creator info */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Download Button */}
            <a href={note.fileUrl} download className="block w-full">
              <Button variant="primary" className="w-full justify-center text-[13px] uppercase font-bold tracking-wider py-3 shadow-premium">
                <Download className="w-4.5 h-4.5" /> Download Note
              </Button>
            </a>

            {/* Academic Info */}
            {(note.university || note.subject || note.branch) && (
              <Card className="p-5 border-white/5 bg-charcoal/20 space-y-4 text-[12.5px]">
                <h3 className="text-[11.5px] font-bold text-stone font-mono uppercase tracking-wider">
                  Academic Context
                </h3>
                <div className="space-y-3 font-sans">
                  {note.university && (
                    <div className="flex justify-between items-start gap-3">
                      <span className="text-stone">University:</span>
                      <span className="text-warm-white text-right font-medium">{note.university}</span>
                    </div>
                  )}
                  {note.semester && (
                    <div className="flex justify-between items-center">
                      <span className="text-stone">Semester:</span>
                      <span className="text-warm-white font-medium">Semester {note.semester}</span>
                    </div>
                  )}
                  {note.branch && (
                    <div className="flex justify-between items-start gap-3">
                      <span className="text-stone">Branch:</span>
                      <span className="text-warm-white text-right font-medium">{note.branch}</span>
                    </div>
                  )}
                  {note.subject && (
                    <div className="flex justify-between items-start gap-3">
                      <span className="text-stone">Subject:</span>
                      <span className="text-warm-white text-right font-medium">{note.subject}</span>
                    </div>
                  )}
                  {note.topic && (
                    <div className="flex justify-between items-start gap-3">
                      <span className="text-stone">Topic:</span>
                      <span className="text-warm-white text-right font-medium">{note.topic}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Creator Profile */}
            <Card className="p-5 border-white/5 bg-charcoal/20 space-y-4">
              <h3 className="text-[11px] font-bold text-stone font-mono uppercase tracking-wider">
                Note Publisher
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden flex items-center justify-center">
                  {note.author?.image ? <img src={note.author.image} alt={note.author.name} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-stone" />}
                </div>
                <div>
                  <span className="text-[13px] font-bold text-warm-white block flex items-center gap-1">
                    {note.author?.name || 'Administrator'}
                    <ShieldCheck className="w-4 h-4 text-accent-cyan" />
                  </span>
                  <span className="text-[11px] text-stone block font-mono">Contributor level 4</span>
                </div>
              </div>
            </Card>

            {/* Related Notes */}
            {relatedNotes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[11.5px] font-bold text-stone font-mono uppercase tracking-wider pl-1">
                  Related Study Material
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {relatedNotes.map((n) => (
                    <Card key={n.id} className="p-4 border-white/5 bg-charcoal/20 hover:border-white/10 transition-colors">
                      <span className="text-[9px] font-mono text-accent-amber uppercase tracking-wider block mb-1">
                        {n.fileType} Notes
                      </span>
                      <h4 className="text-[13px] font-bold text-warm-white hover:text-accent-amber transition-colors line-clamp-1">
                        <Link href={`/notes/${n.slug}`}>{n.title}</Link>
                      </h4>
                      <p className="text-[11.5px] text-stone line-clamp-2 leading-relaxed font-light mt-1">
                        {n.description}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </>
  );
}
