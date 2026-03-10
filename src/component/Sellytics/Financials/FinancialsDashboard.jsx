import { supabase } from '../../../supabaseClient';
import React, { useState, useEffect } from 'react';
import {
  FaMoneyBillWave, FaMoneyCheckAlt, FaFileInvoiceDollar, FaClipboardList,
  FaBoxes, FaExchangeAlt, FaArrowLeft, FaLock, FaTimes, FaCrown,
  FaSearch, FaChevronRight
} from "react-icons/fa";

import useDashboardAccess from '../Stores/useDashboardAccess';
import { hasFeature } from '../../../utils/planManager';

import Reconciliation from '../Financials/Reconciliation/Reconciliation';
import FinancialDashboard from '../Financials/FinancialDashboard/FinancialDashboard';
import AccountPayable from '../Financials/AccountPayable/AccountPayable'
import AccountsReceivable from '../Financials/AccountReceivables/AccountsReceivable'
import FinancialReports from '../Financials/FinancialReports/FinancialReports'
import InventoryValuation from '../Financials/InventoryValuation/InventoryValuation'

const financeTools = [
  {
    key: "financials",
    label: "Financial Dashboard",
    icon: FaMoneyBillWave,
    desc: "Visualize all your finances in one place",
    component: <FinancialDashboard />,
    isFreemium: true,
    category: "Finance",
  },
  {
    key: "payables",
    label: "Account Payable",
    icon: FaMoneyCheckAlt,
    desc: "Track and manage your outstanding payments",
    component: <AccountPayable />,
    featureKey: "FINANCIAL_DASHBOARD",
    isFreemium: false,
    category: "Finance",
  },
  {
    key: "receivables",
    label: "Account Receivables",
    icon: FaFileInvoiceDollar,
    desc: "Monitor payments owed to your business",
    component: <AccountsReceivable />,
    featureKey: "FINANCIAL_DASHBOARD",
    isFreemium: false,
    category: "Finance",
  },
  {
    key: "reports",
    label: "Financial Reports",
    icon: FaClipboardList,
    desc: "View profit & loss, balance sheet, and cash flow",
    component: <FinancialReports />,
    featureKey: "FINANCIAL_DASHBOARD",
    isFreemium: false,
    category: "Finance",
  },
  {
    key: "valuation",
    label: "Inventory Valuations",
    icon: FaBoxes,
    desc: "Evaluate your stock's financial worth over time",
    component: <InventoryValuation />,
    featureKey: "FINANCIAL_DASHBOARD",
    isFreemium: false,
    category: "Finance",
  },
  {
    key: "reconciliations",
    label: "Reconciliations",
    icon: FaExchangeAlt,
    desc: "Audit and reconcile all your financial transactions",
    component: <Reconciliation />,
    featureKey: "FINANCIAL_DASHBOARD",
    isFreemium: false,
    category: "Finance",
  },
];

