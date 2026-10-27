import React from 'react';

export const Badge = ({ children, status = 'default', className = '' }) => {
  const normalized = String(status || '').toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['pending', 'in_progress', 'draft', 'contacted'].includes(normalized)) {
    styles = 'bg-amber-50 text-amber-700 border-amber-200/80';
  } else if (['completed', 'closed_won', 'accepted', 'qualified', 'resolved'].includes(normalized)) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
  } else if (['new', 'open', 'discovery', 'active'].includes(normalized)) {
    styles = 'bg-teal-50 text-teal-700 border-teal-200/80';
  } else if (['urgent', 'critical', 'closed_lost', 'rejected', 'cancelled'].includes(normalized)) {
    styles = 'bg-rose-50 text-rose-700 border-rose-200/80';
  } else if (['proposal', 'negotiation'].includes(normalized)) {
    styles = 'bg-purple-50 text-purple-700 border-purple-200/80';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles} ${className}`}
    >
      {children}
    </span>
  );
};
