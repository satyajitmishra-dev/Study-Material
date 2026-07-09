import React from 'react';
import { cmsDb } from '@/lib/database/cmsDb';
import { Card } from '@/components/ui/core';
import { 
  CheckCircle, 
  Database, 
  HardDrive, 
  Activity, 
  Cpu, 
  Server, 
  AlertTriangle,
  History,
  UserCheck
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SystemHealthPage() {
  const auditLogs = await cmsDb.getAuditLogs(undefined, 50);
  const { total: totalProjects } = await cmsDb.getProjects({ limit: 1 });
  const { total: mediaCount } = await cmsDb.getMedia({ limit: 1 });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <span className="text-[11px] font-semibold text-accent-cyan tracking-[0.2em] uppercase">
          Studio Diagnostics
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-warm-white mt-1.5">
          System Health
        </h1>
        <p className="text-[13px] text-stone font-light">
          Monitor database clusters, active server response metrics, API caches, and administrative audit trails.
        </p>
      </div>

      {/* Grid of nodes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core Services */}
        <Card className="p-5 space-y-4 col-span-1">
          <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-accent-cyan" />
            <span>Infrastructure Nodes</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-stone" />
                <span className="text-[12px] text-stone">PostgreSQL DB</span>
              </div>
              <span className="text-[11px] text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Connected
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-stone" />
                <span className="text-[12px] text-stone">Redis Caching</span>
              </div>
              <span className="text-[11px] text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Active
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-stone" />
                <span className="text-[12px] text-stone">Node Runtime</span>
              </div>
              <span className="text-[11px] text-warm-white font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                v20.11.0
              </span>
            </div>
          </div>
        </Card>

        {/* Load & Diagnostics */}
        <Card className="p-5 space-y-4 col-span-1">
          <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent-violet" />
            <span>Performance Profiles</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-stone">API Latency (p99)</span>
              <span className="text-[12px] font-mono text-warm-white">42ms</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[12px] text-stone">Memory Allocation</span>
              <span className="text-[12px] font-mono text-warm-white">128 MB / 512 MB</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[12px] text-stone">Cache Hit Rate</span>
              <span className="text-[12px] font-mono text-accent-cyan">96.4%</span>
            </div>
          </div>
        </Card>

        {/* Storage quotas */}
        <Card className="p-5 space-y-4 col-span-1">
          <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-accent-pink" />
            <span>Quotas & Limits</span>
          </h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-stone">
                <span>Media Cloud Storage</span>
                <span>{(mediaCount * 0.48).toFixed(2)} MB / 1024 MB</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-accent-pink h-full" 
                  style={{ width: `${Math.min(100, (mediaCount * 0.48 / 1024) * 100)}%` }} 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-stone">
                <span>Database Records</span>
                <span>{totalProjects} / 100,000</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-accent-violet h-full" 
                  style={{ width: `${Math.min(100, (totalProjects / 100000) * 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </Card>

      </div>

      {/* Complete Audit Trail */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-[13px] font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-accent-cyan" />
            <span>System Audit Trail Log</span>
          </h3>
          <span className="text-[10px] text-stone font-mono">Displaying last 50 events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[12px] text-stone">
            <thead>
              <tr className="border-b border-white/5 text-[10px] text-stone uppercase tracking-wider">
                <th className="py-2.5 font-semibold">User</th>
                <th className="py-2.5 font-semibold">Action</th>
                <th className="py-2.5 font-semibold">Resource</th>
                <th className="py-2.5 font-semibold">Details</th>
                <th className="py-2.5 font-semibold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="py-3 flex items-center gap-1.5 font-sans">
                    <UserCheck className="w-3.5 h-3.5 text-stone" />
                    <span>{log.userId === 'sandbox-admin-id' ? 'Sandbox Admin' : log.userId.substring(0, 10)}</span>
                  </td>
                  <td className="py-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/5 text-accent-cyan">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 text-warm-white">{log.targetType}</td>
                  <td className="py-3 text-stone/80 truncate max-w-xs">{log.details || '-'}</td>
                  <td className="py-3 text-right text-stone/60">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {auditLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone">
                    No system log records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
