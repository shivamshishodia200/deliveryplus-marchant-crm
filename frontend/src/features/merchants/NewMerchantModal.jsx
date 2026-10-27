import React, { useState } from 'react';
import {
  X,
  Store,
  Mail,
  User,
  Phone,
  MapPin,
  Building,
  FileText,
  Save,
  HelpCircle,
  Upload,
  Globe
} from 'lucide-react';

export const NewMerchantModal = ({ isOpen, onClose, onSave, initialData = null, isLoading = false }) => {
  const defaultState = {
    merchantName: '',
    status: 'Active',
    loginEmail: '',
    password: '',
    linkToTeam: 'All Teams',
    storeDetails: {
      contactName: '',
      phone: '',
      contactEmail: '',
      address: '',
      buildingUnit: '',
      instructions: '',
      lat: -37.8136,
      lng: 144.9631
    },
    permissions: {
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
    },
    storeOpeningHours: {
      enabled: false,
      schedule: {}
    },
    sendWelcomeEmail: true
  };

  const [formData, setFormData] = useState(defaultState);

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        ...defaultState,
        ...initialData,
        storeDetails: {
          ...defaultState.storeDetails,
          ...(initialData.storeDetails || {})
        },
        permissions: {
          ...defaultState.permissions,
          ...(initialData.permissions || {})
        },
        storeOpeningHours: {
          ...defaultState.storeOpeningHours,
          ...(initialData.storeOpeningHours || {})
        },
        password: '' // Don't expose or overwrite password unless provided
      });
    } else {
      setFormData(defaultState);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleTogglePermission = (key) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto font-sans">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            {initialData ? 'Edit Merchant' : 'New Merchant'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Header (Merchant Profile) */}
        <div className="px-6 pt-3 border-b border-slate-100 flex items-center gap-2">
          <div className="flex items-center gap-2 pb-2.5 border-b-2 border-emerald-600 text-emerald-700 text-xs font-bold">
            <Store className="w-4 h-4" />
            <span>Merchant Profile</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Row 1: Merchant Name & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Merchant Name</label>
              <input
                type="text"
                required
                placeholder="Merchant Name"
                value={formData.merchantName}
                onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Merchant Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Row 2: Login Username / Email & Temporary Password */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Login Username / Email</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={formData.loginEmail}
                  onChange={(e) => setFormData({ ...formData, loginEmail: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-1 font-bold text-slate-700 mb-1">
                <span>Temporary Password</span>
                <HelpCircle className="w-3 h-3 text-slate-400" />
              </label>
              <input
                type="password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>
          </div>

          {/* Row 3: Link to Team */}
          <div>
            <label className="flex items-center gap-1 font-bold text-slate-700 mb-1">
              <span>Link to Team</span>
              <HelpCircle className="w-3 h-3 text-slate-400" />
            </label>
            <select
              value={formData.linkToTeam}
              onChange={(e) => setFormData({ ...formData, linkToTeam: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
            >
              <option value="All Teams">All Teams</option>
              <option value="Merchants">Merchants</option>
              <option value="Drivers">Drivers</option>
              <option value="Office">Office</option>
            </select>
          </div>

          {/* Section: Merchant Store Details */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1 font-extrabold text-slate-800">
                <span>Merchant Store Details</span>
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              </span>
              <button
                type="button"
                onClick={() => alert('GPS Coordinates pinned: -37.8136, 144.9631')}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-emerald-700"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>GPS Coordinates</span>
              </button>
            </div>

            {/* Structured Store Inputs Container */}
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-200 overflow-hidden bg-white">
              {/* Contact Name & Phone */}
              <div className="grid grid-cols-2 divide-x divide-slate-200">
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Contact name"
                    value={formData.storeDetails.contactName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        storeDetails: { ...formData.storeDetails, contactName: e.target.value }
                      })
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Phone number"
                    value={formData.storeDetails.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        storeDetails: { ...formData.storeDetails, phone: e.target.value }
                      })
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Contact Email */}
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="Contact email"
                  value={formData.storeDetails.contactEmail}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      storeDetails: { ...formData.storeDetails, contactEmail: e.target.value }
                    })
                  }
                  className="w-full pl-9 pr-3 py-2 text-xs focus:outline-none"
                />
              </div>

              {/* Address with Google Pin Icon */}
              <div className="relative flex items-center pr-3">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Address"
                  value={formData.storeDetails.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      storeDetails: { ...formData.storeDetails, address: e.target.value }
                    })
                  }
                  className="w-full pl-9 pr-14 py-2 text-xs focus:outline-none"
                />
                <div className="absolute right-3 flex items-center gap-1.5 text-slate-400">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <Globe className="w-3 h-3 text-blue-500" />
                </div>
              </div>

              {/* Building, Floor & Room */}
              <div className="relative">
                <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Building, floor and room"
                  value={formData.storeDetails.buildingUnit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      storeDetails: { ...formData.storeDetails, buildingUnit: e.target.value }
                    })
                  }
                  className="w-full pl-9 pr-3 py-2 text-xs focus:outline-none"
                />
              </div>

              {/* Instructions or Notes */}
              <div className="relative">
                <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <textarea
                  rows={2}
                  placeholder="Instruction or notes"
                  value={formData.storeDetails.instructions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      storeDetails: { ...formData.storeDetails, instructions: e.target.value }
                    })
                  }
                  className="w-full pl-9 pr-3 py-2 text-xs focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Merchant Portal Permissions (3 Columns of Toggles matching Screenshot 2) */}
          <div className="pt-2">
            <div className="flex items-center gap-1 mb-3">
              <span className="font-extrabold text-slate-800">Merchant Portal Permissions</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="grid grid-cols-3 gap-y-3 gap-x-4 text-xs">
              {/* Column 1 */}
              <div className="space-y-3">
                {[
                  { key: 'create_task', label: 'Create task' },
                  { key: 'upload_task', label: 'Upload task' },
                  { key: 'view_shipping_fee', label: 'View shipping fee' },
                  { key: 'edit_contact', label: 'Edit contact' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleTogglePermission(item.key)}>
                    <div
                      className={`w-8 h-4 rounded-full transition-colors relative flex items-center p-0.5 ${
                        formData.permissions[item.key] ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full bg-white transition-transform ${
                          formData.permissions[item.key] ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-700">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Column 2 */}
              <div className="space-y-3">
                {[
                  { key: 'edit_task', label: 'Edit task' },
                  { key: 'assign_task_to_driver', label: 'Assign task to driver' },
                  { key: 'edit_shipping_fee', label: 'Edit shipping fee' },
                  { key: 'delete_contact', label: 'Delete contact' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleTogglePermission(item.key)}>
                    <div
                      className={`w-8 h-4 rounded-full transition-colors relative flex items-center p-0.5 ${
                        formData.permissions[item.key] ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full bg-white transition-transform ${
                          formData.permissions[item.key] ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-700">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Column 3 */}
              <div className="space-y-3">
                {[
                  { key: 'delete_task', label: 'Delete task' },
                  { key: 'print_shipping_label', label: 'Print shipping label' },
                  { key: 'add_contact', label: 'Add contact' },
                  { key: 'manage_product', label: 'Manage product' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleTogglePermission(item.key)}>
                    <div
                      className={`w-8 h-4 rounded-full transition-colors relative flex items-center p-0.5 ${
                        formData.permissions[item.key] ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full bg-white transition-transform ${
                          formData.permissions[item.key] ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-700">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Merchant Logo */}
          <div className="pt-2 flex items-center justify-between">
            <span className="flex items-center gap-1 font-extrabold text-slate-800">
              <span>Merchant Logo</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </span>
            <button
              type="button"
              onClick={() => alert('Logo upload dialog triggered')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Upload</span>
            </button>
          </div>

          {/* Section: Set Store Opening Hours Toggle */}
          <div className="flex items-center gap-2.5 pt-1">
            <div
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  storeOpeningHours: { ...prev.storeOpeningHours, enabled: !prev.storeOpeningHours.enabled }
                }))
              }
              className={`w-8 h-4 rounded-full transition-colors cursor-pointer relative flex items-center p-0.5 ${
                formData.storeOpeningHours.enabled ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-white transition-transform ${
                  formData.storeOpeningHours.enabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
            <span className="flex items-center gap-1 font-bold text-slate-700">
              <span>Set Store Opening Hours</span>
              <HelpCircle className="w-3 h-3 text-slate-400" />
            </span>
          </div>

          {/* Section: Send Welcome Email Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="sendEmail"
              checked={formData.sendWelcomeEmail}
              onChange={(e) => setFormData({ ...formData, sendWelcomeEmail: e.target.checked })}
              className="w-3.5 h-3.5 text-emerald-600 rounded cursor-pointer"
            />
            <label htmlFor="sendEmail" className="flex items-center gap-1 font-medium text-slate-700 cursor-pointer">
              <span>Send welcome email with login details to the new merchant</span>
              <HelpCircle className="w-3 h-3 text-slate-400" />
            </label>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Saving...' : 'Save & Close'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
