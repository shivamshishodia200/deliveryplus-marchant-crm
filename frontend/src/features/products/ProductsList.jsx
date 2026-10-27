import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Package, Tag, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { productsApi } from '../../services/api';

export const ProductsList = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Moving Services',
    unitPrice: 2500,
    taxRate: 5,
    description: ''
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll()
  });

  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsCreateOpen(false);
      setFormData({
        name: '',
        sku: '',
        category: 'Moving Services',
        unitPrice: 2500,
        taxRate: 5,
        description: ''
      });
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => productsApi.update(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  const products = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Products &amp; Service Catalogue</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Standard service packages, freight transit rates, and storage SKUs.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="bg-brand-teal text-white">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>+ Add Product / SKU</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <LoadingSkeleton count={3} className="h-40" />
        ) : products.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            No products found.
          </div>
        ) : (
          products.map((p) => (
            <Card key={p._id} className="p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 rounded-xl bg-teal-50 text-brand-teal">
                    <Package className="w-5 h-5" />
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                      p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mt-3">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    {p.sku} • {p.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Unit Price</span>
                  <span className="text-lg font-extrabold text-slate-900">
                    ${p.unitPrice?.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => toggleActiveMutation.mutate({ id: p._id, isActive: !p.isActive })}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  {p.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add Product or SKU">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(formData);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Service / Package Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. 53ft Intermodal Semi-Trailer Transit"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">SKU Code *</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                placeholder="e.g. TRK-53FT-01"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              >
                <option value="Moving Services">Moving Services</option>
                <option value="Packing & Labor">Packing & Labor</option>
                <option value="Freight & Transit">Freight & Transit</option>
                <option value="Warehousing">Warehousing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit Price ($) *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
              Save Product
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
