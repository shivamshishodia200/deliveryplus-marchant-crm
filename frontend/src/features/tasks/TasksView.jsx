import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Filter,
  UserPlus,
  Trash2,
  Download,
  Settings as SettingsIcon,
  X,
  User,
  Edit,
  RotateCcw,
  Plus,
  Search
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

const STATUS_COLOR_DOTS = {
  Unassigned: 'bg-slate-400',
  Assigning: 'bg-orange-500',
  Assigned: 'bg-blue-600',
  Processed: 'bg-purple-600',
  Loaded: 'bg-amber-400',
  Transit: 'bg-orange-500',
  Arrived: 'bg-teal-500',
  Completed: 'bg-emerald-600',
  Failed: 'bg-rose-500',
  Cancelled: 'bg-slate-300'
};

const INITIAL_TASKS = [
  {
    id: 't-1',
    destinationAddress: 'Level 31, 140 William St, Melbourne, VIC, 3000, Australia',
    recipient: 'Michelle Eckhart',
    description: 'VIC | PREMIUM DELIVERY Packages booked: 2 Packing slip: http://...',
    driverName: null,
    completeBefore: '30/10 04:51 AM',
    createdAt: '27/10 04:51 AM',
    status: 'Unassigned',
    type: 'Delivery',
    merchantName: 'Barns Furniture'
  },
  {
    id: 't-2',
    destinationAddress: '11/31 York Street, Richmond, VIC, 3121, Australia',
    recipient: 'Maita McAdam',
    description: 'VIC | EXPRESS DELIVERY Packages booked: 1 Packing slip: http://...',
    driverName: null,
    completeBefore: '30/10 04:47 AM',
    createdAt: '27/10 04:47 AM',
    status: 'Unassigned',
    type: 'Delivery',
    merchantName: 'Berkowitz Furniture'
  },
  {
    id: 't-3',
    destinationAddress: '17a Tharra Street, Bentleigh East, VIC, 3165, Australia',
    recipient: 'BRONWEN PAYNE',
    description: 'VIC | EXPRESS DELIVERY Packages booked: 3 Packing slip: http://...',
    driverName: null,
    completeBefore: '30/10 04:06 AM',
    createdAt: '27/10 04:06 AM',
    status: 'Unassigned',
    type: 'Delivery',
    merchantName: 'Craft media hub'
  },
  {
    id: 't-4',
    destinationAddress: '93 Pakington Street, Kew VIC 3101',
    recipient: 'ALEX OSHANNESSY',
    description: 'Premium Table Delivery with White Glove Unpacking',
    driverName: null,
    completeBefore: '30/10 03:50 AM',
    createdAt: '27/10 03:50 AM',
    status: 'Unassigned',
    type: 'Delivery',
    merchantName: 'Fenton&Fenton'
  },
  {
    id: 't-5',
    destinationAddress: '25a Waltham Street, Richmond VIC 3121',
    recipient: 'Tina Walker',
    description: 'Please deliver either 10th or 11th November morning',
    driverName: null,
    completeBefore: '30/10 03:47 AM',
    createdAt: '27/10 03:47 AM',
    status: 'Unassigned',
    type: 'Delivery',
    merchantName: 'Satara'
  },
  {
    id: 't-6',
    destinationAddress: '33 Macalister Crescent, Curtin, ACT, 2605, Australia',
    recipient: 'Katie Quodling',
    description: 'ACT | PREMIUM DELIVERY Packages booked: 1 Packing slip: http://...',
    driverName: null,
    completeBefore: '30/10 03:35 AM',
    createdAt: '27/10 03:35 AM',
    status: 'Unassigned',
    type: 'Delivery',
    merchantName: 'Sofa & Soul'
  },
  {
    id: 't-7',
    destinationAddress: '1/64 Wood Street, Manly, NSW, 2095, Australia',
    recipient: 'Vivien Hegedus',
    description: 'NSW | PREMIUM DELIVERY Packages booked: 2 Packing slip: http://...',
    driverName: null,
    completeBefore: '30/10 04:22 AM',
    createdAt: '27/10 03:15 AM',
    status: 'Unassigned',
    type: 'Delivery',
    merchantName: 'Sofas Direct'
  },
  {
    id: 't-8',
    destinationAddress: '51 Tramway Parade, Beaumaris VIC 3193',
    recipient: 'Milan Korbel',
    description: 'SWAPOVER - When delivering the replacement table, please collect previous unit',
    driverName: 'Husain',
    completeBefore: '27/10 08:52 AM',
    createdAt: '26/10 08:54 AM',
    status: 'Assigned',
    type: 'Delivery',
    merchantName: 'Urban Rhythm'
  },
  {
    id: 't-9',
    destinationAddress: '589 Riversdale Road, Camberwell, VIC, 3124, Australia',
    recipient: 'ESTER JOEL',
    description: 'VIC | EXPRESS DELIVERY Packages booked: 1 Packing slip: http://...',
    driverName: null,
    completeBefore: '29/10 08:44 AM',
    createdAt: '26/10 08:40 AM',
    status: 'Unassigned',
    type: 'Delivery',
    merchantName: 'Delivery Plus'
  }
];

