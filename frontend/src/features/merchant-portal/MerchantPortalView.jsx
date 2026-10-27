import React, { useState } from 'react';
import {
  Package,
  Plus,
  Printer,
  Barcode,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  DollarSign,
  ArrowLeft,
  Building2,
  Calendar,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MerchantPortalView = () => {
  const navigate = useNavigate();
  const [activeMerchant, setActiveMerchant] = useState('Delivery Plus');
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  const [mockOrders, setMockOrders] = useState([
    {
      id: 'ORD-9901',
      recipient: 'Michelle Eckhart',
      address: 'Level 31, 140 William St, Melbourne, VIC 3000',
      description: 'L-Shaped Sectional Fabric Sofa (Charcoal Grey)',
      barcode: 'DP-ORD-9901',
      status: 'In Transit',
      codAmount: 1850.0,
      createdAt: 'Today 09:30 AM'
    },
    {
      id: 'ORD-9902',
      recipient: 'Maita McAdam',
      address: '11/31 York Street, Richmond, VIC 3121',
      description: 'Solid White Oak Dining Table (6 Seater)',
      barcode: 'DP-ORD-9902',
      status: 'Assigned',
      codAmount: 1200.0,
      createdAt: 'Today 10:15 AM'
    },
    {
      id: 'ORD-9903',
      recipient: 'Milan Korbel',
      address: '51 Tramway Parade, Beaumaris VIC 3193',
      description: 'Velvet Accent Armchair with Brass Legs',
      barcode: 'DP-ORD-9903',
      status: 'Delivered',
      codAmount: 450.0,
      createdAt: 'Yesterday 04:20 PM'
    }
  ]);

  const [newOrder, setNewOrder] = useState({
    recipient: '',
    address: '',
    description: '',
    codAmount: 0
  });

  const handleCreateOrder = (e) => {
    e.preventDefault();
    const created = {
      id: `ORD-${Date.now().toString().slice(-4)}`,
      recipient: newOrder.recipient,
      address: newOrder.address,
      description: newOrder.description,
      barcode: `DP-ORD-${Date.now().toString().slice(-4)}`,
      status: 'Unassigned',
      codAmount: Number(newOrder.codAmount),
      createdAt: 'Just now'
    };
    setMockOrders([created, ...mockOrders]);
    setIsCreateTaskOpen(false);
    setNewOrder({ recipient: '', address: '', description: '', codAmount: 0 });
  };

  const handlePrintLabel = (order) => {
    alert(`Generating printable shipping label with Code128 Barcode for Order #${order.id} (${order.recipient})`);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner & Return Hub */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/merchants')}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Return to Master Hub"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                Isolated Tenant Portal
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {activeMerchant} — Self-Service Portal
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure multi-tenant workspace: generate delivery tasks, SKU catalog barcodes, and COD reconciliation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateTaskOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Delivery Request</span>
          </button>
        </div>
      </div>

      {/* Tenant Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Active Tasks</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">2</span>
          <span className="text-[10px] text-blue-600 font-bold mt-1 inline-block">● 1 In-Transit, 1 Assigned</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Completed Today</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">1</span>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">100% On-Time Delivery</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Total Created</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{mockOrders.length}</span>
          <span className="text-[10px] text-slate-400 font-bold mt-1 inline-block">This Billing Cycle</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Total COD Collected</span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">$3,500.00</span>
          <span className="text-[10px] text-emerald-700 font-bold mt-1 inline-block">Ready for Payout</span>
        </div>
      </div>

      {/* Tenant Orders & Shipping Label Barcode Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" />
            <span>Merchant Shipment Orders &amp; Barcodes</span>
          </h3>
          <span className="text-xs text-slate-500 font-semibold">{mockOrders.length} Shipments Listed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                <th className="px-4 py-2.5">Order / Tracking ID</th>
                <th className="px-4 py-2.5">Recipient &amp; Destination</th>
                <th className="px-4 py-2.5">Product SKU Description</th>
                <th className="px-4 py-2.5">Code128 Barcode</th>
                <th className="px-4 py-2.5">COD Due</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">
                    {order.id}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{order.recipient}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">{order.address}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 max-w-xs truncate" title={order.description}>
                    {order.description}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-800">
                    <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded border border-slate-300">
                      <Barcode className="w-4 h-4 text-slate-700" />
                      <span className="text-[11px]">{order.barcode}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-700">
                    ${order.codAmount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'In Transit'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handlePrintLabel(order)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold flex items-center gap-1.5 ml-auto"
                      title="Print Shipping Label with Code128 Barcode"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Print Label</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Task Creator Modal */}
      {isCreateTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Create Merchant Delivery Request</h3>
            <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Recipient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={newOrder.recipient}
                  onChange={(e) => setNewOrder({ ...newOrder, recipient: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Delivery Destination Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Street, Suburb, VIC, Postcode"
                  value={newOrder.address}
                  onChange={(e) => setNewOrder({ ...newOrder, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Description / Package SKU</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dining Chairs Set (Box 1 of 2)"
                  value={newOrder.description}
                  onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cash on Delivery (COD) Amount ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newOrder.codAmount}
                  onChange={(e) => setNewOrder({ ...newOrder, codAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateTaskOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                >
                  Confirm &amp; Generate Barcode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
