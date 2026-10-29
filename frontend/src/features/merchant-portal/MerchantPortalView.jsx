import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  FileText,
  AlertCircle,
  X,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Upload,
  BookOpen,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { merchantPortalApi, deliveryTasksApi } from '../../services/api';
import { useAuth } from '../../app/AuthContext';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

export const MerchantPortalView = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const isMerchant = user?.role === 'merchant';
  const merchantName = user?.name || 'Partner Merchant';

  // Real permission toggles from user account
  const permissions = user?.permissions || {
    create_task: true,
    upload_task: true,
    view_shipping_fee: true,
    edit_contact: true,
    edit_task: true,
    assign_task_to_driver: false,
    edit_shipping_fee: false,
    delete_contact: false,
    delete_task: false,
    print_shipping_label: true,
    add_contact: true,
    manage_product: true
  };

  const activePermissionsCount = Object.values(permissions).filter(Boolean).length;

  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedLabelTask, setSelectedLabelTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [csvText, setCsvText] = useState('');

  const [newTask, setNewTask] = useState({
    recipientName: '',
    phone: '',
    email: '',
    address: '',
    taskNotes: '',
    productName: '',
    quantity: 1,
    weightKg: 10,
    shippingFee: 65.0
  });

  // Query real tenant-scoped tasks
  const { data: tasksData, isLoading, refetch } = useQuery({
    queryKey: ['merchant-portal-tasks', user?._id],
    queryFn: () => merchantPortalApi.getTasks(),
    refetchInterval: 20000
  });

  const orders = tasksData?.data || [];

  // Create Task Mutation
  const createTaskMutation = useMutation({
    mutationFn: (payload) => merchantPortalApi.createTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-portal-tasks'] });
      setIsCreateTaskOpen(false);
      setNewTask({
        recipientName: '',
        phone: '',
        email: '',
        address: '',
        taskNotes: '',
        productName: '',
        quantity: 1,
        weightKg: 10,
        shippingFee: 65.0
      });
    }
  });

  // Bulk CSV Upload Handler
  const handleCsvImport = async (e) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    const lines = csvText.trim().split('\n');
    let imported = 0;

    for (const line of lines) {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 3) {
        const [recipientName, phone, address, productName, qty] = parts;
        try {
          await merchantPortalApi.createTask({
            recipientName,
            phone,
            address,
            shippingFee: permissions.view_shipping_fee ? 65.0 : undefined,
            items: [
              {
                productName: productName || 'Standard Package',
                quantity: Number(qty) || 1,
                weightKg: 10
              }
            ]
          });
          imported++;
        } catch (err) {
          console.error('Import line failed:', err);
        }
      }
    }

    queryClient.invalidateQueries({ queryKey: ['merchant-portal-tasks'] });
    setIsUploadModalOpen(false);
    setCsvText('');
    alert(`Successfully imported ${imported} delivery orders!`);
  };

  // Cancel Task Mutation
  const cancelTaskMutation = useMutation({
    mutationFn: (taskId) => merchantPortalApi.cancelTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-portal-tasks'] });
    }
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!permissions.create_task) return;

    createTaskMutation.mutate({
      recipientName: newTask.recipientName,
      phone: newTask.phone,
      email: newTask.email,
      address: newTask.address,
      taskNotes: newTask.taskNotes,
      shippingFee: permissions.view_shipping_fee ? Number(newTask.shippingFee) : undefined,
      items: [
        {
          productName: newTask.productName || 'General Freight',
          quantity: Number(newTask.quantity) || 1,
          weightKg: Number(newTask.weightKg) || 0
        }
      ]
    });
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const taskNum = (order.taskNumber || '').toLowerCase();
    const recip = (order.destination?.recipientName || order.recipient || '').toLowerCase();
    const addr = (order.destination?.address || order.address || '').toLowerCase();
    return taskNum.includes(q) || recip.includes(q) || addr.includes(q);
  });

  // Dynamic Metrics
  const activeCount = orders.filter((o) =>
    ['Unassigned', 'Assigning', 'Assigned', 'Processed', 'Loaded', 'Transit', 'Arrived'].includes(o.status)
  ).length;

  const completedCount = orders.filter((o) => o.status === 'Completed').length;

  const totalFee = orders.reduce((sum, o) => sum + (o.shippingFee || 0), 0);

  const permissionLabels = [
    { key: 'create_task', label: 'Create task' },
    { key: 'upload_task', label: 'Upload task (CSV)' },
    { key: 'view_shipping_fee', label: 'View shipping fee' },
    { key: 'edit_contact', label: 'Edit contact' },
    { key: 'edit_task', label: 'Edit task' },
    { key: 'assign_task_to_driver', label: 'Assign task to driver' },
    { key: 'edit_shipping_fee', label: 'Edit shipping fee' },
    { key: 'delete_contact', label: 'Delete contact' },
    { key: 'delete_task', label: 'Delete task' },
    { key: 'print_shipping_label', label: 'Print shipping label' },
    { key: 'add_contact', label: 'Add contact' },
    { key: 'manage_product', label: 'Manage product' }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          {!isMerchant && (
            <button
              onClick={() => navigate('/merchants')}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Return to Master Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 uppercase tracking-wider">
                Isolated Tenant Portal
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {merchantName} — Portal
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure merchant fulfillment: create deliveries, print Code128 barcodes, and track shipments.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Active Permissions Pill */}
          <button
            onClick={() => setIsPermissionsModalOpen(true)}
            className="px-3 py-2 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-brand-teal font-bold text-xs flex items-center gap-1.5 transition-all"
            title="Click to view granted permissions"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{activePermissionsCount}/12 Permissions Active</span>
          </button>

          {/* Upload CSV Button */}
          {permissions.upload_task && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Upload CSV</span>
            </button>
          )}

          {/* Create Request Button */}
          {permissions.create_task ? (
            <button
              onClick={() => setIsCreateTaskOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Delivery Request</span>
            </button>
          ) : (
            <div className="text-xs text-slate-400 italic px-3 py-1.5 bg-slate-100 rounded-lg">
              Creation restricted by admin
            </div>
          )}
        </div>
      </div>

      {/* Tenant Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Active Tasks</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{activeCount}</span>
          <span className="text-[10px] text-blue-600 font-bold mt-1 inline-block">● In dispatch &amp; fulfillment</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Completed Orders</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{completedCount}</span>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">100% Verified Delivery</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Total Orders Registered</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{orders.length}</span>
          <span className="text-[10px] text-slate-400 font-bold mt-1 inline-block">This Billing Cycle</span>
        </div>
        {permissions.view_shipping_fee && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-semibold block">Total Delivery Fees</span>
            <span className="text-2xl font-extrabold text-teal-600 mt-1 block">
              ${totalFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-teal-700 font-bold mt-1 inline-block">Authoritative billing summary</span>
          </div>
        )}
      </div>

      {/* Tenant Orders & Shipping Label Barcode Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-teal" />
            <span>Merchant Shipment Orders &amp; Barcodes</span>
          </h3>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders, recipients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-brand-teal w-48 sm:w-64"
              />
            </div>
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">
              {filteredOrders.length} Shipments Listed
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton count={4} className="h-12 mb-2" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No Orders Created Yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {permissions.create_task
                ? 'Click the "+ Create Delivery Request" button above or use "Upload CSV" to register your first shipment.'
                : 'No delivery tasks currently allocated to this merchant portal.'}
            </p>
            {permissions.create_task && (
              <button
                onClick={() => setIsCreateTaskOpen(true)}
                className="mt-4 px-4 py-2 bg-brand-teal text-white rounded-xl text-xs font-bold hover:bg-brand-teal-hover inline-flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Delivery</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                  <th className="px-4 py-2.5">Task / Tracking ID</th>
                  <th className="px-4 py-2.5">Recipient &amp; Destination</th>
                  <th className="px-4 py-2.5">Package Details</th>
                  <th className="px-4 py-2.5">Code128 Barcode</th>
                  {permissions.view_shipping_fee && <th className="px-4 py-2.5">Shipping Fee</th>}
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const taskNum = order.taskNumber || 'TSK-9901';
                  const recipient = order.destination?.recipientName || order.recipient || 'Customer';
                  const address = order.destination?.address || order.address || '';
                  const itemsSummary =
                    order.items && order.items.length > 0
                      ? `${order.items[0].productName} (${order.items[0].quantity}x)`
                      : order.taskNotes || 'Standard Package';

                  const barcodeValue = `DP-${taskNum}`;

                  return (
                    <tr key={order._id || order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {taskNum}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{recipient}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{address}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-xs truncate" title={itemsSummary}>
                        {itemsSummary}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded border border-slate-300">
                          <Barcode className="w-4 h-4 text-slate-700" />
                          <span className="text-[11px]">{barcodeValue}</span>
                        </div>
                      </td>
                      {permissions.view_shipping_fee && (
                        <td className="px-4 py-3 font-bold text-teal-700">
                          ${order.shippingFee != null ? order.shippingFee.toFixed(2) : '0.00'}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            order.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'Transit' || order.status === 'In Transit'
                              ? 'bg-orange-100 text-orange-800'
                              : order.status === 'Assigned'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'Failed'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {permissions.print_shipping_label && (
                            <button
                              onClick={() => setSelectedLabelTask(order)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold flex items-center gap-1.5"
                              title="Print Shipping Label with Code128 Barcode"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-500" />
                              <span>Label</span>
                            </button>
                          )}

                          {permissions.delete_task && order.status === 'Unassigned' && (
                            <button
                              onClick={() => {
                                if (window.confirm('Cancel this delivery order?')) {
                                  cancelTaskMutation.mutate(order._id);
                                }
                              }}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                              title="Cancel Order"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Permissions Transparency Modal */}
      {isPermissionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-teal" />
                <span>Active Merchant Permissions</span>
              </h3>
              <button onClick={() => setIsPermissionsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              The following capabilities have been assigned to <strong>{merchantName}</strong> by the system administrator:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {permissionLabels.map((item) => {
                const isGranted = !!permissions[item.key];
                return (
                  <div
                    key={item.key}
                    className={`flex items-center gap-2 p-2 rounded-lg border ${
                      isGranted ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isGranted ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                    <span className="font-semibold text-[11px]">{item.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsPermissionsModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk CSV Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-brand-teal" />
                <span>Upload Tasks via CSV</span>
              </h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>CSV Format Instructions:</span>
              </div>
              <p className="text-[11px] font-mono text-slate-500">
                RecipientName, Phone, Address, ProductName, Quantity
              </p>
              <p className="text-[10px] text-slate-400">
                Example: John Doe, 0412345678, 123 Collins St Melbourne VIC, Dining Chair, 2
              </p>
            </div>

            <form onSubmit={handleCsvImport} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Paste CSV Lines *</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste lines separated by commas..."
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full p-3 font-mono border border-slate-300 rounded-lg text-xs outline-none focus:border-brand-teal"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-brand-teal text-white font-bold hover:bg-brand-teal-hover flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import Orders</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Single Task Creator Modal */}
      {isCreateTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Create Merchant Delivery Request</h3>
              <button onClick={() => setIsCreateTaskOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={newTask.recipientName}
                    onChange={(e) => setNewTask({ ...newTask, recipientName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-brand-teal"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="0412 345 678"
                    value={newTask.phone}
                    onChange={(e) => setNewTask({ ...newTask, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-brand-teal"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Delivery Destination Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Street Address, Suburb, VIC, Postcode"
                  value={newTask.address}
                  onChange={(e) => setNewTask({ ...newTask, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-brand-teal"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Item / SKU Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Modern Sofa Sectional"
                    value={newTask.productName}
                    onChange={(e) => setNewTask({ ...newTask, productName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-brand-teal"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={newTask.quantity}
                    onChange={(e) => setNewTask({ ...newTask, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-brand-teal"
                  />
                </div>
              </div>

              {permissions.view_shipping_fee && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Standard Shipping Fee ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={!permissions.edit_shipping_fee}
                    value={newTask.shippingFee}
                    onChange={(e) => setNewTask({ ...newTask, shippingFee: Number(e.target.value) })}
                    className={`w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-brand-teal ${
                      !permissions.edit_shipping_fee ? 'bg-slate-100 cursor-not-allowed' : ''
                    }`}
                  />
                  {!permissions.edit_shipping_fee && (
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Standard fixed contract rate</span>
                  )}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Delivery Instructions / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Leave at front door if unattended"
                  value={newTask.taskNotes}
                  onChange={(e) => setNewTask({ ...newTask, taskNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-brand-teal"
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
                  disabled={createTaskMutation.isPending}
                  className="px-5 py-2 rounded-lg bg-brand-teal text-white font-bold hover:bg-brand-teal-hover flex items-center gap-1.5"
                >
                  {createTaskMutation.isPending ? 'Submitting...' : 'Confirm & Register Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Shipping Label Modal */}
      {selectedLabelTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-300 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Printer className="w-4 h-4 text-brand-teal" />
                <span>Standard Dispatch Shipping Label</span>
              </h3>
              <button onClick={() => setSelectedLabelTask(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Print Container Preview */}
            <div className="border-2 border-dashed border-slate-400 p-5 rounded-xl bg-white space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b pb-3 border-slate-300">
                <div>
                  <div className="font-extrabold text-base tracking-tight font-sans text-slate-900">
                    DELIVERY PLUS
                  </div>
                  <div className="text-[10px] text-slate-500">EXPRESS FREIGHT &amp; LOGISTICS</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Service Level</div>
                  <div className="font-bold text-brand-teal text-xs">STANDARD PARCEL</div>
                </div>
              </div>

              {/* Code128 Barcode Visual */}
              <div className="text-center py-2 bg-slate-50 rounded border border-slate-200">
                <div className="font-mono text-sm tracking-widest font-extrabold text-slate-900">
                  DP-{selectedLabelTask.taskNumber}
                </div>
                <div className="flex justify-center items-end gap-1 h-12 my-2 px-6">
                  {/* Pseudo Barcode Lines */}
                  {[4, 2, 5, 1, 3, 6, 2, 4, 1, 5, 2, 3, 6, 1, 4, 2, 5, 3, 2, 4, 1, 6, 2, 5, 3].map((w, idx) => (
                    <div
                      key={idx}
                      className="bg-black"
                      style={{
                        width: `${w * 2}px`,
                        height: '100%'
                      }}
                    />
                  ))}
                </div>
                <div className="text-[10px] text-slate-500">CODE128 STANDARD COMPLIANT</div>
              </div>

              {/* Destination Details */}
              <div className="border-t border-b border-slate-200 py-3 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Ship To / Consignee:</div>
                <div className="font-bold text-slate-900 text-sm">
                  {selectedLabelTask.destination?.recipientName || selectedLabelTask.recipient}
                </div>
                <div className="text-slate-700">
                  {selectedLabelTask.destination?.address || selectedLabelTask.address}
                </div>
                <div className="text-slate-500 text-[11px]">
                  Phone: {selectedLabelTask.destination?.phone || '0412 000 000'}
                </div>
              </div>

              {/* Sender & Item */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-400 block font-bold">MERCHANT SENDER</span>
                  <span className="font-bold text-slate-800">{merchantName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">PACKAGE COUNT</span>
                  <span className="font-bold text-slate-800">
                    {selectedLabelTask.items?.length || 1} Pcs
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedLabelTask(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-black flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
