import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Kanban,
  Table as TableIcon,
  DollarSign,
  Calendar,
  Building2
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { opportunitiesApi, companiesApi } from '../../services/api';

const STAGES = [
  { key: 'discovery', label: 'Discovery', color: 'border-t-teal-500' },
  { key: 'qualification', label: 'Qualification', color: 'border-t-blue-500' },
  { key: 'proposal', label: 'Proposal', color: 'border-t-purple-500' },
  { key: 'negotiation', label: 'Negotiation', color: 'border-t-amber-500' },
  { key: 'closed_won', label: 'Closed Won', color: 'border-t-emerald-500' },
  { key: 'closed_lost', label: 'Closed Lost', color: 'border-t-rose-500' }
];

export const OpportunitiesBoard = () => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    amount: 15000,
    stage: 'discovery',
    probability: 20,
    priority: 'medium',
    expectedCloseDate: ''
  });

  const { data, isLoading } = useQuery({
    queryKey: ['opportunities-kanban'],
    queryFn: opportunitiesApi.getKanban
  });

  const { data: companiesData } = useQuery({
    queryKey: ['companies-dropdown'],
    queryFn: () => companiesApi.getAll({ limit: 100 })
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage }) => opportunitiesApi.updateStage(id, { stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities-kanban'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    }
  });

  const createMutation = useMutation({
    mutationFn: opportunitiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities-kanban'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setIsCreateOpen(false);
      setFormData({
        title: '',
        company: '',
        amount: 15000,
        stage: 'discovery',
        probability: 20,
        priority: 'medium',
        expectedCloseDate: ''
      });
    }
  });

  const kanban = data?.data?.kanban || {};
  const totalPipeline = data?.data?.totalPipelineValue || 0;
  const totalDeals = data?.data?.totalDeals || 0;
  const companies = companiesData?.data || [];

  const handleStageMove = (dealId, currentStage, targetStage) => {
    updateStageMutation.mutate({ id: dealId, stage: targetStage });
  };

  return (
    <div className="space-y-6">
      {/* Title & Pipeline Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sales Pipeline</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Total Pipeline Value: <strong className="text-slate-800">${totalPipeline.toLocaleString()}</strong> across {totalDeals} deals
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex rounded-xl bg-slate-200/80 p-1 text-slate-600">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <Button onClick={() => setIsCreateOpen(true)} className="bg-brand-teal text-white">
            <Plus className="w-4 h-4 mr-1.5" />
            <span>+ New Deal</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={3} className="h-44" />
      ) : viewMode === 'kanban' ? (
        /* Kanban Columns Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
          {STAGES.map((col) => {
            const stageInfo = kanban[col.key] || { items: [], totalAmount: 0, count: 0 };
            return (
              <div
                key={col.key}
                className={`bg-slate-100/80 rounded-2xl p-3 border-t-4 border border-slate-200/80 ${col.color}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{col.label}</span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      ${stageInfo.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                    {stageInfo.count}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-3 min-h-[120px]">
                  {stageInfo.items.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 italic">No deals</div>
                  ) : (
                    stageInfo.items.map((deal) => (
                      <Card
                        key={deal._id}
                        className="p-3.5 hover:shadow-md transition-shadow bg-white text-xs space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold text-slate-900 leading-tight">
                            {deal.title}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600 flex-shrink-0">
                            {deal.priority}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{deal.company?.name || 'Client Corp'}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-sm font-extrabold text-slate-900">
                            ${(deal.amount || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-1.5 py-0.5 rounded">
                            {deal.probability}% win
                          </span>
                        </div>

                        {/* Stage Transition Quick Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-1">
                          {col.key !== 'discovery' && (
                            <button
                              onClick={() => {
                                const idx = STAGES.findIndex((s) => s.key === col.key);
                                if (idx > 0) handleStageMove(deal._id, col.key, STAGES[idx - 1].key);
                              }}
                              className="text-[10px] text-slate-500 hover:text-slate-800 font-semibold"
                            >
                              ← Back
                            </button>
                          )}
                          <div className="flex-1" />
                          {col.key !== 'closed_won' && col.key !== 'closed_lost' && (
                            <button
                              onClick={() => {
                                const idx = STAGES.findIndex((s) => s.key === col.key);
                                if (idx < STAGES.length - 2) handleStageMove(deal._id, col.key, STAGES[idx + 1].key);
                              }}
                              className="px-2 py-0.5 rounded bg-brand-teal text-white text-[10px] font-bold hover:bg-brand-teal-hover flex items-center gap-0.5"
                            >
                              <span>Next</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Deal Title</th>
                  <th className="px-6 py-3.5">Associated Company</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Stage</th>
                  <th className="px-6 py-3.5">Probability</th>
                  <th className="px-6 py-3.5">Owner</th>
                  <th className="px-6 py-3.5 text-right">Move Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {STAGES.flatMap((col) => kanban[col.key]?.items || []).map((deal) => (
                  <tr key={deal._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{deal.title}</td>
                    <td className="px-6 py-4 text-slate-700">{deal.company?.name || '—'}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ${(deal.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={deal.stage}>{deal.stage.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700">{deal.probability}%</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{deal.owner?.name || 'Staff'}</td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={deal.stage}
                        onChange={(e) => handleStageMove(deal._id, deal.stage, e.target.value)}
                        className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
                      >
                        {STAGES.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Opportunity Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Opportunity"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(formData);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Deal Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Apex Q4 Moving Contract"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company *</label>
              <select
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              >
                <option value="">Select Company</option>
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Deal Amount ($) *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              >
                {STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
              Create Opportunity
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
