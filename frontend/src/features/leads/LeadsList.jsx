import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, RefreshCw, UserCheck, Trash2, ArrowRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { leadsApi } from '../../services/api';

export const LeadsList = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [page, setPage] = useState(1);
  const [selectedLeadForConvert, setSelectedLeadForConvert] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    title: '',
    estimatedValue: 5000,
    source: 'website',
    notes: ''
  });

  const { data, isLoading } = useQuery({
    queryKey: ['leads', { search, status, source, page }],
    queryFn: () => leadsApi.getAll({ search, status, source, page, limit: 10 })
  });

  const createMutation = useMutation({
    mutationFn: leadsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setIsCreateOpen(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        companyName: '',
        title: '',
        estimatedValue: 5000,
        source: 'website',
        notes: ''
      });
    }
  });

  const convertMutation = useMutation({
    mutationFn: leadsApi.convert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      setSelectedLeadForConvert(null);
      alert('Lead successfully converted into Contact, Company and Pipeline Opportunity!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: leadsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] })
  });

  const leads = data?.data || [];
  const meta = data?.meta || { page: 1, pages: 1, total: 0 };

  const handleConvert = (lead) => {
    setSelectedLeadForConvert(lead);
  };

  const confirmConvert = () => {
    if (selectedLeadForConvert) {
      convertMutation.mutate(selectedLeadForConvert._id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Lead Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Capture, score, qualify, and convert inbound enterprise prospects.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-brand-teal text-white">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>+ Add New Lead</span>
        </Button>
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute w-4 h-4 text-slate-400 left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by lead name, company, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
            </select>

            <select
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
            >
              <option value="">All Sources</option>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="advertisement">Advertisement</option>
              <option value="cold_call">Cold Call</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Leads Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton count={5} />
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No leads found matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Lead Name</th>
                  <th className="px-6 py-3.5">Company / Account</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Source</th>
                  <th className="px-6 py-3.5">Score</th>
                  <th className="px-6 py-3.5">Est. Value</th>
                  <th className="px-6 py-3.5">Owner</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div>{lead.firstName} {lead.lastName}</div>
                      <div className="text-xs text-slate-400 font-normal">{lead.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {lead.companyName || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={lead.status}>{lead.status}</Badge>
                    </td>
                    <td className="px-6 py-4 capitalize text-slate-600 text-xs">
                      {lead.source}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200/60 text-xs">
                        {lead.leadScore || 10}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ${(lead.estimatedValue || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {lead.owner?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!lead.isConverted ? (
                          <button
                            onClick={() => handleConvert(lead)}
                            title="Convert to Opportunity"
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Convert</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Converted</span>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm('Archive this lead?')) {
                              deleteMutation.mutate(lead._id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {meta.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Page {meta.page} of {meta.pages} ({meta.total} records)
            </span>
            <div className="flex gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                disabled={meta.page <= 1}
                onClick={() => setPage(meta.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={meta.page >= meta.pages}
                onClick={() => setPage(meta.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Convert Lead Confirmation Modal */}
      <Modal
        isOpen={!!selectedLeadForConvert}
        onClose={() => setSelectedLeadForConvert(null)}
        title="Convert Lead into Customer & Deal"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Converting <strong>{selectedLeadForConvert?.firstName} {selectedLeadForConvert?.lastName}</strong> will automatically:
          </p>
          <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside bg-slate-50 p-4 rounded-xl border border-slate-200">
            <li>Create a new Contact profile with communication info</li>
            <li>Create/Link Company account for <strong>{selectedLeadForConvert?.companyName || 'Associated Enterprise'}</strong></li>
            <li>Create a Pipeline Opportunity in <strong>Discovery</strong> stage with value <strong>${(selectedLeadForConvert?.estimatedValue || 0).toLocaleString()}</strong></li>
            <li>Mark this lead as officially Converted and preserve full audit history</li>
          </ul>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => setSelectedLeadForConvert(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={convertMutation.isPending}
              onClick={confirmConvert}
            >
              Confirm Conversion
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Lead Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Inbound Lead"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(formData);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Value ($)</label>
              <input
                type="number"
                min="0"
                value={formData.estimatedValue}
                onChange={(e) => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Source</label>
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
            >
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="advertisement">Advertisement</option>
              <option value="cold_call">Cold Call</option>
              <option value="social">Social Media</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
              Save Lead
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
