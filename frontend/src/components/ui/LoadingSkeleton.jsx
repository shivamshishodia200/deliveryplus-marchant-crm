import React from 'react';

export const LoadingSkeleton = ({ count = 3, className = 'h-16' }) => {
  return (
    <div className="space-y-3 w-full animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`bg-slate-200/80 rounded-xl ${className}`} />
      ))}
    </div>
  );
};
