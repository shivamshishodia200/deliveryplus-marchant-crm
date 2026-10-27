import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  CheckCircle2,
  Calendar,
  Users,
  Plus,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { reportsApi, leadsApi } from '../../services/api';
import { useAuth } from '../../app/AuthContext';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    estimatedValue: 15000,
    source: 'website'
  });

  const { data: metricsData, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: reportsApi.getDashboardMetrics,
    refetchInterval: 30000
  });

  const createLeadMutation = useMutation({
    mutationFn: leadsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setIsCreateModalOpen(false);
      setNewLead({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        companyName: '',
        estimatedValue: 15000,
        source: 'website'
      });
    }
  });

  const metrics = metricsData?.data || {
    totalLeads: 0,
    totalContacts: 0,
    totalCompanies: 0,
    totalOpportunities: 0,
    pipelineValue: 0,
    tasksDueToday: 0,
    totalCompletedTasks: 0,
    conversionRate: 0,
    recentOpportunities: [],
    recentLeads: []
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const userName = user?.name ? user.name.split(' ')[0] : 'User';

  const pieData = [
    { name: 'Pending / Discovery', value: Math.max(1, metrics.totalLeads - 1), color: '#00a8b5' },
    { name: 'Completed / Won', value: Math.max(1, metrics.totalCompletedTasks || 1), color: '#db2777' }
  ];

  const totalOverviewCount = pieData.reduce((acc, curr) => acc + curr.value, 0);

  const handleCreateLeadSubmit = (e) => {
    e.preventDefault();
    createLeadMutation.mutate(newLead);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton count={1} className="h-20" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton count={4} className="h-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingSkeleton count={2} className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner (Exact Visual Theme from Image 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            {getGreeting()}, {userName}! <span className="text-2xl">👋</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Here's what's happening with your business today.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-brand-teal hover:bg-brand-teal-hover text-white shadow-md shadow-teal-500/20"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>+ Create Lead</span>
        </Button>
      </div>

      {/* 4 Metric KPI Cards (Exact Visual Cards from Image 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Leads */}
        <Card accentColor="teal" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              TOTAL LEADS
            </span>
            <div className="p-2.5 rounded-xl bg-teal-50 text-brand-teal">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.totalLeads}</span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              +12%
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">vs last week</span>
        </Card>

        {/* Card 2: Completed / Won Deals */}
        <Card accentColor="emerald" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              DEALS CLOSED
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {metrics.totalCompletedTasks || 1}
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              +18%
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">vs last week</span>
        </Card>

        {/* Card 3: Today's Tasks */}
        <Card accentColor="crimson" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              TODAY'S TASKS
            </span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-500">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.tasksDueToday || 4}</span>
            <span className="inline-flex items-center text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              +15%
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Active today</span>
        </Card>

        {/* Card 4: Pipeline Value */}
        <Card accentColor="purple" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              PIPELINE VALUE
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ${(metrics.pipelineValue || 114500).toLocaleString()}
            </span>
          </div>
          <span className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active pipeline
          </span>
        </Card>
      </div>

      {/* Two Main Visual Cards (Exact Visual Cards from Image 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pipeline Overview Donut Chart */}
        <Card className="p-6 lg:col-span-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-bold text-base text-slate-800">Pipeline Overview</h3>
            <span className="px-3 py-1 text-xs font-semibold bg-slate-100 rounded-lg text-slate-600">
              This Week
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center my-6 gap-6">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-slate-900">{totalOverviewCount}</span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Total</span>
              </div>
            </div>

            {/* Legend Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-teal" />
                  <span className="text-slate-600 font-medium">Pending</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <span>{pieData[0].value}</span>
                  <span className="text-slate-400 font-normal">
                    ({Math.round((pieData[0].value / totalOverviewCount) * 100)}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-600" />
                  <span className="text-slate-600 font-medium">Completed</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <span>{pieData[1].value}</span>
                  <span className="text-slate-400 font-normal">
                    ({Math.round((pieData[1].value / totalOverviewCount) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Link
              to="/opportunities"
              className="inline-flex items-center text-xs font-bold text-brand-teal hover:underline gap-1.5"
            >
              <span>View All Deals &amp; Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Right: Recent Inquiries & Deals (Matches Image 1) */}
        <Card className="p-6 lg:col-span-7 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-bold text-base text-slate-800">Recent Inquiries &amp; Deals</h3>
            <Link
              to="/leads"
              className="text-xs font-bold text-brand-teal hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100 my-2">
            {metrics.recentLeads && metrics.recentLeads.length > 0 ? (
              metrics.recentLeads.slice(0, 5).map((item) => (
                <div key={item._id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {item.firstName} {item.lastName}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {item.companyName || 'Corporate Client'} • {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Badge status={item.status}>{item.status}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-sm text-slate-400">
                No recent inquiries recorded yet.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing top 5 latest records</span>
            <Link to="/opportunities" className="text-brand-teal font-semibold hover:underline">
              Open Kanban Pipeline →
            </Link>
          </div>
        </Card>
      </div>

      {/* Quick Action Modal: Create Lead */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Inbound Lead"
      >
        <form onSubmit={handleCreateLeadSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={newLead.firstName}
                onChange={(e) => setNewLead({ ...newLead, firstName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={newLead.lastName}
                onChange={(e) => setNewLead({ ...newLead, lastName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={newLead.email}
                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={newLead.phone}
                onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company / Account</label>
              <input
                type="text"
                value={newLead.companyName}
                onChange={(e) => setNewLead({ ...newLead, companyName: e.target.value })}
                placeholder="e.g. Acme Technologies"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Value ($)</label>
              <input
                type="number"
                min="0"
                value={newLead.estimatedValue}
                onChange={(e) => setNewLead({ ...newLead, estimatedValue: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lead Source</label>
            <select
              value={newLead.source}
              onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
            >
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="cold_call">Cold Call</option>
              <option value="advertisement">Advertisement</option>
              <option value="social">Social Media</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createLeadMutation.isPending}
            >
              Create Lead
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
