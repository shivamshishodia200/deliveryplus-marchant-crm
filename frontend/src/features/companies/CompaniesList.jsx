import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Building2, MapPin, DollarSign, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { companiesApi } from '../../services/api';

export const CompaniesList = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    industry: 'Logistics & Supply Chain',
    website: '',
    phone: '',
    annualRevenue: 5000000,
    employeeCount: 150,
    tier: 'gold',
    status: 'active_client',
    city: 'Atlanta',
    state: 'GA'
  });

  const { data, isLoading } = useQuery({
    queryKey: ['companies', { search, page }],
    queryFn: () => companiesApi.getAll({ search, page, limit: 10 })
  });

  const createMutation = useMutation({
    mutationFn: (data) =>
      companiesApi.create({
        ...data,
        address: { city: data.city, state: data.state }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsCreateOpen(false);
      setFormData({
        name: '',
        industry: 'Logistics & Supply Chain',
        website: '',
        phone: '',
        annualRevenue: 5000000,
        employeeCount: 150,
        tier: 'gold',
        status: 'active_client',
        city: 'Atlanta',
        state: 'GA'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: companiesApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] })
  });

  const companies = data?.data || [];
  const meta = data?.meta || { page: 1, pages: 1, total: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Enterprise Accounts</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Corporate organizations, freight partners, and moving contracts.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-brand-teal text-white">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>+ Add Company</span>
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute w-4 h-4 text-slate-400 left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search companies by name, industry, city..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton count={5} />
          </div>
        ) : companies.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No companies found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Company Name</th>
                  <th className="px-6 py-3.5">Industry</th>
                  <th className="px-6 py-3.5">Tier</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Annual Rev.</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.map((company) => (
                  <tr key={company._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-brand-teal flex items-center justify-center font-bold text-xs">
                          {company.name.charAt(0)}
                        </div>
                        <div>
                          <div>{company.name}</div>
                          {company.website && (
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-brand-teal hover:underline font-normal"
                            >
                              {company.website.replace('https://', '')}
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 text-xs">
                      {company.industry}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          company.tier === 'platinum'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : company.tier === 'gold'
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {company.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {company.address?.city ? `${company.address.city}, ${company.address.state || 'USA'}` : '—'}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 text-xs">
                      ${(company.annualRevenue || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={company.status}>{company.status.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm('Archive this company?')) {
                            deleteMutation.mutate(company._id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 text-xs text-slate-500">
            <span>Page {meta.page} of {meta.pages}</span>
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

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Enterprise Account"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(formData);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Account Tier</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              >
                <option value="standard">Standard</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Annual Revenue ($)</label>
              <input
                type="number"
                min="0"
                value={formData.annualRevenue}
                onChange={(e) => setFormData({ ...formData, annualRevenue: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lifecycle Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              >
                <option value="prospect">Prospect</option>
                <option value="active_client">Active Client</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
              Save Company
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
