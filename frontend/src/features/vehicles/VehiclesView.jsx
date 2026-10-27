import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Wrench,
  Fuel,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Gauge
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

const INITIAL_VEHICLES = [
  {
    id: 'veh-1',
    plateNumber: 'VIC-DEL-01',
    make: 'Mercedes-Benz',
    model: 'Sprinter 314 CDI',
    odometerKm: 48250,
    status: 'ACTIVE',
    assignedDriver: 'Husan',
    nextServiceDueKm: 50000,
    fuelType: 'Diesel',
    lastInspection: 'Passed (25 Oct 2026)'
  },
  {
    id: 'veh-2',
    plateNumber: 'VIC-DEL-02',
    make: 'Toyota',
    model: 'HiAce LWB Van',
    odometerKm: 72100,
    status: 'ACTIVE',
    assignedDriver: 'Ankit Mor',
    nextServiceDueKm: 75000,
    fuelType: 'Diesel',
    lastInspection: 'Passed (22 Oct 2026)'
  },
  {
    id: 'veh-3',
    plateNumber: 'VIC-DEL-03',
    make: 'Ford',
    model: 'Transit Custom 340L',
    odometerKm: 34900,
    status: 'ACTIVE',
    assignedDriver: 'Gaurang Goswin',
    nextServiceDueKm: 40000,
    fuelType: 'Diesel',
    lastInspection: 'Passed (20 Oct 2026)'
  },
  {
    id: 'veh-4',
    plateNumber: 'VIC-DEL-04',
    make: 'Isuzu',
    model: 'NPR 45-155 Box Truck',
    odometerKm: 112400,
    status: 'MAINTENANCE',
    assignedDriver: 'Unassigned',
    nextServiceDueKm: 110000,
    fuelType: 'Diesel',
    lastInspection: 'Inspection Required'
  }
];

export const VehiclesView = () => {
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    plateNumber: '',
    make: '',
    model: '',
    odometerKm: 50000,
    assignedDriver: 'Unassigned',
    status: 'ACTIVE',
    fuelType: 'Diesel'
  });

  const handleAddVehicle = (e) => {
    e.preventDefault();
    const newVeh = {
      id: `veh-${Date.now()}`,
      ...formData,
      nextServiceDueKm: Number(formData.odometerKm) + 10000,
      lastInspection: 'Passed (Today)'
    };
    setVehicles([newVeh, ...vehicles]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            Fleet &amp; Vehicle Management Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Odometer tracking, telematics diagnostics, maintenance alerts, and driver allocations.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </Button>
      </div>

      {/* Fleet Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Plate &amp; Vehicle</th>
              <th className="py-3 px-4">Assigned Driver</th>
              <th className="py-3 px-4">Odometer</th>
              <th className="py-3 px-4">Service Status</th>
              <th className="py-3 px-4">Daily Inspection</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vehicles.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-extrabold text-slate-900">{v.plateNumber}</div>
                  <div className="text-[11px] text-slate-500">{v.make} {v.model}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="font-semibold text-slate-800">{v.assignedDriver}</span>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-slate-800">
                  {v.odometerKm.toLocaleString()} km
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-slate-400" />
                    <span>Next: {v.nextServiceDueKm.toLocaleString()} km</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      v.lastInspection.includes('Passed')
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {v.lastInspection.includes('Passed') ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {v.lastInspection}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      v.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {v.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Vehicle Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Fleet Vehicle">
        <form onSubmit={handleAddVehicle} className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Plate Number</label>
              <input
                type="text"
                required
                placeholder="VIC-DEL-05"
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Make</label>
              <input
                type="text"
                required
                placeholder="Toyota / Ford"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Model</label>
              <input
                type="text"
                required
                placeholder="HiAce Van / Sprinter"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Odometer (km)</label>
              <input
                type="number"
                required
                value={formData.odometerKm}
                onChange={(e) => setFormData({ ...formData, odometerKm: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              Save Vehicle
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
