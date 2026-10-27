import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FileText, CheckCircle, XCircle, Send, Trash2, Printer } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { quotationsApi, companiesApi, productsApi } from '../../services/api';

export const QuotationsList = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedQuoteForView, setSelectedQuoteForView] = useState(null);

  const [companyId, setCompanyId] = useState('');
  const [taxRatePercent, setTaxRatePercent] = useState(5);
  const [lineItems, setLineItems] = useState([
    { description: 'Commercial Semi-Trailer Transit (3 Days)', quantity: 2, unitPrice: 2200, discountPercent: 5 }
  ]);

  const { data, isLoading } = useQuery({
    queryKey: ['quotations'],
    queryFn: () => quotationsApi.getAll()
  });

  const { data: companiesData } = useQuery({
    queryKey: ['companies-dropdown'],
    queryFn: () => companiesApi.getAll({ limit: 100 })
  });

  const { data: productsData } = useQuery({
    queryKey: ['products-dropdown'],
    queryFn: () => productsApi.getAll({ activeOnly: 'true' })
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => quotationsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities-kanban'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    }
  });

  const createMutation = useMutation({
    mutationFn: quotationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      setIsCreateOpen(false);
      setCompanyId('');
      setLineItems([
        { description: 'Commercial Semi-Trailer Transit (3 Days)', quantity: 2, unitPrice: 2200, discountPercent: 5 }
      ]);
    }
  });

  const quotations = data?.data || [];
  const companies = companiesData?.data || [];
  const products = productsData?.data || [];

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: 'Moving Labor & Packing Package', quantity: 1, unitPrice: 1500, discountPercent: 0 }
    ]);
  };

  const removeLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index, field, val) => {
    const updated = [...lineItems];
    updated[index][field] = val;
    setLineItems(updated);
  };

  // Live estimated totals
  const estimatedSubtotal = lineItems.reduce((acc, curr) => acc + (Number(curr.quantity) * Number(curr.unitPrice) || 0), 0);
  const estimatedDiscount = lineItems.reduce(
    (acc, curr) => acc + ((Number(curr.quantity) * Number(curr.unitPrice) * (Number(curr.discountPercent) || 0)) / 100 || 0),
    0
  );
  const taxable = Math.max(0, estimatedSubtotal - estimatedDiscount);
  const estimatedTax = (taxable * taxRatePercent) / 100;
  const estimatedTotal = taxable + estimatedTax;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Quotations &amp; Proposals</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create authoritative pricing, calculate taxes, and send proposals to enterprise clients.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="bg-brand-teal text-white">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>+ Create Quotation</span>
        </Button>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton count={4} />
          </div>
        ) : quotations.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No quotations generated yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Quote #</th>
                  <th className="px-6 py-3.5">Company</th>
                  <th className="px-6 py-3.5">Subtotal</th>
                  <th className="px-6 py-3.5">Tax (5%)</th>
                  <th className="px-6 py-3.5">Total Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.map((quote) => (
                  <tr key={quote._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand-teal" />
                        <span>{quote.quoteNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{quote.company?.name || '—'}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                      ${(quote.subtotal || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                      ${(quote.taxAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-900">
                      ${(quote.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={quote.status}>{quote.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedQuoteForView(quote)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                        >
                          View
                        </button>

                        {quote.status === 'draft' && (
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: quote._id, status: 'sent' })}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Send</span>
                          </button>
                        )}

                        {quote.status === 'sent' && (
                          <>
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: quote._id, status: 'accepted' })}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: quote._id, status: 'rejected' })}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quote Preview Modal */}
      <Modal
        isOpen={!!selectedQuoteForView}
        onClose={() => setSelectedQuoteForView(null)}
        title={`Quotation Details: ${selectedQuoteForView?.quoteNumber}`}
      >
        {selectedQuoteForView && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs text-slate-400 block">Client</span>
                <span className="font-bold text-slate-900">{selectedQuoteForView.company?.name}</span>
              </div>
              <Badge status={selectedQuoteForView.status}>{selectedQuoteForView.status}</Badge>
            </div>

            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedQuoteForView.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 text-slate-800">{item.description}</td>
                    <td className="py-2 text-center text-slate-600">{item.quantity}</td>
                    <td className="py-2 text-right text-slate-600">${item.unitPrice?.toLocaleString()}</td>
                    <td className="py-2 text-right font-bold text-slate-900">${item.lineTotal?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-3 border-t border-slate-200 space-y-1 text-xs text-right">
              <div>Subtotal: <strong>${selectedQuoteForView.subtotal?.toLocaleString()}</strong></div>
              <div>Discount: <strong className="text-rose-600">-${selectedQuoteForView.discountAmount?.toLocaleString()}</strong></div>
              <div>Tax (5%): <strong>${selectedQuoteForView.taxAmount?.toLocaleString()}</strong></div>
              <div className="text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                Grand Total: ${selectedQuoteForView.totalAmount?.toLocaleString()}
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button variant="secondary" onClick={() => window.print()} className="flex items-center gap-1.5">
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Quotation Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Draft New Client Quotation"
        maxWidth="max-w-3xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({
              company: companyId,
              taxRatePercent,
              items: lineItems
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Company / Client *</label>
            <select
              required
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
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
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">Line Items</label>
              <button
                type="button"
                onClick={addLineItem}
                className="text-xs text-brand-teal hover:underline font-semibold"
              >
                + Add Line Item
              </button>
            </div>

            <div className="space-y-2.5">
              {lineItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    required
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(idx, 'quantity', Number(e.target.value))}
                    className="w-16 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none text-center"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Unit Price"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(idx, 'unitPrice', Number(e.target.value))}
                    className="w-24 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none text-right"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Disc %"
                    value={item.discountPercent}
                    onChange={(e) => updateLineItem(idx, 'discountPercent', Number(e.target.value))}
                    className="w-16 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none text-center"
                  />
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(idx)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Calculations Summary */}
          <div className="p-4 bg-slate-100/70 rounded-xl space-y-1 text-xs text-right border border-slate-200 font-medium">
            <div>Subtotal: ${(estimatedSubtotal || 0).toLocaleString()}</div>
            <div>Discount: -${(estimatedDiscount || 0).toLocaleString()}</div>
            <div>Estimated Tax (5%): ${(estimatedTax || 0).toLocaleString()}</div>
            <div className="text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-300">
              Total: ${(estimatedTotal || 0).toLocaleString()}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
              Generate Quotation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
