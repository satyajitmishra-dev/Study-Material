'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useReactTable, 
  getCoreRowModel, 
  ColumnDef, 
  flexRender, 
  getSortedRowModel,
  SortingState,
  VisibilityState,
  ColumnOrderState
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { 
  Eye, 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  AlignJustify, 
  MoreHorizontal, 
  ChevronDown, 
  ArrowUpDown,
  Check,
  Trash2,
  Archive,
  Download,
  Copy,
  History,
  FileCheck,
  FolderDot,
  X,
  Languages,
  BookOpen,
  Calendar,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Card, Button, Input } from '@/components/ui/core';
import { CmsProject } from '@/lib/database/cmsDb';
import { saveProjectAction, deleteProjectAction } from '@/lib/actions/cms';

interface ProjectsClientProps {
  initialProjects: CmsProject[];
  initialTotal: number;
  categories: string[];
  tags: string[];
}

export default function ProjectsClient({ 
  initialProjects, 
  initialTotal, 
  categories, 
  tags 
}: ProjectsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // View state: list | grid | compact
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'compact'>('list');

  // Search & Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [tagFilter, setTagFilter] = useState(searchParams.get('tag') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>((searchParams.get('sortOrder') as any) || 'desc');

  // Table configurations
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    thumbnail: true,
    category: true,
    tags: true,
    views: true,
    seoScore: true,
    updatedAt: true,
  });
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([
    'select', 'title', 'status', 'category', 'tags', 'views', 'seoScore', 'updatedAt', 'actions'
  ]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: sortBy, desc: sortOrder === 'desc' }
  ]);

  // Debouncing search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Sync URL query params with filter state
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (statusFilter) params.set('status', statusFilter);
    if (categoryFilter) params.set('category', categoryFilter);
    if (tagFilter) params.set('tag', tagFilter);
    
    if (sorting.length > 0) {
      params.set('sortBy', sorting[0].id);
      params.set('sortOrder', sorting[0].desc ? 'desc' : 'asc');
    }

    router.replace(`${pathname}?${params.toString()}`);
  }, [debouncedSearch, statusFilter, categoryFilter, tagFilter, sorting, pathname, router]);

  // Table data rows
  const [dataList, setDataList] = useState<CmsProject[]>(initialProjects);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Trigger toast timer
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Sync local data with server values
  useEffect(() => {
    setDataList(initialProjects);
  }, [initialProjects]);

  // Active actions
  const handleDelete = async (id: string, soft: boolean = true) => {
    const res = await deleteProjectAction(id, soft);
    if (res.success) {
      showToast('success', soft ? 'Project archived' : 'Project permanently deleted');
      setDataList(prev => prev.filter(p => p.id !== id));
      setRowSelection({});
    } else {
      showToast('error', res.error || 'Failed to delete project');
    }
  };

  const handleDuplicate = async (project: CmsProject) => {
    const res = await saveProjectAction(null, {
      title: `${project.title} (Copy)`,
      slug: `${project.slug}-copy-${Math.floor(Math.random() * 1000)}`,
      description: project.description,
      category: project.category,
      tags: project.tags,
      language: project.language,
      visibility: project.visibility,
      thumbnail: project.thumbnail,
      coverImage: project.coverImage,
      content: project.content,
      seoTitle: project.seoTitle,
      seoDescription: project.seoDescription,
      seoKeywords: project.seoKeywords,
      ogImage: project.ogImage,
      canonical: project.canonical,
      robots: project.robots,
      schemaJson: project.schemaJson,
      seoScore: project.seoScore,
      status: 'draft',
      versionNote: `Duplicated from ${project.title}`,
    });

    if (res.success) {
      showToast('success', 'Project duplicated successfully');
      router.refresh();
    } else {
      showToast('error', res.error || 'Failed to duplicate project');
    }
  };

  const handleBulkArchive = async () => {
    const selectedIds = Object.keys(rowSelection).filter(id => rowSelection[id]);
    setIsLoading(true);
    let successCount = 0;
    for (const id of selectedIds) {
      const res = await deleteProjectAction(id, true);
      if (res.success) successCount++;
    }
    setIsLoading(false);
    showToast('success', `Archived ${successCount} projects`);
    setRowSelection({});
    router.refresh();
  };

  const handleBulkExport = () => {
    const selectedRows = dataList.filter(row => rowSelection[row.id]);
    const exportData = selectedRows.length > 0 ? selectedRows : dataList;
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Title,Slug,Status,Category,Views,SEOScore,UpdatedAt"].join(",") + "\n"
      + exportData.map(p => `"${p.title}","${p.slug}","${p.status}","${p.category || ''}",${p.views},${p.seoScore},"${p.updatedAt.toISOString()}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cms_projects_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Define TanStack columns
  const columns = useMemo<ColumnDef<CmsProject>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="w-4 h-4 rounded border-white/10 accent-accent-violet cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="w-4 h-4 rounded border-white/10 accent-accent-violet cursor-pointer"
        />
      ),
      size: 40,
    },
    {
      id: 'title',
      accessorKey: 'title',
      header: 'Title & Slug',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3 py-1.5 min-w-[200px]">
            {item.thumbnail ? (
              <img 
                src={item.thumbnail} 
                alt={item.title} 
                className="w-10 h-7 rounded bg-white/5 border border-white/5 object-cover shrink-0" 
              />
            ) : (
              <div className="w-10 h-7 rounded bg-white/5 border border-white/5 flex items-center justify-center text-[10px] text-stone shrink-0">
                MDX
              </div>
            )}
            <div className="space-y-0.5">
              <span className="text-[13px] font-bold text-warm-white hover:text-accent-cyan transition-colors block truncate max-w-xs">
                {item.title}
              </span>
              <span className="text-[10px] text-stone block font-mono">/{item.slug}</span>
            </div>
          </div>
        );
      },
      size: 260,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const styles = {
          published: 'bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald',
          draft: 'bg-stone/10 border-white/5 text-stone',
          scheduled: 'bg-accent-cyan/10 border-accent-cyan/20 text-accent-cyan',
          archived: 'bg-accent-pink/10 border-accent-pink/20 text-accent-pink',
        };
        return (
          <span className={`text-[9px] px-2 py-0.5 border rounded-full font-bold uppercase tracking-wider ${styles[status as keyof typeof styles]}`}>
            {status}
          </span>
        );
      },
      size: 90,
    },
    {
      id: 'category',
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="text-[11px] text-stone font-medium">
          {row.original.category || '-'}
        </span>
      ),
      size: 100,
    },
    {
      id: 'tags',
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) => (
        <div className="flex gap-1 flex-wrap max-w-[150px]">
          {row.original.tags.slice(0, 2).map((t, idx) => (
            <span key={idx} className="text-[9px] bg-white/5 px-1.5 py-0.2 rounded text-stone/80">
              {t}
            </span>
          ))}
          {row.original.tags.length > 2 && (
            <span className="text-[9px] text-stone/50 font-bold">
              +{row.original.tags.length - 2}
            </span>
          )}
        </div>
      ),
      size: 140,
    },
    {
      id: 'views',
      accessorKey: 'views',
      header: ({ column }) => (
        <button 
          onClick={() => column.toggleSorting()}
          className="flex items-center gap-1 hover:text-warm-white text-[11px] font-semibold text-stone cursor-pointer"
        >
          <span>Views</span>
          <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: ({ row }) => (
        <span className="text-[11px] font-mono text-warm-white">
          {row.original.views.toLocaleString()}
        </span>
      ),
      size: 90,
    },
    {
      id: 'seoScore',
      accessorKey: 'seoScore',
      header: 'SEO',
      cell: ({ row }) => {
        const score = row.original.seoScore;
        const color = score >= 90 ? 'text-accent-emerald' : score >= 70 ? 'text-accent-cyan' : 'text-accent-pink';
        return (
          <span className={`text-[12px] font-bold font-mono ${color}`}>
            {score}
          </span>
        );
      },
      size: 70,
    },
    {
      id: 'updatedAt',
      accessorKey: 'updatedAt',
      header: 'Last Edited',
      cell: ({ row }) => (
        <span className="text-[11px] text-stone font-mono">
          {new Date(row.original.updatedAt).toLocaleDateString()}
        </span>
      ),
      size: 110,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <Link href={`/admin/projects/edit/${item.id}`}>
              <Button variant="ghost" className="p-1.5 h-7">
                <FileCheck className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <div className="relative group">
              <Button variant="ghost" className="p-1.5 h-7">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
              <div className="absolute right-0 top-7 w-32 rounded-lg bg-onyx border border-white/10 p-1 opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-45 shadow-premium">
                <button 
                  onClick={() => handleDuplicate(item)} 
                  className="w-full text-left px-2.5 py-1.5 text-[11px] text-stone hover:text-warm-white hover:bg-white/5 rounded flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  Duplicate
                </button>
                <Link href={`/admin/projects/history/${item.id}`} className="block">
                  <button className="w-full text-left px-2.5 py-1.5 text-[11px] text-stone hover:text-warm-white hover:bg-white/5 rounded flex items-center gap-2 cursor-pointer">
                    <History className="w-3 h-3" />
                    History
                  </button>
                </Link>
                <button 
                  onClick={() => handleDelete(item.id, true)} 
                  className="w-full text-left px-2.5 py-1.5 text-[11px] text-stone hover:text-warm-white hover:bg-white/5 rounded flex items-center gap-2 cursor-pointer"
                >
                  <Archive className="w-3 h-3" />
                  Archive
                </button>
                <button 
                  onClick={() => handleDelete(item.id, false)} 
                  className="w-full text-left px-2.5 py-1.5 text-[11px] text-accent-red hover:bg-accent-red/5 rounded flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      },
      size: 90,
    }
  ], [router]);

  const table = useReactTable({
    data: dataList,
    columns,
    state: {
      rowSelection,
      columnVisibility,
      columnOrder,
      sorting,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: row => row.id,
  });

  // Table Virtualization for massive row sets
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 52, // Estimated height of table row in px
    overscan: 20,
  });

  const selectedCount = Object.keys(rowSelection).filter(k => rowSelection[k]).length;

  // Custom Saved view triggers
  const setSavedView = (view: 'all' | 'published' | 'drafts' | 'high_seo') => {
    if (view === 'all') {
      setStatusFilter('');
      setCategoryFilter('');
    } else if (view === 'published') {
      setStatusFilter('published');
    } else if (view === 'drafts') {
      setStatusFilter('draft');
    } else if (view === 'high_seo') {
      setStatusFilter('');
      // Trigger sort by seo
      setSorting([{ id: 'seoScore', desc: true }]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 z-55 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-premium backdrop-blur-md
              ${toast.type === 'success' 
                ? 'bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald' 
                : 'bg-accent-pink/10 border-accent-pink/20 text-accent-pink'
              }
            `}
          >
            {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-[12px] font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-accent-cyan tracking-[0.2em] uppercase">
            CMS Workspace
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-warm-white">
            Projects Manager
          </h1>
          <p className="text-[13px] text-stone font-light">
            Search, filter, edit metadata configurations, and execute publications across your content repositories.
          </p>
        </div>

        <Link href="/admin/projects/create">
          <Button variant="primary" className="text-[12px] py-2">
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </Button>
        </Link>
      </div>

      {/* Search & Filter Controls Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-charcoal/20 border border-white/5 rounded-xl p-4">
        
        {/* Instant debounced search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
          <input
            type="text"
            placeholder="Search projects by title, slug, content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[12px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none focus:border-white/20 transition-all placeholder:text-stone/50"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-warm-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter selects */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-charcoal/40 border border-white/5 hover:border-white/10 rounded-lg text-[12px] px-3 py-2 text-stone hover:text-warm-white outline-none cursor-pointer appearance-none pr-8 transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-charcoal/40 border border-white/5 hover:border-white/10 rounded-lg text-[12px] px-3 py-2 text-stone hover:text-warm-white outline-none cursor-pointer appearance-none pr-8 transition-colors"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone pointer-events-none" />
          </div>

          {/* View Toggles */}
          <div className="flex items-center bg-charcoal/40 border border-white/5 rounded-lg p-0.5 shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md cursor-pointer ${viewMode === 'list' ? 'bg-white/10 text-warm-white' : 'text-stone hover:text-warm-white'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md cursor-pointer ${viewMode === 'grid' ? 'bg-white/10 text-warm-white' : 'text-stone hover:text-warm-white'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`p-1.5 rounded-md cursor-pointer ${viewMode === 'compact' ? 'bg-white/10 text-warm-white' : 'text-stone hover:text-warm-white'}`}
              title="Compact Row View"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Saved Views Toolbar */}
      <div className="flex items-center justify-between text-[11px] text-stone">
        <div className="flex items-center gap-3">
          <span className="font-semibold uppercase tracking-wider">Quick Views:</span>
          <button onClick={() => setSavedView('all')} className="hover:text-warm-white transition-colors cursor-pointer">All Projects</button>
          <span className="text-white/10">•</span>
          <button onClick={() => setSavedView('published')} className="hover:text-warm-white transition-colors cursor-pointer">Active Published</button>
          <span className="text-white/10">•</span>
          <button onClick={() => setSavedView('drafts')} className="hover:text-warm-white transition-colors cursor-pointer">Draft Items</button>
          <span className="text-white/10">•</span>
          <button onClick={() => setSavedView('high_seo')} className="hover:text-warm-white transition-colors cursor-pointer">Top SEO Scores</button>
        </div>

        {selectedCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 bg-accent-violet/10 border border-accent-violet/20 px-3 py-1 rounded-lg text-accent-violet"
          >
            <span>{selectedCount} selected</span>
            <button onClick={handleBulkArchive} className="hover:text-warm-white flex items-center gap-1 cursor-pointer">
              <Archive className="w-3.5 h-3.5" />
              <span>Archive</span>
            </button>
            <button onClick={handleBulkExport} className="hover:text-warm-white flex items-center gap-1 cursor-pointer">
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* Table Container Section */}
      <AnimatePresence mode="wait">
        {viewMode === 'list' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border border-white/5 rounded-2xl bg-charcoal/10 overflow-hidden relative"
          >
            <div 
              ref={tableContainerRef}
              className="h-[520px] overflow-y-auto custom-scrollbar"
            >
              <table className="w-full border-collapse text-left text-[12px] text-stone">
                <thead className="bg-charcoal/20 border-b border-white/5 sticky top-0 z-10">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th 
                          key={header.id} 
                          className="py-3 px-4 font-semibold text-stone uppercase tracking-wider text-[10px]"
                          style={{ width: header.getSize() }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody 
                  style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}
                  className="divide-y divide-white/5"
                >
                  {rowVirtualizer.getVirtualItems().map(virtualRow => {
                    const row = rows[virtualRow.index];
                    return (
                      <tr 
                        key={row.id}
                        className={`hover:bg-white/[0.01] transition-colors absolute w-full flex items-center`}
                        style={{
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                          top: 0,
                          left: 0,
                        }}
                      >
                        {row.getVisibleCells().map(cell => (
                          <td 
                            key={cell.id} 
                            className="py-2.5 px-4 truncate flex items-center justify-start h-full"
                            style={{ width: cell.column.getSize() }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center py-20 space-y-3">
                      <FolderDot className="w-12 h-12 text-stone/40" />
                      <div className="text-center">
                        <h4 className="text-[13px] font-bold text-warm-white">No projects found</h4>
                        <p className="text-[11px] text-stone">Try tweaking your search term or category filters.</p>
                      </div>
                    </div>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {viewMode === 'grid' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {dataList.map((project) => (
              <Card key={project.id} className="flex flex-col justify-between h-[300px] border-white/5 hover:border-white/12 group relative overflow-hidden">
                <div className="space-y-4">
                  {/* Thumbnail / Cover */}
                  <div className="h-28 -mx-5 -mt-5 bg-charcoal/20 border-b border-white/5 relative overflow-hidden">
                    {project.coverImage ? (
                      <img 
                        src={project.coverImage} 
                        alt={project.title} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone/40 font-mono text-[11px]">
                        CMS Project Shell
                      </div>
                    )}
                    <span className={`absolute top-3 right-3 text-[9px] px-2 py-0.5 border rounded-full font-bold uppercase tracking-wider bg-onyx/80 backdrop-blur-sm
                      ${project.status === 'published' 
                        ? 'border-accent-emerald/20 text-accent-emerald'
                        : 'border-white/10 text-stone'
                      }
                    `}>
                      {project.status}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono text-accent-cyan uppercase tracking-wider">{project.category || 'general'}</span>
                    <h3 className="text-[14px] font-extrabold text-warm-white leading-tight truncate max-w-full">
                      {project.title}
                    </h3>
                    <p className="text-[11px] text-stone line-clamp-2 leading-relaxed">
                      {project.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                {/* Card Footer Info */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-4 text-[10px] text-stone">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {project.views.toLocaleString()}
                    </span>
                    <span className="font-mono text-accent-cyan">
                      SEO: {project.seoScore}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/admin/projects/edit/${project.id}`}>
                      <Button variant="secondary" className="px-2.5 py-1 text-[10px]">
                        Edit
                      </Button>
                    </Link>
                    <button 
                      onClick={() => handleDuplicate(project)} 
                      className="p-1 rounded hover:bg-white/5 border border-transparent text-stone hover:text-warm-white cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}

            {dataList.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-3 border border-dashed border-white/5 rounded-2xl">
                <FolderDot className="w-12 h-12 text-stone/40" />
                <div className="text-center">
                  <h4 className="text-[13px] font-bold text-warm-white">No projects found</h4>
                  <p className="text-[11px] text-stone">Try tweaking your search term or category filters.</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {viewMode === 'compact' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5 bg-charcoal/10"
          >
            {dataList.map(proj => (
              <div key={proj.id} className="flex items-center justify-between p-3.5 hover:bg-white/[0.01] transition-colors text-[12px]">
                <div className="flex items-center gap-6 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0
                    ${proj.status === 'published' ? 'bg-accent-emerald' : 'bg-stone'}
                  `} />
                  <div className="truncate space-y-0.5">
                    <span className="font-bold text-warm-white">{proj.title}</span>
                    <span className="text-[10px] text-stone block font-mono">/{proj.slug}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-[11px] text-stone shrink-0">
                  <span className="font-mono bg-white/5 px-2 py-0.5 border border-white/5 rounded text-[10px] text-stone uppercase tracking-wide">
                    {proj.category || 'general'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {proj.views.toLocaleString()}
                  </span>
                  <span className="font-mono text-accent-cyan font-bold">
                    SEO: {proj.seoScore}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Link href={`/admin/projects/edit/${proj.id}`}>
                      <Button variant="ghost" className="p-1 h-6">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {dataList.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <FolderDot className="w-12 h-12 text-stone/40" />
                <div className="text-center">
                  <h4 className="text-[13px] font-bold text-warm-white">No projects found</h4>
                  <p className="text-[11px] text-stone">Try tweaking your search term or category filters.</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
