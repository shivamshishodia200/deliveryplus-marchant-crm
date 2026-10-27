import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  User,
  Truck,
  Plus,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  UserCheck
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

const INITIAL_SHIFTS = [
  {
    id: 'sh-1',
    driverName: 'Husan',
    vehiclePlate: 'VIC-DEL-01 (Mercedes Sprinter)',
    shiftDate: 'Today (27 Oct 2026)',
    startTime: '06:00 AM',
    endTime: '03:00 PM',
    status: 'ACTIVE',
    stopsCompleted: 8,
    totalStops: 12
  },
  {
    id: 'sh-2',
    driverName: 'Ankit Mor',
    vehiclePlate: 'VIC-DEL-02 (Toyota HiAce)',
    shiftDate: 'Today (27 Oct 2026)',
    startTime: '07:30 AM',
    endTime: '04:30 PM',
    status: 'ACTIVE',
    stopsCompleted: 5,
    totalStops: 14
  },
  {
    id: 'sh-3',
    driverName: 'Gaurang Goswin',
    vehiclePlate: 'VIC-DEL-03 (Ford Transit)',
    shiftDate: 'Today (27 Oct 2026)',
    startTime: '08:00 AM',
    endTime: '05:00 PM',
    status: 'ACTIVE',
    stopsCompleted: 3,
    totalStops: 10
  },
  {
    id: 'sh-4',
    driverName: 'Arjun',
    vehiclePlate: 'VIC-DEL-04 (Isuzu Truck)',
    shiftDate: 'Tomorrow (28 Oct 2026)',
    startTime: '06:00 AM',
    endTime: '02:30 PM',
    status: 'SCHEDULED',
    stopsCompleted: 0,
    totalStops: 0
  },
  {
    id: 'sh-5',
    driverName: 'Bhavya',
    vehiclePlate: 'VIC-DEL-05 (Toyota HiAce)',
    shiftDate: 'Tomorrow (28 Oct 2026)',
    startTime: '07:00 AM',
    endTime: '03:30 PM',
    status: 'SCHEDULED',
    stopsCompleted: 0,
    totalStops: 0
  }
];

export const RosterView = () => {
  const [shifts, setShifts] = useState(INITIAL_SHIFTS);
  const [selectedView, setSelectedView] = useState('Today');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    driverName: 'Husan',
    vehiclePlate: 'VIC-DEL-01 (Mercedes Sprinter)',
    shiftDate: 'Tomorrow (28 Oct 2026)',
    startTime: '07:00 AM',
    endTime: '04:00 PM',
    status: 'SCHEDULED'
  });

  const handleAddShift = (e) => {
    e.preventDefault();
    const newShift = {
      id: `sh-${Date.now()}`,
      ...formData,
      stopsCompleted: 0,
      totalStops: 0
    };
    setShifts([newShift, ...shifts]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-600" />
            Roster &amp; Driver Scheduling Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Shift timeline allocations, driver attendance logs, vehicle pairings &amp; capacity planning.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-semibold">
            {['Today', 'Week', 'Month', 'List'].map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedView(mode)}
                className={`px-3 py-1 rounded-md transition-all ${
                  selectedView === mode ? 'bg-white text-emerald-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
            <Plus className="w-4 h-4" />
            <span>Schedule Shift</span>
          </Button>
        </div>
      </div>

      {/* Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shifts.map((shift) => (
          <div
            key={shift.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-emerald-300 transition-all space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                  {shift.driverName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{shift.driverName}</h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Truck className="w-3 h-3 text-slate-400" />
                    {shift.vehiclePlate}
                  </p>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  shift.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {shift.status}
              </span>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 space-y-2 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Shift Date</span>
                <span className="font-semibold text-slate-800">{shift.shiftDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Working Hours</span>
                <span className="font-semibold text-slate-800">{shift.startTime} - {shift.endTime}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Delivery Progress</span>
                <span className="font-bold text-emerald-700">
                  {shift.stopsCompleted} / {shift.totalStops} Stops
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${shift.totalStops > 0 ? (shift.stopsCompleted / shift.totalStops) * 100 : 0}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add Shift Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Driver Shift">
        <form onSubmit={handleAddShift} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Driver</label>
            <select
              value={formData.driverName}
              onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            >
              {['Husan', 'Ankit Mor', 'Gaurang Goswin', 'Arjun', 'Bhavya', 'Jono', 'Laddi'].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Assigned Vehicle</label>
            <input
              type="text"
              value={formData.vehiclePlate}
              onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Start Time</label>
              <input
                type="text"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">End Time</label>
              <input
                type="text"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              Save Shift
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
