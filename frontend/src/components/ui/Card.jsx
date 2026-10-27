import React from 'react';

export const Card = ({
  children,
  className = '',
  accentColor = null, // 'teal' | 'emerald' | 'crimson' | 'purple' | 'orange'
  ...props
}) => {
  const accentClasses = {
    teal: 'border-l-4 border-l-brand-teal',
    emerald: 'border-l-4 border-l-emerald-500',
    crimson: 'border-l-4 border-l-rose-500',
    purple: 'border-l-4 border-l-purple-500',
    orange: 'border-l-4 border-l-orange-500'
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm transition-all duration-200 hover:shadow-md ${
        accentColor ? accentClasses[accentColor] || '' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
