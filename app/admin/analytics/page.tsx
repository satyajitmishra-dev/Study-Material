'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Award,
  ArrowUpRight
} from 'lucide-react';
import { Button, Card } from '@/components/ui/core';

// Recharts imports done dynamically/safely
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

// Mock chart data
const VIEWERSHIP_DATA = [
  { name: 'Mon', views: 1200, completions: 400 },
  { name: 'Tue', views: 1800, completions: 520 },
  { name: 'Wed', views: 2400, completions: 680 },
  { name: 'Thu', views: 2100, completions: 610 },
  { name: 'Fri', views: 2800, completions: 850 },
  { name: 'Sat', views: 3400, completions: 1100 },
  { name: 'Sun', views: 3100, completions: 980 },
];

const CATEGORY_PROGRESS = [
  { category: 'React', value: 75, color: '#06b6d4' },
  { category: 'AI', value: 45, color: '#8b5cf6' },
  { category: 'TypeScript', value: 90, color: '#a1a1aa' },
  { category: 'Backend', value: 30, color: '#f97316' },
];

export default function AnalyticsWorkspace() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-6 pt-12 pb-16 space-y-12">
      {/* Back Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push('/admin')} className="h-8 px-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 text-[12px] text-stone">
            <span>Publishing Studio</span>
            <span>/</span>
            <span className="text-warm-white font-medium">Analytics Center</span>
          </div>
        </div>

        <span className="text-[11px] font-mono text-stone bg-charcoal/20 px-2 py-0.5 border border-white/5 rounded">
          Reporting Cycle: Last 7 Days
        </span>
      </div>

      {/* Narrative Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex items-start gap-4 p-5">
          <div className="p-3 rounded-lg bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/10">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] text-stone uppercase tracking-wider font-semibold">Trend Analysis</span>
            <h3 className="text-[15px] font-bold text-warm-white">Completion rate rose by 14%</h3>
            <p className="text-[12px] text-stone leading-relaxed">
              Introduction of the Next.js 16 Compiler lesson generated a surge of active resumes on Wednesday, resulting in higher lesson completions.
            </p>
          </div>
        </Card>

        <Card className="flex items-start gap-4 p-5">
          <div className="p-3 rounded-lg bg-accent-violet/10 text-accent-violet border border-accent-violet/10">
            <Award className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] text-stone uppercase tracking-wider font-semibold">User Milestones</span>
            <h3 className="text-[15px] font-bold text-warm-white">TypeScript is nearing 90% completion</h3>
            <p className="text-[12px] text-stone leading-relaxed">
              Students display exceptionally high engagement with Type-checking modules. We suggest adding advanced compiler configurations next.
            </p>
          </div>
        </Card>
      </div>

      {/* Main Charts Area */}
      {mounted ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Area Chart (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-[12px] font-bold text-warm-white uppercase tracking-wider">
              Student Activity & Progress Streams
            </h3>
            
            <div className="h-[320px] bg-charcoal/10 border border-white/5 rounded-2xl p-6 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={VIEWERSHIP_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#18181b', 
                      borderColor: 'rgba(255,255,255,0.1)', 
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#fafaf9'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    name="Student Views" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorViews)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="completions" 
                    name="Lesson Completions" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCompletions)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar progress charts (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-[12px] font-bold text-warm-white uppercase tracking-wider">
              Engagement By Category
            </h3>
            
            <div className="h-[320px] bg-charcoal/10 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={CATEGORY_PROGRESS} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.02)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="category" 
                    type="category" 
                    stroke="rgba(255,255,255,0.4)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#18181b', 
                      borderColor: 'rgba(255,255,255,0.1)', 
                      borderRadius: '8px',
                      fontSize: '10px'
                    }} 
                  />
                  <Bar dataKey="value" name="Avg Completion %" radius={[0, 4, 4, 0]} barSize={10}>
                    {CATEGORY_PROGRESS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="border-t border-white/5 pt-4 flex justify-between items-center text-[10px] text-stone">
                <span>Top Category: </span>
                <span className="font-mono text-warm-white flex items-center gap-1">
                  TypeScript (90%)
                  <ArrowUpRight className="w-3 h-3 text-accent-cyan" />
                </span>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="h-[360px] flex items-center justify-center text-stone text-[12px]">
          Rendering interactive analytical streams...
        </div>
      )}
    </div>
  );
}
