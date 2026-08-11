import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] text-slate-200">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-medium text-slate-400">Loading module...</span>
      </div>
    </div>
  );
}
