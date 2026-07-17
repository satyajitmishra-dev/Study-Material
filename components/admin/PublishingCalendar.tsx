'use client';

import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  FileText, 
  Archive,
  RefreshCw,
  Calendar as CalendarIcon
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/components/ui/core';
import { executeScheduledPublishAction } from '@/lib/actions/cms';

interface CalendarProject {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
}

interface PublishingCalendarProps {
  initialProjects: CalendarProject[];
}

export default function PublishingCalendar({ initialProjects }: PublishingCalendarProps) {
  const router = useRouter();
  
  // Date Navigation State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isProcessing, setIsProcessing] = useState(false);

  // Month details helper
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate calendar days for the grid
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // Day of week for 1st of month (0-6)
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: { date: Date; isCurrentMonth: boolean }[] = [];

    // Prev month overflow cells
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        date: new Date(year, month - 1, totalDaysInPrevMonth - i),
        isCurrentMonth: false
      });
    }

    // Current month cells
    for (let i = 1; i <= totalDaysInMonth; i++) {
      cells.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    // Next month overflow cells (fill grid to complete 6 rows = 42 cells)
    const remainingCellsCount = 42 - cells.length;
    for (let i = 1; i <= remainingCellsCount; i++) {
      cells.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return cells;
  }, [year, month]);

  // Map projects to their release dates
  const projectsByDateString = useMemo(() => {
    const mapping: Record<string, CalendarProject[]> = {};

    initialProjects.forEach(p => {
      // Prioritize scheduled date, fall back to published, then created
      const targetDateStr = p.scheduledAt || p.publishedAt || p.createdAt;
      if (!targetDateStr) return;

      const dateKey = new Date(targetDateStr).toDateString();
      if (!mapping[dateKey]) {
        mapping[dateKey] = [];
      }
      mapping[dateKey].push(p);
    });

    return mapping;
  }, [initialProjects]);

  // Prev / Next month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Run publication queue trigger
  const runQueueProcessor = async () => {
    setIsProcessing(true);
    try {
      const res = await executeScheduledPublishAction();
      if (res.success && res.count && res.count > 0) {
        alert(`Successfully released ${res.count} scheduled project(s)!`);
        router.refresh();
      } else {
        alert('All scheduled releases are up to date.');
      }
    } catch (e) {
      alert('Error triggering scheduled publishes.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      
      {/* Calendar Header Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-extrabold text-warm-white">Publishing Calendar</h1>
          <p className="text-[12px] text-stone">Plan, review, and trigger scheduled content releases across days.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Action Trigger */}
          <Button 
            onClick={runQueueProcessor} 
            variant="accent" 
            className="h-9 text-[11px] font-mono px-3"
            disabled={isProcessing}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>Process Releases</span>
          </Button>

          {/* Month Navigator */}
          <div className="flex items-center bg-charcoal/30 border border-white/5 rounded-xl p-0.5">
            <button 
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white/5 rounded-lg text-stone hover:text-warm-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-[13px] font-bold text-warm-white min-w-[120px] text-center">
              {monthNames[month]} {year}
            </span>
            <button 
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white/5 rounded-lg text-stone hover:text-warm-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend Map */}
      <div className="flex items-center gap-4 flex-wrap text-[11px] font-mono text-stone bg-charcoal/10 border border-white/5 rounded-xl p-3">
        <span className="font-semibold uppercase text-stone/85 mr-2">Release status:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan" />
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-emerald" />
          <span>Published</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-graphite" />
          <span>Draft</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-pink" />
          <span>Archived</span>
        </div>
      </div>

      {/* Monthly Grid Gridboard */}
      <div className="border border-white/5 rounded-2xl overflow-hidden shadow-premium bg-onyx/20">
        
        {/* Days of the week row */}
        <div className="grid grid-cols-7 bg-charcoal/30 border-b border-white/5 py-2.5 text-center text-[10px] font-mono text-stone uppercase tracking-wider">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Day block Cells */}
        <div className="grid grid-cols-7 grid-rows-6 divide-x divide-y divide-white/5 border-l border-t border-white/5">
          {calendarCells.map((cell, index) => {
            const dateStr = cell.date.toDateString();
            const dayProjects = projectsByDateString[dateStr] || [];
            const isToday = new Date().toDateString() === dateStr;

            return (
              <div 
                key={index} 
                className={`min-h-[90px] p-2 flex flex-col justify-between transition-colors relative group
                  ${cell.isCurrentMonth ? 'bg-transparent' : 'bg-charcoal/5 opacity-40'}
                  ${isToday ? 'bg-white/2' : ''}
                `}
              >
                {/* Day number */}
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded
                    ${isToday ? 'bg-accent-cyan text-onyx font-extrabold' : 'text-stone'}
                  `}>
                    {cell.date.getDate()}
                  </span>
                  
                  {dayProjects.length > 0 && (
                    <span className="text-[9px] font-mono text-stone/50 bg-white/5 px-1 rounded">
                      {dayProjects.length} doc(s)
                    </span>
                  )}
                </div>

                {/* Day project list tags */}
                <div className="flex-1 mt-1.5 space-y-1 overflow-y-auto max-h-[60px] custom-scrollbar pr-0.5">
                  {dayProjects.map(proj => {
                    const statusColors = {
                      SCHEDULED: 'bg-accent-cyan/10 border-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/15',
                      PUBLISHED: 'bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald hover:bg-accent-emerald/15',
                      DRAFT: 'bg-graphite/10 border-graphite/20 text-stone hover:bg-graphite/15',
                      ARCHIVED: 'bg-accent-pink/10 border-accent-pink/20 text-accent-pink hover:bg-accent-pink/15'
                    };

                    return (
                      <Link 
                        key={proj.id} 
                        href={`/admin/projects/edit/${proj.id}`}
                        className={`block px-1.5 py-0.5 rounded border text-[9px] truncate font-medium transition-all ${statusColors[proj.status]}`}
                      >
                        {proj.status === 'SCHEDULED' && <Clock className="w-2.5 h-2.5 inline mr-1 shrink-0" />}
                        {proj.status === 'PUBLISHED' && <CheckCircle className="w-2.5 h-2.5 inline mr-1 shrink-0" />}
                        {proj.status === 'DRAFT' && <FileText className="w-2.5 h-2.5 inline mr-1 shrink-0" />}
                        {proj.status === 'ARCHIVED' && <Archive className="w-2.5 h-2.5 inline mr-1 shrink-0" />}
                        <span>{proj.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
