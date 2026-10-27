import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings as SettingsIcon, Save, Building, Globe, DollarSign } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { settingsApi } from '../../services/api';

export const SettingsView = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    organizationName: 'DeliveryPlus Logistics & Moving',
    currency: 'USD',
    currencySymbol: '$',
    timezone: 'America/New_York',
    taxRatePercent: 5
  });

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get
  });

  useEffect(() => {
    if (data?.data) {
      setFormData({
        organizationName: data.data.organizationName || 'DeliveryPlus Logistics & Moving',
        currency: data.data.currency || 'USD',
        currencySymbol: data.data.currencySymbol || '$',
        timezone: data.data.timezone || 'America/New_York',
        taxRatePercent: data.data.taxRatePercent || 5
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      alert('Organization settings updated successfully!');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-brand-teal" />
          <span>Organization Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure default branding, standard taxation rates, currency symbols, and corporate profile.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building className="w-4 h-4 text-brand-teal" />
            <span>Corporate Branding</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Company Legal Name</label>
            <input
              type="text"
              value={formData.organizationName}
              onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">System Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              >
                <option value="America/New_York">Eastern Time (US &amp; Canada)</option>
                <option value="America/Chicago">Central Time (US &amp; Canada)</option>
                <option value="America/Denver">Mountain Time (US &amp; Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US &amp; Canada)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.taxRatePercent}
                onChange={(e) => setFormData({ ...formData, taxRatePercent: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-brand-teal" />
            <span>Currency &amp; Localization</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Base Currency Code</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-teal outline-none"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" isLoading={updateMutation.isPending} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
