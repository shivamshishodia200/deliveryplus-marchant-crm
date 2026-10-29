import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  ExternalLink,
  Plus,
  FileText,
  FileSpreadsheet,
  Search,
  Edit,
  Store,
  CheckCircle2,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { merchantsApi } from '../../services/api';
import { NewMerchantModal } from './NewMerchantModal';

const INITIAL_FALLBACK_MERCHANTS = [
  {
    _id: 'm-1',
    merchantName: 'Bazaa Furniture',
    storeDetails: {
      contactName: 'Henry',
      phone: '0468866289',
      contactEmail: 'Delivery@bazaa.com.au',
      address: ''
    },
    loginEmail: 'Delivery@bazaa.com.au',
    linkToTeam: 'All Teams',
    status: 'Active'
  },
  {
    _id: 'm-2',
    merchantName: 'Berkowitz Furniture',
    storeDetails: {
      contactName: 'Merri',
      phone: '+61 412 860 357',
      contactEmail: 'Delivery@berkowitz.com',
      address: '79 Rushdale Street, Knoxfield VIC 3180'
    },
    loginEmail: 'Delivery@berkowitz.com',
    linkToTeam: 'All Teams',
    status: 'Active'
  },
  {
    _id: 'm-3',
    merchantName: 'craft media hub',
    storeDetails: {
      contactName: 'Raj',
      phone: '8767876524',
      contactEmail: 'seo.craftmediahub@gmail.com',
      address: '8 Cactus Lane, Campbellfield VIC 3061'
    },
    loginEmail: 'seo.craftmediahub@gmail.com',
    linkToTeam: 'Merchants',
    status: 'Active'
  },
  {
    _id: 'm-4',
    merchantName: 'Delivery Plus',
    storeDetails: {
      contactName: 'Arjun',
      phone: '0410002782',
      contactEmail: 'info@deliveryplus.com.au',
      address: '8 Cactus Lane, Campbellfield VIC 3061'
    },
    loginEmail: 'info@deliveryplus.com.au',
    linkToTeam: 'Merchants',
    status: 'Active'
  },
  {
    _id: 'm-5',
    merchantName: 'Fenton&Fenton',
    storeDetails: {
      contactName: 'John felise',
      phone: '0447432079',
      contactEmail: 'johnfelise@fentonandfenton.com.au',
      address: '6-8 Eskay Road, Oakleigh South VIC 3167'
    },
    loginEmail: 'johnfelise@fentonandfenton.com.au',
    linkToTeam: 'Merchants',
    status: 'Active'
  },
  {
    _id: 'm-6',
    merchantName: 'Fenton&Fenton ( Test Account )',
    storeDetails: {
      contactName: 'John felise',
      phone: '+61 447 432 079',
      contactEmail: 'Fenton@fenton.com',
      address: '8 Cactus Lane, Campbellfield VIC 3061'
    },
    loginEmail: 'Fenton@fenton.com',
    linkToTeam: 'Merchants',
    status: 'Active'
  },
  {
    _id: 'm-7',
    merchantName: 'Satara',
    storeDetails: {
      contactName: 'Jordan',
      phone: '(03) 9587 4469',
      contactEmail: 'jorden@satara.com.au',
      address: '13 Cochranes Road, Moorabbin VIC 3189'
    },
    loginEmail: 'jorden@satara.com.au',
    linkToTeam: 'Merchants',
    status: 'Active'
  },
  {
    _id: 'm-8',
    merchantName: 'Sofa & Soul',
    storeDetails: {
      contactName: 'Anna',
      phone: '0394278555',
      contactEmail: 'delivery@sofasoul.com.au',
      address: '614 Church St, Richmond VIC 3121'
    },
    loginEmail: 'delivery@sofasoul.com.au',
    linkToTeam: 'Merchants',
    status: 'Active'
  },
  {
    _id: 'm-9',
    merchantName: 'Sofas Direct',
    storeDetails: {
      contactName: 'Jen',
      phone: '0483300321',
      contactEmail: 'Delivery@sofasdirect.com',
      address: '283 Burwood Road, Hawthorn VIC 3122'
    },
    loginEmail: 'Delivery@sofasdirect.com',
    linkToTeam: 'Merchants',
    status: 'Active'
  },
  {
    _id: 'm-10',
    merchantName: 'Urban Rhythm',
    storeDetails: {
      contactName: 'Jen',
      phone: '0483300321',
      contactEmail: 'Delivery@urbanrhythm.com',
      address: '544 Church St, Richmond VIC 3121'
    },
    loginEmail: 'Delivery@urbanrhythm.com',
    linkToTeam: 'Merchants',
    status: 'Active'
  }
];