export default function Finance() {
  const {
    shopName,
    isPremium,
    userPlan,
    registrationDate,
    isLoading,
    errorMessage,
    setErrorMessage
  } = useDashboardAccess();

  const [activeTool, setActiveTool] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function checkAuthorization() {
      if (isLoading) return;

      const storeId = localStorage.getItem('store_id');
      const userId = localStorage.getItem('user_id');
      const ownerId = localStorage.getItem('owner_id');

      if (!storeId) return;

      let isAuthorizedUser = false;

      // Check role authorization
      if (userId) {
        const { data: storeUserRow } = await supabase
          .from('store_users')
          .select('role, store_id')
          .eq('id', userId)
          .maybeSingle();

        if (storeUserRow && Number(storeUserRow.store_id) === Number(storeId)) {
          const role = String(storeUserRow.role || '').toLowerCase();
          if (['admin', 'account', 'manager'].includes(role)) isAuthorizedUser = true;
        }
      }

      if (!isAuthorizedUser && (ownerId || userId)) {
        const { data: storeByOwner } = await supabase
          .from('stores')
          .select('id')
          .eq('id', storeId)
          .eq('owner_user_id', ownerId || userId)
          .maybeSingle();
        if (storeByOwner) isAuthorizedUser = true;
      }

      setIsAuthorized(isAuthorizedUser);
    }
    checkAuthorization();
  }, [isLoading]);

  const handleToolClick = (key) => {
    const tool = financeTools.find(t => t.key === key);
    const isAccessible = tool.isFreemium ||
      (tool.featureKey ? hasFeature(tool.featureKey, userPlan, registrationDate) : isPremium);

    if (!isAccessible) {
      setErrorMessage(`Access Denied: ${tool.label} is a premium feature. Please upgrade your subscription.`);
      return;
    }
    setActiveTool(key);
    setErrorMessage('');
  };

  const filteredTools = financeTools.filter((tool) =>
    tool.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-500 mx-auto mb-4"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-400 dark:border-t-purple-500 animate-spin mx-auto" style={{ animationDuration: '1.5s' }}></div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Loading your finance workspace...</p>
          </div>
        </div>
      );
    }

    if (!isAuthorized) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
          <div className="text-center bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl max-w-md">
            <FaLock className="text-5xl text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Unauthorized Access</h2>
            <p className="text-slate-600 dark:text-slate-400">
              You don’t have permission to access the Finance Dashboard. Please contact your store admin.
            </p>
          </div>
        </div>
      );
    }

    if (activeTool) {
      const tool = financeTools.find(t => t.key === activeTool);
      const isAccessible = tool.isFreemium || isPremium;

      if (!isAccessible) {
        return (
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6">
            <div className="max-w-2xl mx-auto">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-8 text-center">
                <FaCrown className="text-5xl text-amber-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-amber-900 dark:text-amber-300 mb-2">Premium Feature</h3>
                <p className="text-amber-700 dark:text-amber-400 mb-6">
                  {tool.label} is available only for premium users.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="/upgrade" target="_blank" rel="noopener noreferrer"
                    className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition">
                    Upgrade to Premium
                  </a>
                  <button onClick={() => setActiveTool(null)}
                    className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveTool(null)}
                  className="group flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition-all duration-200"
                >
                  <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
                  <span className="font-semibold">Back</span>
                </button>
                <div className="text-right">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{tool.label}</h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{tool.desc}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {React.cloneElement(tool.component, { setActiveTool })}
          </div>
        </div>
      );
    }

    // Main dashboard view
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search financial tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 shadow-sm hover:shadow-md transition-all duration-200"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {/* Tools Grid */}
        {filteredTools.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
              <FaSearch className="text-4xl text-slate-400 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No results found</h3>
            <p className="text-slate-500 dark:text-slate-400">Try adjusting your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredTools.map((tool) => {
              const isAccessible = tool.isFreemium || isPremium;
              const Icon = tool.icon;

              return (
                <div
                  key={tool.key}
                  onClick={() => isAccessible && handleToolClick(tool.key)}
                  className={`group relative bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3 transition-all duration-200 ${isAccessible
                    ? 'cursor-pointer hover:shadow-md hover:shadow-indigo-500/10 hover:-translate-y-0.5 hover:border-indigo-400 dark:hover:border-indigo-600'
                    : 'cursor-not-allowed opacity-50'
                    }`}
                >
                  {!tool.isFreemium && (
                    <div className="absolute top-2 right-2 z-10">
                      <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 text-amber-700 dark:text-amber-400 rounded text-[9px] font-bold border border-amber-200 dark:border-amber-800">
                        <FaCrown className="text-[8px]" />
                        <span>PRO</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 transition-all duration-200 ${isAccessible ? 'group-hover:scale-105' : ''}`}>
                      <Icon className="text-lg text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="flex-1 text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {tool.label}
                    </h3>
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight mb-2">
                    {tool.desc}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="inline-flex items-center px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[9px] font-medium">
                      {tool.category}
                    </span>
                    {isAccessible && (
                      <FaChevronRight className="text-[10px] text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all duration-200" />
                    )}
                  </div>

                  {!isAccessible && (
                    <div className="absolute inset-0 bg-slate-900/20 dark:bg-slate-950/60 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <div className="text-center px-2">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 mb-1">
                          <FaLock className="text-sm text-red-600 dark:text-red-400" />
                        </div>
                        <p className="text-[9px] font-bold text-slate-800 dark:text-slate-200">Upgrade</p>
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
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 w-full">
      {!activeTool && isAuthorized && !isLoading && (
        <>
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-[10px] font-semibold text-white mb-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    Finance Module
                  </div>
                  <h1 className="text-xl sm:text-3xl font-bold text-white mb-1">
                    Finance Dashboard, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">{shopName}</span>
                  </h1>
                  <p className="text-slate-300 text-xs sm:text-sm">
                    Manage payables, receivables, reports, ledger & more.
                  </p>
                </div>

                {!isPremium && (
                  <a
                    href="/upgrade"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-sm font-bold rounded-lg transition-all duration-200 shadow-lg shadow-amber-500/30"
                  >
                    <FaCrown className="group-hover:scale-110 transition-transform text-xs" />
                    <span className="hidden sm:inline">Upgrade Pro</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Premium Banner */}
          {!isPremium && (
            <div className="border-b border-slate-200 dark:border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                        <FaCrown className="text-white text-xl" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">Unlock All Finance Tools</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Advanced reports, reconciliations, valuations & more</p>
                      </div>
                    </div>
                    <a href="/upgrade" target="_blank" rel="noopener noreferrer"
                      className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20">
                      View Plans
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <FaLock className="text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 dark:text-red-200 mb-1">Access Restricted</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
                  </div>
                  <button onClick={() => setErrorMessage('')}
                    className="p-1.5 text-red-400 hover:text-red-600 dark:hover:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                    <FaTimes />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Main Content */}
      {renderContent()}
    </div>
  );
}