import React from 'react';

export const CrmLogo = ({ className = 'h-10' }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Modern DeliveryPlus Truck / Dispatch Logistics Logo Icon */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center tracking-tight leading-none">
          <span className="font-extrabold text-lg text-white">DELIVERY</span>
          <span className="font-extrabold text-lg text-emerald-400 ml-1">PLUS</span>
          <span className="text-[10px] text-teal-300 font-bold ml-1 px-1 py-0.2 rounded bg-emerald-950/80 border border-emerald-500/40">TMS</span>
        </div>
        <span className="text-[8px] tracking-wider text-slate-400 uppercase font-semibold mt-1">
          DISPATCH &amp; FLEET LOGISTICS
        </span>
      </div>
    </div>
  );
};

export const DeliveryPlusLogo = CrmLogo;