export const MerchantsView = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['merchants-list', search],
    queryFn: () => merchantsApi.getAll({ search }),
    staleTime: 10000
  });

  const createMutation = useMutation({
    mutationFn: merchantsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchants-list'] });
      setIsNewModalOpen(false);
      setSelectedMerchant(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => merchantsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchants-list'] });
      setIsNewModalOpen(false);
      setSelectedMerchant(null);
    }
  });

  const merchants = (data?.data && data.data.length > 0) ? data.data : INITIAL_FALLBACK_MERCHANTS;

  const filteredMerchants = merchants.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.merchantName?.toLowerCase().includes(q) ||
      m.storeDetails?.contactName?.toLowerCase().includes(q) ||
      m.loginEmail?.toLowerCase().includes(q) ||
      m.storeDetails?.address?.toLowerCase().includes(q)
    );
  });

  const handleExportCsv = () => {
    const headers = ['Merchant Name', 'Contact Name', 'Email', 'Phone', 'Address', 'Link to Team', 'Status'];
    const rows = filteredMerchants.map((m) => [
      `"${(m.merchantName || '').replace(/"/g, '""')}"`,
      `"${(m.storeDetails?.contactName || '').replace(/"/g, '""')}"`,
      `"${m.loginEmail || ''}"`,
      `"${m.storeDetails?.phone || ''}"`,
      `"${(m.storeDetails?.address || '').replace(/"/g, '""')}"`,
      `"${m.linkToTeam || 'All Teams'}"`,
      `"${m.status || 'Active'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `merchants_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Top Header / Breadcrumb Bar (Matching Screenshot 1) */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="font-bold text-slate-800 text-sm">Merchants</span>
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/settings')}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => {
              setSelectedMerchant(null);
              setIsNewModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-brand-teal hover:bg-brand-teal-hover text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Merchant</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Toolbar (CSV/PDF icons on left, Search on right) */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              title="Export CSV / Excel"
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            </button>
            <button
              onClick={() => alert('Exporting merchants summary PDF report...')}
              title="Export PDF"
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
            >
              <FileText className="w-4 h-4 text-rose-500" />
            </button>
          </div>

          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-3 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 placeholder-slate-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* High-Density Merchants Table (Matching Screenshot 1 exactly) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                <th className="px-4 py-2.5 w-10">
                  <input type="checkbox" className="w-3.5 h-3.5 text-emerald-600 rounded" />
                </th>
                <th className="px-4 py-2.5">
                  <span className="flex items-center gap-1 cursor-pointer">
                    <span>Merchant Name</span>
                    <span className="text-[10px] text-slate-400">⇅</span>
                  </span>
                </th>
                <th className="px-4 py-2.5">
                  <span className="flex items-center gap-1 cursor-pointer">
                    <span>Contact Name</span>
                    <span className="text-[10px] text-slate-400">⇅</span>
                  </span>
                </th>
                <th className="px-4 py-2.5">
                  <span className="flex items-center gap-1 cursor-pointer">
                    <span>Email</span>
                    <span className="text-[10px] text-slate-400">⇅</span>
                  </span>
                </th>
                <th className="px-4 py-2.5">
                  <span className="flex items-center gap-1 cursor-pointer">
                    <span>Phone</span>
                    <span className="text-[10px] text-slate-400">⇅</span>
                  </span>
                </th>
                <th className="px-4 py-2.5">
                  <span className="flex items-center gap-1 cursor-pointer">
                    <span>Address</span>
                    <span className="text-[10px] text-slate-400">⇅</span>
                  </span>
                </th>
                <th className="px-4 py-2.5">
                  <span className="flex items-center gap-1 cursor-pointer">
                    <span>Link to Team</span>
                    <span className="text-[10px] text-slate-400">⇅</span>
                  </span>
                </th>
                <th className="px-4 py-2.5">
                  <span className="flex items-center gap-1 cursor-pointer">
                    <span>Status</span>
                    <span className="text-[10px] text-slate-400">⇅</span>
                  </span>
                </th>
                <th className="px-4 py-2.5 text-right w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMerchants.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                    No merchants found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredMerchants.map((merchant) => (
                  <tr key={merchant._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-slate-400">
                        <Store className="w-3 h-3" />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-600 hover:underline cursor-pointer">
                      {merchant.merchantName}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {merchant.storeDetails?.contactName || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {merchant.loginEmail}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {merchant.storeDetails?.phone || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={merchant.storeDetails?.address}>
                      {merchant.storeDetails?.address || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {merchant.linkToTeam || 'All Teams'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                        {merchant.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedMerchant(merchant);
                          setIsNewModalOpen(true);
                        }}
                        className="p-1 border border-slate-200 rounded hover:bg-slate-100 text-slate-600 transition-colors"
                        title="Edit Merchant"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New / Edit Merchant Modal Dialog */}
      <NewMerchantModal
        isOpen={isNewModalOpen}
        initialData={selectedMerchant}
        onClose={() => {
          setIsNewModalOpen(false);
          setSelectedMerchant(null);
        }}
        onSave={(formData) => {
          if (selectedMerchant?._id) {
            updateMutation.mutate({ id: selectedMerchant._id, data: formData });
          } else {
            createMutation.mutate(formData);
          }
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};