export const TasksView = () => {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [activeTab, setActiveTab] = useState('Active');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [driverSearch, setDriverSearch] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  // Search & Column Filter States (Matching Screenshot)
  const [searchQuery, setSearchQuery] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [recipientFilter, setRecipientFilter] = useState('');
  const [descFilter, setDescFilter] = useState('');

  // Filter States
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [selectedMerchants, setSelectedMerchants] = useState([]);

  // New task form state
  const [newTaskForm, setNewTaskForm] = useState({
    destinationAddress: '',
    recipient: '',
    description: '',
    type: 'Delivery',
    merchantName: 'Delivery Plus'
  });

  const driversList = [
    'Ankit Mor',
    'Arjun',
    'Bhavya',
    'Daksh Chalot',
    'Gatik',
    'Gourang Gosain',
    'Husain',
    'Jenu',
    'Jeet',
    'Laddi',
    'Minku'
  ];

  const merchantsList = [
    'Barns Furniture',
    'Berkowitz Furniture',
    'Craft media hub',
    'Delivery Plus',
    'Fenton&Fenton',
    'Fenton&Fenton ( Test Account )',
    'Satara',
    'Sofa & Soul',
    'Sofas Direct',
    'Urban Rhythm'
  ];

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Tab filtering
      if (activeTab === 'Active' && (task.status === 'Completed' || task.status === 'Cancelled' || task.status === 'Failed')) {
        return false;
      }
      if (activeTab === 'Completed' && task.status !== 'Completed') return false;
      if (activeTab === 'Failed' && task.status !== 'Failed') return false;
      if (activeTab === 'New' && task.status !== 'Unassigned') return false;
      if (activeTab === 'Cancelled' && task.status !== 'Cancelled') return false;

      // Filter modal options
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(task.status)) return false;
      if (selectedTypes.length > 0 && !selectedTypes.includes(task.type)) return false;
      if (selectedDrivers.length > 0 && (!task.driverName || !selectedDrivers.includes(task.driverName))) return false;
      if (selectedMerchants.length > 0 && !selectedMerchants.includes(task.merchantName)) return false;

      // Inline Column Filters (Screenshot 3)
      if (addressFilter.trim() && !task.destinationAddress.toLowerCase().includes(addressFilter.trim().toLowerCase())) return false;
      if (recipientFilter.trim() && !task.recipient.toLowerCase().includes(recipientFilter.trim().toLowerCase())) return false;
      if (descFilter.trim() && !task.description.toLowerCase().includes(descFilter.trim().toLowerCase())) return false;

      // Global Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matches =
          task.destinationAddress.toLowerCase().includes(q) ||
          task.recipient.toLowerCase().includes(q) ||
          task.description.toLowerCase().includes(q) ||
          (task.driverName && task.driverName.toLowerCase().includes(q)) ||
          task.merchantName.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [tasks, activeTab, selectedStatuses, selectedTypes, selectedDrivers, selectedMerchants, addressFilter, recipientFilter, descFilter, searchQuery]);

  const toggleSelectAll = (checked) => {
    if (checked) setSelectedTaskIds(filteredTasks.map((t) => t.id));
    else setSelectedTaskIds([]);
  };

  const toggleSelectTask = (id) => {
    if (selectedTaskIds.includes(id)) {
      setSelectedTaskIds(selectedTaskIds.filter((item) => item !== id));
    } else {
      setSelectedTaskIds([...selectedTaskIds, id]);
    }
  };

  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setSelectedTypes([]);
    setSelectedDrivers([]);
    setSelectedMerchants([]);
    setAddressFilter('');
    setRecipientFilter('');
    setDescFilter('');
    setSearchQuery('');
  };

  const handleExportCsv = () => {
    const headers = ['Task ID', 'Destination Address', 'Recipient', 'Description', 'Driver', 'Complete Before', 'Created At', 'Status', 'Type', 'Merchant'];
    const rows = filteredTasks.map((t) => [
      t.id,
      `"${(t.destinationAddress || '').replace(/"/g, '""')}"`,
      `"${(t.recipient || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${t.driverName || 'Unassigned'}"`,
      t.completeBefore,
      t.createdAt,
      t.status,
      t.type,
      `"${t.merchantName || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tasks_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    const newTask = {
      id: `t-${Date.now()}`,
      destinationAddress: newTaskForm.destinationAddress,
      recipient: newTaskForm.recipient,
      description: newTaskForm.description,
      driverName: null,
      completeBefore: 'Tomorrow 05:00 PM',
      createdAt: 'Just now',
      status: 'Unassigned',
      type: newTaskForm.type,
      merchantName: newTaskForm.merchantName
    };
    setTasks([newTask, ...tasks]);
    setIsNewTaskOpen(false);
    setNewTaskForm({
      destinationAddress: '',
      recipient: '',
      description: '',
      type: 'Delivery',
      merchantName: 'Delivery Plus'
    });
  };

  return (
    <div className="space-y-4">
      {/* Table Container Card (Matching Screenshot exactly) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden font-sans">
        {/* Top Header & Sub-Tabs */}
        <div className="flex items-center justify-between px-6 pt-4 border-b border-slate-200">
          <div className="flex items-center gap-6 text-xs font-bold">
            {['Active', 'Completed', 'Failed', 'New', 'Cancelled', 'Search'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 border-b-2 transition-all ${
                  activeTab === tab
                    ? 'border-emerald-600 text-emerald-700 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pb-2">
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>All Days</span>
            </button>

            {/* Filter Popover Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Active Tasks ({selectedStatuses.length + selectedTypes.length + selectedDrivers.length + selectedMerchants.length})</span>
              </button>

              {/* Filter Modal Dialog (Matching Screenshot) */}
              {isFilterModalOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFilterModalOpen(false)} />
                  <div className="absolute right-0 top-11 w-[860px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-6 animate-in fade-in zoom-in-95">
                    <div className="grid grid-cols-4 gap-6 text-xs">
                      {/* Column 1: Task Status */}
                      <div>
                        <h4 className="font-extrabold text-slate-800 uppercase tracking-wider mb-3">TASK STATUS</h4>
                        <div className="space-y-2">
                          {['Unassigned', 'Assigning', 'Assigned', 'Processed', 'Loaded', 'Transit', 'Arrived', 'Failed'].map((st) => (
                            <label key={st} className="flex items-center gap-2 text-slate-700 cursor-pointer hover:text-slate-900">
                              <input
                                type="checkbox"
                                checked={selectedStatuses.includes(st)}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedStatuses([...selectedStatuses, st]);
                                  else setSelectedStatuses(selectedStatuses.filter((s) => s !== st));
                                }}
                                className="w-3.5 h-3.5 text-emerald-600 rounded"
                              />
                              <span className={`w-2 h-2 rounded-full ${STATUS_COLOR_DOTS[st] || 'bg-slate-300'}`} />
                              <span>{st}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Column 2: Task Type */}
                      <div>
                        <h4 className="font-extrabold text-slate-800 uppercase tracking-wider mb-3">TASK TYPE</h4>
                        <div className="space-y-2">
                          {['Delivery', 'Pickup', 'Appointment', 'Field Workforce'].map((type) => (
                            <label key={type} className="flex items-center gap-2 text-slate-700 cursor-pointer hover:text-slate-900">
                              <input
                                type="checkbox"
                                checked={selectedTypes.includes(type)}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedTypes([...selectedTypes, type]);
                                  else setSelectedTypes(selectedTypes.filter((t) => t !== type));
                                }}
                                className="w-3.5 h-3.5 text-emerald-600 rounded"
                              />
                              <span>{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Column 3: Driver */}
                      <div>
                        <h4 className="font-extrabold text-slate-800 uppercase tracking-wider mb-2">DRIVER</h4>
                        <input
                          type="text"
                          placeholder="Type to search"
                          value={driverSearch}
                          onChange={(e) => setDriverSearch(e.target.value)}
                          className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-lg mb-2 outline-none focus:border-emerald-600"
                        />
                        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                          {driversList
                            .filter((d) => d.toLowerCase().includes(driverSearch.toLowerCase()))
                            .map((driver) => (
                              <label key={driver} className="flex items-center gap-2 text-slate-700 cursor-pointer hover:text-slate-900">
                                <input
                                  type="checkbox"
                                  checked={selectedDrivers.includes(driver)}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedDrivers([...selectedDrivers, driver]);
                                    else setSelectedDrivers(selectedDrivers.filter((d) => d !== driver));
                                  }}
                                  className="w-3.5 h-3.5 text-emerald-600 rounded"
                                />
                                <span className="truncate">{driver}</span>
                              </label>
                            ))}
                        </div>
                      </div>

                      {/* Column 4: Merchant */}
                      <div>
                        <h4 className="font-extrabold text-slate-800 uppercase tracking-wider mb-3">MERCHANT</h4>
                        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                          {merchantsList.map((merchant) => (
                            <label key={merchant} className="flex items-center gap-2 text-slate-700 cursor-pointer hover:text-slate-900">
                              <input
                                type="checkbox"
                                checked={selectedMerchants.includes(merchant)}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedMerchants([...selectedMerchants, merchant]);
                                  else setSelectedMerchants(selectedMerchants.filter((m) => m !== merchant));
                                }}
                                className="w-3.5 h-3.5 text-emerald-600 rounded"
                              />
                              <span className="text-[11px] leading-tight text-slate-700">{merchant}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                      <button
                        onClick={clearAllFilters}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Clear All Filters</span>
                      </button>
                      <button
                        onClick={() => setIsFilterModalOpen(false)}
                        className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Close</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setIsNewTaskOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Task</span>
            </button>
          </div>
        </div>

        {/* Instant Search Bar (Active when 'Search' tab is clicked or user types) */}
        {activeTab === 'Search' && (
          <div className="px-6 py-2.5 bg-emerald-50/70 border-b border-emerald-100 flex items-center gap-3 animate-in fade-in">
            <Search className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search tasks by destination address, recipient name, description, driver or merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-white border border-emerald-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/20"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded bg-white border border-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Bulk Action Controls Bar */}
        <div className="flex items-center gap-3 px-6 py-2 bg-slate-50/70 border-b border-slate-200 text-slate-600">
          <button className="p-1 hover:text-slate-900" title="Edit selected"><Edit className="w-4 h-4" /></button>
          <button className="p-1 hover:text-slate-900" title="Assign driver"><UserPlus className="w-4 h-4" /></button>
          <button
            className="p-1 hover:text-rose-600"
            title="Delete selected"
            onClick={() => {
              if (selectedTaskIds.length > 0 && window.confirm(`Delete ${selectedTaskIds.length} tasks?`)) {
                setTasks(tasks.filter((t) => !selectedTaskIds.includes(t.id)));
                setSelectedTaskIds([]);
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            className="p-1 hover:text-slate-900"
            title="Export CSV"
            onClick={handleExportCsv}
          >
            <Download className="w-4 h-4" />
          </button>
          <button className="p-1 hover:text-slate-900 ml-auto" title="Table Settings"><SettingsIcon className="w-4 h-4" /></button>
        </div>

        {/* High-Density Virtualized Tasks Grid (Matching Screenshot) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                <th className="px-4 py-2.5 w-10">
                  <input
                    type="checkbox"
                    checked={selectedTaskIds.length === filteredTasks.length && filteredTasks.length > 0}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    className="w-3.5 h-3.5 text-emerald-600 rounded"
                  />
                </th>
                <th className="px-4 py-2.5">Destination Address</th>
                <th className="px-4 py-2.5">Recipient</th>
                <th className="px-4 py-2.5">Description</th>
                <th className="px-4 py-2.5">Driver</th>
                <th className="px-4 py-2.5">Complete Before</th>
                <th className="px-4 py-2.5">Created At</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5 text-right"></th>
              </tr>
              {/* Inline Column Filter Inputs Row (Screenshot 3) */}
              <tr className="bg-white border-b border-slate-200">
                <th className="px-4 py-1.5 text-center">
                  <Filter className="w-3.5 h-3.5 text-slate-400 mx-auto" />
                </th>
                <th className="px-4 py-1.5">
                  <input
                    type="text"
                    placeholder="Search address..."
                    value={addressFilter}
                    onChange={(e) => setAddressFilter(e.target.value)}
                    className="w-full px-2 py-1 text-[11px] font-normal border border-slate-200 rounded bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </th>
                <th className="px-4 py-1.5">
                  <input
                    type="text"
                    placeholder="Search recipient..."
                    value={recipientFilter}
                    onChange={(e) => setRecipientFilter(e.target.value)}
                    className="w-full px-2 py-1 text-[11px] font-normal border border-slate-200 rounded bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </th>
                <th className="px-4 py-1.5">
                  <input
                    type="text"
                    placeholder="Search description..."
                    value={descFilter}
                    onChange={(e) => setDescFilter(e.target.value)}
                    className="w-full px-2 py-1 text-[11px] font-normal border border-slate-200 rounded bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </th>
                <th colSpan={6} className="px-4 py-1.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-400">
                    No tasks found matching selected filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isSelected = selectedTaskIds.includes(task.id);
                  const isAssigned = task.status === 'Assigned';
                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isAssigned ? 'bg-blue-50/20' : ''
                      } ${isSelected ? 'bg-emerald-50/30' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectTask(task.id)}
                          className="w-3.5 h-3.5 text-emerald-600 rounded"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 max-w-xs truncate" title={task.destinationAddress}>
                        {task.destinationAddress}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {task.recipient}
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate" title={task.description}>
                        {task.description}
                      </td>
                      <td className="px-4 py-3">
                        {task.driverName ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                            <User className="w-3 h-3 text-blue-500" />
                            <span>{task.driverName}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-slate-400">
                            <UserPlus className="w-3.5 h-3.5 mr-1 text-slate-300" />
                            <span>Unassigned</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                        {task.completeBefore}
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                        {task.createdAt}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isAssigned
                              ? 'bg-blue-600 text-white'
                              : task.status === 'Completed'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-600 text-white'
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {task.type}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 text-xs text-slate-500">
          <span>Showing {filteredTasks.length} of {tasks.length} tasks</span>
          <span>DeliveryPlus Dispatch Engine v2.0</span>
        </div>
      </div>

      {/* New Task Creator Modal */}
      <Modal isOpen={isNewTaskOpen} onClose={() => setIsNewTaskOpen(false)} title="Create Dispatch Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Destination Address *</label>
            <input
              type="text"
              required
              placeholder="e.g. 140 William St, Melbourne, VIC 3000"
              value={newTaskForm.destinationAddress}
              onChange={(e) => setNewTaskForm({ ...newTaskForm, destinationAddress: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Michelle Eckhart"
                value={newTaskForm.recipient}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, recipient: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Merchant Account</label>
              <select
                value={newTaskForm.merchantName}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, merchantName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
              >
                {merchantsList.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Order Description</label>
            <textarea
              rows={2}
              placeholder="e.g. PREMIUM DELIVERY Packages booked: 2 units"
              value={newTaskForm.description}
              onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsNewTaskOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">
              Create Dispatch Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
