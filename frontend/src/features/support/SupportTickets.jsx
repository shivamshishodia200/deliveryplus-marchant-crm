import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Headphones, MessageSquare, CheckCircle, Clock, Send } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ticketsApi, companiesApi } from '../../services/api';

export const SupportTickets = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    company: '',
    priority: 'high',
    category: 'logistics'
  });

  const { data, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketsApi.getAll()
  });

  const { data: companiesData } = useQuery({
    queryKey: ['companies-dropdown'],
    queryFn: () => companiesApi.getAll({ limit: 100 })
  });

  const createMutation = useMutation({
    mutationFn: ticketsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setIsCreateOpen(false);
      setFormData({
        subject: '',
        description: '',
        company: '',
        priority: 'high',
        category: 'logistics'
      });
    }
  });

  const commentMutation = useMutation({
    mutationFn: ({ id, commentData }) => ticketsApi.addComment(id, commentData),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setSelectedTicket(updated.data);
      setCommentText('');
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => ticketsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      if (selectedTicket) {
        setSelectedTicket(null);
      }
    }
  });

  const tickets = data?.data || [];
  const companies = companiesData?.data || [];

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTicket) return;
    commentMutation.mutate({
      id: selectedTicket._id,
      commentData: { body: commentText, isInternal }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Customer Support &amp; Cases</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Resolve transit inquiries, delivery permits, claims, and client escalations.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="bg-brand-teal text-white">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>+ File New Ticket</span>
        </Button>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton count={4} />
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No support tickets open.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Ticket #</th>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">Company</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <Headphones className="w-4 h-4 text-brand-teal" />
                        <span>{ticket.ticketNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      <div>{ticket.subject}</div>
                      <div className="text-xs text-slate-400 font-normal truncate max-w-xs">
                        {ticket.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 text-xs">{ticket.company?.name || '—'}</td>
                    <td className="px-6 py-4 capitalize text-slate-600 text-xs">{ticket.category}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 text-xs font-bold rounded-md uppercase ${
                          ticket.priority === 'urgent'
                            ? 'bg-rose-100 text-rose-700'
                            : ticket.priority === 'high'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={ticket.status}>{ticket.status.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-teal-50 text-brand-teal hover:bg-teal-100 flex items-center gap-1.5 ml-auto"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Thread ({ticket.comments?.length || 0})</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Ticket Comments / Thread Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={`Ticket Thread: ${selectedTicket?.ticketNumber}`}
        maxWidth="max-w-2xl"
      >
        {selectedTicket && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-slate-900 text-sm">{selectedTicket.subject}</h4>
                <Badge status={selectedTicket.status}>{selectedTicket.status}</Badge>
              </div>
              <p className="text-xs text-slate-600">{selectedTicket.description}</p>
            </div>

            {/* Conversation Log */}
            <div className="space-y-3 max-h-60 overflow-y-auto p-2">
              {selectedTicket.comments?.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-4">
                  No replies on this ticket yet.
                </div>
              ) : (
                selectedTicket.comments?.map((c, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl text-xs space-y-1 ${
                      c.isInternal
                        ? 'bg-amber-50/70 border border-amber-200 text-amber-900'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span>{c.author?.name || 'Agent'} {c.isInternal && '(Internal Note)'}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p>{c.body}</p>
                  </div>
                ))
              )}
            </div>

            {/* Reply Form */}
            <form onSubmit={handleSendComment} className="space-y-2 pt-2 border-t border-slate-200">
              <textarea
                required
                rows={2}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Type your response or internal note..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="w-3.5 h-3.5 text-brand-teal rounded"
                  />
                  <span>Mark as internal staff note</span>
                </label>

                <div className="flex gap-2">
                  {selectedTicket.status !== 'resolved' && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        statusMutation.mutate({ id: selectedTicket._id, status: 'resolved' })
                      }
                    >
                      Mark Resolved
                    </Button>
                  )}
                  <Button type="submit" size="sm" variant="primary" isLoading={commentMutation.isPending}>
                    <Send className="w-3.5 h-3.5 mr-1" />
                    <span>Reply</span>
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* Create Ticket Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="File New Support Case"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(formData);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject *</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g. Request for oversized trailer permit in Dallas"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company</label>
              <select
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              >
                <option value="">Select Account</option>
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
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
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
              Submit Case
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
