import React from 'react';
import { Search, X } from 'lucide-react';

const SearchInput = ({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  className = "",
  containerClassName = "",
  disabled = false
}) => {
  return (
    <div className={`relative group w-full transition-all duration-300 ${containerClassName}`}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none transition-colors duration-200 group-focus-within:text-indigo-500 text-slate-400">
        <Search className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-focus-within:scale-110" />
      </div>
      
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full pl-11 sm:pl-12 pr-10 py-3 sm:py-3.5 
          bg-white dark:bg-slate-800/40 
          border border-slate-200 dark:border-slate-700 
          rounded-xl sm:rounded-2xl 
          text-slate-900 dark:text-white 
          placeholder:text-slate-400 dark:placeholder:text-slate-500
          text-[13px] sm:text-sm font-medium
          shadow-sm transition-all duration-300
          focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500
          focus:shadow-md focus:bg-white dark:focus:bg-slate-800
          hover:border-slate-300 dark:hover:border-slate-600
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      />

      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {value ? (
          <button
            onClick={() => onChange('')}
            className="p-1 px-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-90"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-400 group-focus-within:opacity-0 transition-opacity">
            <span className="text-[9px]">/</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchInput;
