import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Plus, UserPlus, Lock, FileText, Activity } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { usersApi, auditApi } from '../../services/api';

export const AdminManagement = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'audit'
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'DeliveryPlus2026!',
    role: 'sales_rep',
    department: 'Sales',
    phone: ''
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: usersApi.getAll
  });

  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ['admin-audit'],
    queryFn: () => auditApi.getAll({ limit: 50 }),
    enabled: activeTab === 'audit'
  });

  const createUserMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsAddUserOpen(false);
      setFormData({
        name: '',
        email: '',
        password: 'DeliveryPlus2026!',
        role: 'sales_rep',
        department: 'Sales',
        phone: ''
      });
    }
  });

  const toggleUserActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => usersApi.update(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] })
  });

  const users = usersData?.data || [];
  const auditLogs = auditData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-brand-teal" />
            <span>Admin Management &amp; Security</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Role-based access control, employee accounts, and immutable compliance logs.
          </p>
        </div>

        {activeTab === 'users' && (
          <Button onClick={() => setIsAddUserOpen(true)} className="bg-brand-teal text-white">
            <UserPlus className="w-4 h-4 mr-1.5" />
            <span>+ Add Staff Member</span>
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-brand-teal text-brand-teal'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Staff &amp; Roles</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 font-bold">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-brand-teal text-brand-teal'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Security Audit Trail</span>
        </button>
      </div>

      {activeTab === 'users' ? (
        <Card className="overflow-hidden">
          {usersLoading ? (
            <div className="p-6">
              <LoadingSkeleton count={4} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <th className="px-6 py-3.5">User</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Department</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Last Login</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        <div>{u.name}</div>
                        <div className="text-xs text-slate-400 font-normal">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200/60">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">{u.department}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleUserActiveMutation.mutate({ id: u._id, isActive: !u.isActive })}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                        >
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {auditLoading ? (
            <div className="p-6">
              <LoadingSkeleton count={6} />
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No audit records logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Timestamp</th>
                    <th className="px-6 py-3.5">Actor</th>
                    <th className="px-6 py-3.5">Action</th>
                    <th className="px-6 py-3.5">Entity</th>
                    <th className="px-6 py-3.5">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-3 text-slate-500 font-sans">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 font-semibold text-slate-800 font-sans">
                        {log.actor?.name || 'System'} ({log.actor?.role || 'Daemon'})
                      </td>
                      <td className="px-6 py-3 font-bold text-brand-teal">
                        {log.action}
                      </td>
                      <td className="px-6 py-3 text-slate-600 font-sans">
                        {log.entityType}
                      </td>
                      <td className="px-6 py-3 text-slate-400">
                        {log.ip || '127.0.0.1'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Add Staff Member Modal */}
      <Modal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} title="Create Staff Account">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createUserMutation.mutate(formData);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              >
                <option value="sales_rep">Sales Representative</option>
                <option value="manager">Sales / Operations Manager</option>
                <option value="support_agent">Support Agent</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="secondary" onClick={() => setIsAddUserOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createUserMutation.isPending}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
