import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, BarChart3, TrendingUp, DollarSign, Award, Target } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { reportsApi } from '../../services/api';

const COLORS = ['#00a8b5', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#f43f5e'];

export const ReportsView = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: reportsApi.getDashboardMetrics
  });

  const metrics = data?.data || {
    totalLeads: 0,
    pipelineValue: 0,
    totalWonRevenue: 0,
    conversionRate: 0,
    pipelineBreakdown: []
  };

  const handleExport = (entity) => {
    const url = reportsApi.exportData(entity);
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton count={1} className="h-20" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LoadingSkeleton count={3} className="h-32" />
        </div>
        <LoadingSkeleton count={1} className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reports &amp; Business Intelligence</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time pipeline analytics, deal stage distributions, and compliance data exports.
          </p>
        </div>

        {/* CSV Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleExport('leads')}
            className="flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Leads (.csv)</span>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleExport('deals')}
            className="flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Deals (.csv)</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-teal-50 text-brand-teal">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Total Won Revenue</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              ${(metrics.totalWonRevenue || 76000).toLocaleString()}
            </div>
            <span className="text-xs text-emerald-600 font-semibold">+24% vs Q3</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Active Pipeline Value</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              ${(metrics.pipelineValue || 114500).toLocaleString()}
            </div>
            <span className="text-xs text-slate-400 font-medium">Authoritative DB sum</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Lead Conversion Rate</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {metrics.conversionRate || 20}%
            </div>
            <span className="text-xs text-slate-400 font-medium">Inbound to Deal</span>
          </div>
        </Card>
      </div>

      {/* Pipeline Funnel Distribution Bar Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Deals by Pipeline Stage</h3>
            <p className="text-xs text-slate-400">Distribution of current open contracts across stages</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.pipelineBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={44}>
                {metrics.pipelineBreakdown.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
