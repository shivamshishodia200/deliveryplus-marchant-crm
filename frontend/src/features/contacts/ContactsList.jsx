import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Mail, Phone, Building2, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { contactsApi, companiesApi } from '../../services/api';

export const ContactsList = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    department: 'Operations'
  });

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', { search, page }],
    queryFn: () => contactsApi.getAll({ search, page, limit: 10 })
  });

  const { data: companiesData } = useQuery({
    queryKey: ['companies-all'],
    queryFn: () => companiesApi.getAll({ limit: 100 })
  });

  const createMutation = useMutation({
    mutationFn: contactsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setIsCreateOpen(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        jobTitle: '',
        department: 'Operations'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: contactsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] })
  });

  const contacts = data?.data || [];
  const meta = data?.meta || { page: 1, pages: 1, total: 0 };
  const companies = companiesData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Contacts Directory</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Key stakeholders, executive sponsors, and procurement managers.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-brand-teal text-white">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>+ Add Contact</span>
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute w-4 h-4 text-slate-400 left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search contacts by name, email..."
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
        ) : contacts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No contacts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Contact Name</th>
                  <th className="px-6 py-3.5">Associated Company</th>
                  <th className="px-6 py-3.5">Job Title</th>
                  <th className="px-6 py-3.5">Phone &amp; Email</th>
                  <th className="px-6 py-3.5">Owner</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {contact.firstName} {contact.lastName}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {contact.company?.name || 'Independent Client'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      {contact.jobTitle || 'Representative'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{contact.email}</span>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {contact.owner?.name || 'Staff'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm('Archive this contact?')) {
                            deleteMutation.mutate(contact._id);
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
        title="Add New Contact"
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Company</label>
              <select
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Title</label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="e.g. Director of Supply Chain"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
              Save Contact
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
