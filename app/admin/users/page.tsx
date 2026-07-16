'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  RefreshCw, 
  Mail, 
  Search, 
  ArrowLeft,
  Crown
} from 'lucide-react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui/core';
import { getAllUsersAction, moderateUserAction } from '@/lib/actions/moderation';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [modifyingId, setModifyingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllUsersAction();
      if (res.success) {
        setUsers(res.users || []);
      } else {
        setError(res.error || 'Failed to fetch user directory.');
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (userId: string, actionType: 'verify' | 'suspend' | 'activate' | 'change_role', payload?: any) => {
    setModifyingId(userId);
    try {
      const res = await moderateUserAction(userId, actionType, payload);
      if (res.success) {
        // Refetch users to get updated database state
        await fetchUsers();
      } else {
        alert(res.error || 'Failed to apply moderation action.');
      }
    } catch (err) {
      alert('A network error occurred.');
    } finally {
      setModifyingId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.username || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 pb-12 font-sans text-warm-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div className="space-y-1.5">
          <Link href="/admin" className="flex items-center gap-1 text-[11px] text-stone hover:text-warm-white font-mono uppercase tracking-wider">
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-warm-white flex items-center gap-2.5">
            <Users className="w-8 h-8 text-accent-cyan" />
            <span>Users Directory</span>
          </h1>
          <p className="text-[13px] text-stone font-light">
            Manage registered creator permissions, enforce verification states, and suspend accounts.
          </p>
        </div>

        <Button 
          variant="secondary" 
          onClick={fetchUsers} 
          disabled={loading}
          className="text-[11px] py-1.5 px-3 flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-[10px] text-stone uppercase tracking-wider font-semibold">Total Users</span>
          <span className="block text-2xl font-black font-mono mt-1">{users.length}</span>
        </Card>
        <Card className="p-4">
          <span className="text-[10px] text-stone uppercase tracking-wider font-semibold">Verified Creators</span>
          <span className="block text-2xl font-black font-mono mt-1 text-accent-emerald">
            {users.filter(u => u.emailVerified !== null).length}
          </span>
        </Card>
        <Card className="p-4">
          <span className="text-[10px] text-stone uppercase tracking-wider font-semibold">Suspended</span>
          <span className="block text-2xl font-black font-mono mt-1 text-accent-pink">
            {users.filter(u => u.status === 'disabled').length}
          </span>
        </Card>
        <Card className="p-4">
          <span className="text-[10px] text-stone uppercase tracking-wider font-semibold">Admins</span>
          <span className="block text-2xl font-black font-mono mt-1 text-accent-violet">
            {users.filter(u => u.role === 'admin').length}
          </span>
        </Card>
      </div>

      {/* Search and Table */}
      <Card className="p-6 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-stone absolute left-3 top-3" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name, email, or handle..."
            className="w-full bg-charcoal/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-warm-white outline-none focus:border-white/10"
          />
        </div>

        {error && (
          <div className="p-3 bg-accent-pink/10 border border-accent-pink/20 text-accent-pink text-[12px] rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5 text-stone text-[10px] uppercase font-mono font-bold">
                <th className="py-2.5">User</th>
                <th className="py-2.5">Username</th>
                <th className="py-2.5">Role</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5">Email Status</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[12.5px] font-light">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-accent-cyan" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-stone font-light">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors">
                    <td className="py-3">
                      <div>
                        <div className="font-bold text-warm-white flex items-center gap-1.5">
                          {u.name || 'No Name'}
                          {u.role === 'admin' && <Crown className="w-3 h-3 text-accent-cyan" />}
                        </div>
                        <div className="text-[11px] text-stone font-mono">{u.email}</div>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-stone">@{u.username || 'n/a'}</td>
                    <td className="py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        u.role === 'admin' 
                          ? 'bg-accent-cyan/10 text-accent-cyan' 
                          : 'bg-stone/10 text-stone'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        u.status === 'active' 
                          ? 'bg-accent-emerald/10 text-accent-emerald' 
                          : 'bg-accent-pink/10 text-accent-pink'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {u.emailVerified ? (
                        <span className="text-accent-emerald font-mono text-[11px] font-bold">✓ Verified</span>
                      ) : (
                        <span className="text-accent-pink font-mono text-[11px] font-bold">Pending</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        {/* Verify button */}
                        {!u.emailVerified && (
                          <Button 
                            variant="secondary"
                            disabled={modifyingId !== null}
                            onClick={() => handleAction(u.id, 'verify')}
                            className="text-[10px] py-1 px-2.5 flex items-center gap-1"
                          >
                            <UserCheck className="w-3 h-3 text-accent-emerald" />
                            <span>Verify</span>
                          </Button>
                        )}

                        {/* Suspend / Activate button */}
                        {u.status === 'active' ? (
                          <Button 
                            variant="secondary"
                            disabled={modifyingId !== null || u.role === 'admin'}
                            onClick={() => handleAction(u.id, 'suspend')}
                            className="text-[10px] py-1 px-2.5 flex items-center gap-1 hover:bg-accent-pink/10 hover:text-accent-pink"
                          >
                            <UserX className="w-3 h-3" />
                            <span>Suspend</span>
                          </Button>
                        ) : (
                          <Button 
                            variant="secondary"
                            disabled={modifyingId !== null}
                            onClick={() => handleAction(u.id, 'activate')}
                            className="text-[10px] py-1 px-2.5 flex items-center gap-1 hover:bg-accent-emerald/10 hover:text-accent-emerald"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Activate</span>
                          </Button>
                        )}

                        {/* Role toggle button */}
                        <Button 
                          variant="secondary"
                          disabled={modifyingId !== null || u.id === 'usr_admin'} // Prevent demoting core admin
                          onClick={() => handleAction(u.id, 'change_role', { role: u.role === 'admin' ? 'user' : 'admin' })}
                          className="text-[10px] py-1 px-2.5 flex items-center gap-1"
                        >
                          <Crown className="w-3 h-3 text-stone" />
                          <span>Toggle Role</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
