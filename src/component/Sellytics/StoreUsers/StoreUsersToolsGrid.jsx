import React, { useState } from 'react';
import {
  FaSearch,
  FaTimes,
  FaFilter,
  FaChevronRight,
  FaLock,
  FaCrown,
  FaBoxes,
} from 'react-icons/fa';

export default function StoreUsersToolsGrid({
  tools,
  categories, // This should be ["All", "Sales & Revenue", "Inventory", "Finance", "Operations", "Analytics"]
  handleToolClick,
  allowedFeatures,
  isPremium,
  userPlan,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Updated Filter Logic: Corrected to handle exact category matching
  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.desc.toLowerCase().includes(searchQuery.toLowerCase());

    // Logic: If 'All' is selected, show everything. Otherwise, match tool.category exactly.
    const matchesCategory =
      selectedCategory === 'All' || tool.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Available Tools
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{tools.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 rounded-xl flex items-center justify-center">
              <FaBoxes className="text-indigo-600 dark:text-indigo-400 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                ACCOUNT
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {userPlan === 'BUSINESS' ? 'Business Access' : isPremium ? 'Premium Access' : 'Free Access'}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 rounded-xl flex items-center justify-center">
              <FaCrown className="text-amber-600 dark:text-amber-400 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-8 space-y-4">
        <div className="relative group">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search store tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 shadow-sm hover:shadow-md transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Categories Filter Mapping */}
        {categories && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium whitespace-nowrap">
              <FaFilter className="flex-shrink-0" />
              <span className="hidden sm:inline">Filter:</span>
            </div>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`group px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all duration-200 ${selectedCategory === category
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md hover:scale-105'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <FaSearch className="text-4xl text-slate-400 dark:text-slate-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No tools found</h3>
          <p className="text-slate-500 dark:text-slate-400">Try a different search term or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredTools.map((tool) => {
            const isAccessible = (tool.isFreemium || isPremium) && allowedFeatures.includes(tool.key);
            const isLocked = !isAccessible;
            const Icon = tool.icon;

            return (
              <div
                key={tool.key}
                onClick={() => isAccessible && handleToolClick(tool.key)}
                className={`group relative bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3 transition-all duration-200 ${isAccessible
                    ? 'cursor-pointer hover:shadow-md hover:shadow-indigo-500/10 hover:-translate-y-0.5 hover:border-indigo-400 dark:hover:border-indigo-600'
                    : 'cursor-not-allowed opacity-60'
                  }`}
              >
                {/* Premium Badge */}
                {!tool.isFreemium && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 text-amber-700 dark:text-amber-400 rounded text-[9px] font-bold border border-amber-200 dark:border-amber-800">
                      <FaCrown className="text-[8px]" />
                      <span>PRO</span>
                    </div>
                  </div>
                )}

                {/* Icon + Title Row */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`inline-flex p-2 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 transition-all duration-200 ${isAccessible ? 'group-hover:scale-105' : ''
                      }`}
                  >
                    {typeof Icon === 'function' ? (
                      <Icon className="text-lg text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <span className="text-lg">{Icon}</span>
                    )}
                  </div>
                  <h3 className="flex-1 text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {tool.label}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight mb-2">
                  {tool.desc}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="inline-flex items-center px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[9px] font-medium">
                    {tool.category || 'General'}
                  </span>
                  {isAccessible && (
                    <FaChevronRight className="text-[10px] text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all duration-200" />
                  )}
                </div>

                {/* Locked Overlay */}
                {isLocked && (
                  <div className="absolute inset-0 bg-slate-900/10 dark:bg-slate-950/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <div className="text-center px-2">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 mb-1">
                        <FaLock className="text-sm text-red-600 dark:text-red-400" />
                      </div>
                      <p className="text-[9px] font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm">
                        {!allowedFeatures.includes(tool.key) ? 'Contact Admin' : 'Upgrade'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}