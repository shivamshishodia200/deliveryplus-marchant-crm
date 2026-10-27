import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef
} from '@tanstack/react-table';
import {
  Search,
  Filter,
  UserPlus,
  Trash2,
  Download,
  Settings,
  Calendar,
  X,
  User,
  Edit,
  RotateCcw
} from 'lucide-react';

export interface TaskRecord {
  id: string;
  destinationAddress: string;
  recipient: string;
  description: string;
  driverName?: string | null;
  completeBefore: string;
  createdAt: string;
  status:
    | 'Unassigned'
    | 'Assigning'
    | 'Assigned'
    | 'Processed'
    | 'Loaded'
    | 'Transit'
    | 'Arrived'
    | 'Completed'
    | 'Failed'
    | 'Cancelled';
  type: 'Delivery' | 'Pickup' | 'Appointment' | 'Field Workforce';
  merchantName: string;
}

const STATUS_COLOR_DOTS: Record<string, string> = {
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

export const TaskTable: React.FC<{ initialTasks?: TaskRecord[] }> = ({ initialTasks = [] }) => {
  const [tasks, setTasks] = useState<TaskRecord[]>(initialTasks);
  const [activeTab, setActiveTab] = useState<'Active' | 'Completed' | 'Failed' | 'New' | 'Cancelled' | 'Search'>('Active');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [driverSearch, setDriverSearch] = useState('');

  // Filter States
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [selectedMerchants, setSelectedMerchants] = useState<string[]>([]);

  const driversList = ['Ankit Mor', 'Arjun', 'Bhavya', 'Daksh Chalot', 'Gatik', 'Gourang Gosain', 'Husain', 'Jenu', 'Jeet', 'Laddi', 'Minku'];
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

  // Tab Filtering
  const filteredData = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Tab level filter
      if (activeTab === 'Active' && (task.status === 'Completed' || task.status === 'Cancelled' || task.status === 'Failed')) {
        return false;
      }
      if (activeTab === 'Completed' && task.status !== 'Completed') return false;
      if (activeTab === 'Failed' && task.status !== 'Failed') return false;
      if (activeTab === 'New' && task.status !== 'Unassigned') return false;
      if (activeTab === 'Cancelled' && task.status !== 'Cancelled') return false;

      // 2. Modal filters
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(task.status)) return false;
      if (selectedTypes.length > 0 && !selectedTypes.includes(task.type)) return false;
      if (selectedDrivers.length > 0 && (!task.driverName || !selectedDrivers.includes(task.driverName))) return false;
      if (selectedMerchants.length > 0 && !selectedMerchants.includes(task.merchantName)) return false;

      return true;
    });
  }, [tasks, activeTab, selectedStatuses, selectedTypes, selectedDrivers, selectedMerchants]);

  // TanStack Table Column Definitions
  const columns = useMemo<ColumnDef<TaskRecord>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="w-4 h-4 text-emerald-600 rounded border-slate-300"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="w-4 h-4 text-emerald-600 rounded border-slate-300"
          />
        ),
        size: 35
      },
      {
        accessorKey: 'destinationAddress',
        header: 'Destination Address',
        cell: (info) => (
          <div className="font-medium text-slate-800 truncate max-w-xs" title={info.getValue() as string}>
            {info.getValue() as string}
          </div>
        )
      },
      {
        accessorKey: 'recipient',
        header: 'Recipient',
        cell: (info) => <span className="font-semibold text-slate-700 text-xs">{info.getValue() as string}</span>
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: (info) => (
          <span className="text-xs text-slate-500 truncate max-w-xs block">{info.getValue() as string}</span>
        )
      },
      {
        accessorKey: 'driverName',
        header: 'Assigned Driver',
        cell: (info) => {
          const name = info.getValue() as string | null;
          return name ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
              <User className="w-3 h-3 text-blue-500" />
              <span>{name}</span>
            </span>
          ) : (
            <span className="inline-flex items-center text-xs text-slate-400">
              <UserPlus className="w-3.5 h-3.5 mr-1 text-slate-300" />
              <span>Unassigned</span>
            </span>
          );
        }
      },
      {
        accessorKey: 'completeBefore',
        header: 'Complete Before',
        cell: (info) => <span className="text-xs text-slate-600 font-mono">{info.getValue() as string}</span>
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: (info) => <span className="text-xs text-slate-400 font-mono">{info.getValue() as string}</span>
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const status = info.getValue() as string;
          const isAssigned = status === 'Assigned';
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isAssigned
                  ? 'bg-blue-600 text-white'
                  : status === 'Completed'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-600 text-white'
              }`}
            >
              {status}
            </span>
          );
        }
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: (info) => <span className="text-xs text-slate-600">{info.getValue() as string}</span>
      },
      {
        id: 'actions',
        header: '',
        cell: () => (
          <button className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors">
            <Edit className="w-3.5 h-3.5" />
          </button>
        )
      }
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 15 }
    }
  });

  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setSelectedTypes([]);
    setSelectedDrivers([]);
    setSelectedMerchants([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden font-sans">
      {/* Top Header & Sub-Tabs */}
      <div className="flex items-center justify-between px-6 pt-4 border-b border-slate-200">
        <div className="flex items-center gap-6 text-xs font-bold">
          {(['Active', 'Completed', 'Failed', 'New', 'Cancelled', 'Search'] as const).map((tab) => (
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
              <span>Active Tasks</span>
            </button>

            {/* Filter Modal Dialog (Matching Screenshot) */}
            {isFilterModalOpen && (
              <div className="absolute right-0 top-10 w-[720px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-6 animate-in fade-in zoom-in-95">
                <div className="grid grid-cols-4 gap-6 text-xs">
                  {/* Column 1: Task Status */}
                  <div>
                    <h4 className="font-extrabold text-slate-800 uppercase tracking-wider mb-3">Task Status</h4>
                    <div className="space-y-2">
                      {['Unassigned', 'Assigning', 'Assigned', 'Processed', 'Loaded', 'Transit', 'Arrived', 'Failed'].map((st) => (
                        <label key={st} className="flex items-center gap-2 text-slate-700 cursor-pointer">
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
                    <h4 className="font-extrabold text-slate-800 uppercase tracking-wider mb-3">Task Type</h4>
                    <div className="space-y-2">
                      {['Delivery', 'Pickup', 'Appointment', 'Field Workforce'].map((type) => (
                        <label key={type} className="flex items-center gap-2 text-slate-700 cursor-pointer">
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
                    <h4 className="font-extrabold text-slate-800 uppercase tracking-wider mb-2">Driver</h4>
                    <input
                      type="text"
                      placeholder="Type to search"
                      value={driverSearch}
                      onChange={(e) => setDriverSearch(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-lg mb-2 outline-none focus:border-emerald-600"
                    />
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {driversList
                        .filter((d) => d.toLowerCase().includes(driverSearch.toLowerCase()))
                        .map((driver) => (
                          <label key={driver} className="flex items-center gap-2 text-slate-700 cursor-pointer">
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
                    <h4 className="font-extrabold text-slate-800 uppercase tracking-wider mb-3">Merchant</h4>
                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                      {merchantsList.map((merchant) => (
                        <label key={merchant} className="flex items-center gap-2 text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedMerchants.includes(merchant)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedMerchants([...selectedMerchants, merchant]);
                              else setSelectedMerchants(selectedMerchants.filter((m) => m !== merchant));
                            }}
                            className="w-3.5 h-3.5 text-emerald-600 rounded"
                          />
                          <span className="truncate">{merchant}</span>
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
            )}
          </div>

          <button className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm">
            + New Task
          </button>
        </div>
      </div>

      {/* Bulk Action Controls Bar */}
      <div className="flex items-center gap-3 px-6 py-2 bg-slate-50/70 border-b border-slate-200 text-slate-600">
        <button className="p-1 hover:text-slate-900" title="Edit selected"><Edit className="w-4 h-4" /></button>
        <button className="p-1 hover:text-slate-900" title="Reassign driver"><UserPlus className="w-4 h-4" /></button>
        <button className="p-1 hover:text-rose-600" title="Delete selected"><Trash2 className="w-4 h-4" /></button>
        <button className="p-1 hover:text-slate-900" title="Export CSV"><Download className="w-4 h-4" /></button>
        <button className="p-1 hover:text-slate-900 ml-auto" title="Table Settings"><Settings className="w-4 h-4" /></button>
      </div>

      {/* Virtualized TanStack High-Density Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-2.5">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400">
                  No active tasks matching selected criteria.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    row.original.status === 'Assigned' ? 'bg-blue-50/20' : ''
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 text-xs text-slate-500">
        <span>Showing {table.getRowModel().rows.length} of {filteredData.length} records</span>
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 rounded border border-slate-200 text-slate-600 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 rounded border border-slate-200 text-slate-600 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
