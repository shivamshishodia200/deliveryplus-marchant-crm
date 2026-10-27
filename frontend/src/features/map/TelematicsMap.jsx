import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Truck,
  Battery,
  Clock,
  Compass,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Maximize2
} from 'lucide-react';

const MOCK_PINS = [
  {
    id: 'pin-1',
    address: 'Level 31, 140 William St, Melbourne, VIC 3000',
    recipient: 'Michelle Eckhart',
    status: 'Unassigned',
    lat: -37.815,
    lng: 144.958,
    statusColor: 'bg-slate-400',
    eta: '30/10 04:51 AM',
    packageCount: 2
  },
  {
    id: 'pin-2',
    address: '11/31 York Street, Richmond, VIC 3121',
    recipient: 'Maita McAdam',
    status: 'Assigned',
    driver: 'Ankit Mor',
    lat: -37.822,
    lng: 144.998,
    statusColor: 'bg-blue-600',
    eta: '30/10 04:47 AM',
    packageCount: 1
  },
  {
    id: 'pin-3',
    address: '93 Pakington Street, Kew VIC 3101',
    recipient: 'ALEX OSHANNESSY',
    status: 'Transit',
    driver: 'Husan',
    lat: -37.808,
    lng: 145.027,
    statusColor: 'bg-orange-500',
    eta: 'Today 11:30 AM',
    packageCount: 4
  },
  {
    id: 'pin-4',
    address: '51 Tramway Parade, Beaumaris VIC 3193',
    recipient: 'Milan Korbel',
    status: 'Completed',
    driver: 'Husan',
    lat: -37.989,
    lng: 145.042,
    statusColor: 'bg-emerald-600',
    eta: 'Delivered 08:52 AM',
    packageCount: 1
  }
];

const MOCK_DRIVERS = [
  {
    id: 'drv-1',
    name: 'Husan',
    vehicle: 'Mercedes Sprinter (VIC-DEL-01)',
    speed: '42 km/h',
    heading: 'NE 45°',
    battery: '88%',
    activeTasks: 3,
    status: 'Online',
    lat: -37.818,
    lng: 145.015
  },
  {
    id: 'drv-2',
    name: 'Ankit Mor',
    vehicle: 'Toyota HiAce (VIC-DEL-02)',
    speed: '0 km/h (Stopped)',
    heading: 'S 180°',
    battery: '94%',
    activeTasks: 2,
    status: 'Online',
    lat: -37.824,
    lng: 144.992
  },
  {
    id: 'drv-3',
    name: 'Gaurang Goswin',
    vehicle: 'Ford Transit (VIC-DEL-03)',
    speed: '55 km/h',
    heading: 'NW 315°',
    battery: '62%',
    activeTasks: 5,
    status: 'Online',
    lat: -37.792,
    lng: 144.965
  }
];

export const TelematicsMap = () => {
  const [selectedPin, setSelectedPin] = useState(MOCK_PINS[1]);
  const [selectedDriver, setSelectedDriver] = useState(MOCK_DRIVERS[0]);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'drivers'
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPins = MOCK_PINS.filter((p) =>
    p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.recipient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 font-sans">
      {/* Top Banner / Telematics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Telematics &amp; Live Map Hub
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                Live PostGIS Stream
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Real-time driver GPS tracking, geofence telematics, dynamic ETA recalculation &amp; polyline routing.
            </p>
          </div>
        </div>

        {/* Live Metrics */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-700">{MOCK_DRIVERS.length} Drivers Online</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            {MOCK_PINS.length} Geo-Stops Active
          </div>
        </div>
      </div>

      {/* Main Canvas + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[680px]">
        {/* Left Interactive Map Canvas (Simulated WebGL Mapbox / Google Maps Layer) */}
        <div className="lg:col-span-3 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden relative shadow-md flex flex-col justify-between p-6">
          {/* Simulated Map Grid / SVG Polyline Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Map Top Overlay Controls */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-xl px-4 py-2 text-white flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Unassigned (1)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Assigned (1)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> In-Transit (1)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed (1)
              </span>
            </div>

            <button className="bg-slate-800/90 hover:bg-slate-700 text-slate-200 p-2 rounded-xl border border-slate-700 transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Map Visual Pins & Driver Markers */}
          <div className="relative z-10 my-auto h-full flex items-center justify-center">
            {/* SVG Routing Polyline */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path
                d="M 220 280 Q 420 180 580 320 T 780 240"
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeDasharray="6 6"
                className="animate-pulse"
              />
            </svg>

            {/* Simulated Driver Marker 1 */}
            <div
              onClick={() => setSelectedDriver(MOCK_DRIVERS[0])}
              className="absolute top-[32%] left-[48%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-600/30 border-2 border-emerald-400 flex items-center justify-center animate-ping absolute inset-0" />
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xl relative z-10">
                <Truck className="w-5 h-5" />
              </div>
              <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white text-[11px] font-bold px-2.5 py-1 rounded-md whitespace-nowrap shadow-lg border border-slate-700">
                Husan (42 km/h)
              </div>
            </div>

            {/* Simulated Stop Pin 1 */}
            <div
              onClick={() => setSelectedPin(MOCK_PINS[1])}
              className="absolute top-[40%] left-[24%] cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white transition-transform group-hover:scale-125">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-slate-900/90 text-slate-200 text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
                Stop 1: Richmond
              </div>
            </div>

            {/* Simulated Stop Pin 2 */}
            <div
              onClick={() => setSelectedPin(MOCK_PINS[2])}
              className="absolute top-[48%] left-[72%] cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg border-2 border-white transition-transform group-hover:scale-125">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-slate-900/90 text-slate-200 text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
                Stop 2: Kew (Transit)
              </div>
            </div>
          </div>

          {/* Map Bottom Card: Selected Driver Telematics Info */}
          {selectedDriver && (
            <div className="relative z-10 bg-slate-800/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">{selectedDriver.name}</h4>
                  <p className="text-xs text-slate-400">{selectedDriver.vehicle}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-emerald-400" />
                  <span>Speed: <strong className="text-white">{selectedDriver.speed}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-teal-400" />
                  <span>Heading: <strong className="text-white">{selectedDriver.heading}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Battery className="w-4 h-4 text-amber-400" />
                  <span>Battery: <strong className="text-white">{selectedDriver.battery}</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Split Sidebar: Stop List & Driver Rostering */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          {/* Sub Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 py-3 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'tasks'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Stops ({MOCK_PINS.length})
            </button>
            <button
              onClick={() => setActiveTab('drivers')}
              className={`flex-1 py-3 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'drivers'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Fleet Drivers ({MOCK_DRIVERS.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search destination, recipient..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Items Container */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
            {activeTab === 'tasks' ? (
              filteredPins.map((pin) => (
                <div
                  key={pin.id}
                  onClick={() => setSelectedPin(pin)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedPin?.id === pin.id
                      ? 'bg-emerald-50/80 border border-emerald-300'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900">{pin.recipient}</span>
                    <span className={`w-2 h-2 rounded-full ${pin.statusColor}`} />
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1">{pin.address}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {pin.eta}
                    </span>
                    <span className="font-bold text-slate-700">{pin.packageCount} PKG</span>
                  </div>
                </div>
              ))
            ) : (
              MOCK_DRIVERS.map((driver) => (
                <div
                  key={driver.id}
                  onClick={() => setSelectedDriver(driver)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedDriver?.id === driver.id
                      ? 'bg-emerald-50/80 border border-emerald-300'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900">{driver.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                      {driver.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{driver.vehicle}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Speed: {driver.speed}</span>
                    <span className="font-bold text-slate-700">{driver.activeTasks} Stops</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
