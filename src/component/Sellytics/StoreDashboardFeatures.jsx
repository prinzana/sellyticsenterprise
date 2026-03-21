import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaLock, FaCrown } from 'react-icons/fa';

import { tools } from './Stores/toolsConfig';
import useDashboardAccess from './Stores/useDashboardAccess';
import DashboardAccess from './DBAscess/DashboardAccess';
import DashboardHeader from './Stores/DashboardHeader';
import DashboardToolsGrid from './Stores/DashboardToolsGrid';
import { hasFeature } from '../../utils/planManager';

export default function StoreDashboardFeatures() {
  const {
    shopName,
    allowedFeatures,
    userPlan,
    registrationDate,
    isPremium,
    isLoading,
    errorMessage,
    setErrorMessage,
    refreshPermissions,
  } = useDashboardAccess();

  const [activeTool, setActiveTool] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(tools.map((t) => t.category))];

  // Feature mapping for tools to permission keys
  const toolToFeatureMap = {
    'stock_transfer': 'STOCK_TRANSFER',
    'customers': 'CUSTOMER_MANAGER',
    'debts': 'DEBTORS_TRACKER',
    'unpaid_supplies': 'FINANCIAL_DASHBOARD',
    'returns': 'FINANCIAL_DASHBOARD',
    'suppliers': 'FINANCIAL_DASHBOARD',
  };

  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToolClick = (key) => {
    const tool = tools.find((t) => t.key === key);

    // 1. Check if allowed in DB (manual override)
    const isAllowedInDB = allowedFeatures.includes(key);

    // 2. Check if allowed by Plan
    const featureKey = toolToFeatureMap[key];
    const isAllowedByPlan = featureKey ? hasFeature(featureKey, userPlan, registrationDate) : true;

    if (!isAllowedInDB && !isAllowedByPlan) {
      setErrorMessage(
        `Access Denied: ${tool.label} is not enabled for your current plan. Please upgrade to unlock.`
      );
      return;
    }

    if (!tool.isFreemium && !isPremium && !isAllowedByPlan) {
      setErrorMessage(
        `Access Denied: ${tool.label} is a premium feature. Please upgrade your subscription.`
      );
      return;
    }
    setActiveTool(key);
    setErrorMessage('');
  };

  useEffect(() => {
    if (!isLoading && activeTool && !allowedFeatures.includes(activeTool)) {
      setActiveTool(null);
    }
  }, [allowedFeatures, isLoading, activeTool]);

  /* global gtag */
  useEffect(() => {
    if (typeof gtag === 'function') {
      gtag('event', 'fixscan_open', {
        event_category: 'App',
        event_label: 'Dashboard Loaded',
      });
    }
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-500 mx-auto mb-4"></div>
              <div
                className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-400 dark:border-t-purple-500 animate-spin mx-auto"
                style={{ animationDuration: '1.5s' }}
              ></div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Loading your workspace...</p>
            <p className="text-slate-400 dark:text-slate-600 text-sm mt-1">Preparing your dashboard</p>
          </div>
        </div>
      );
    }

    if (activeTool) {
      const tool = tools.find((t) => t.key === activeTool);

      if (!allowedFeatures.includes(activeTool)) {
        return (
          <div className="min-h-screen text-indigo-600 bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
            <div className="max-w-2xl mx-auto">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
                <FaLock className="text-4xl text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">Access Denied</h3>
                <p className="text-red-600 dark:text-red-400">
                  You do not have permission to view {tool.label}. Contact your admin to unlock this feature.
                </p>
                <button
                  onClick={() => setActiveTool(null)}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        );
      }

      if (!tool.isFreemium && !isPremium) {
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
            <div className="max-w-2xl mx-auto">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-8 text-center">
                <FaCrown className="text-5xl text-amber-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-amber-900 dark:text-amber-300 mb-2">Premium Feature</h3>
                <p className="text-amber-700 dark:text-amber-400 mb-6">
                  {tool.label} is available only for premium users. Please upgrade your store&apos;s subscription.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="/upgrade"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                  >
                    Upgrade to Premium
                  </a>
                  <button
                    onClick={() => setActiveTool(null)}
                    className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
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
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-40">
            <div className="w-full px-4 sm:px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <button
                  onClick={() => setActiveTool(null)}
                  className="group flex-shrink-0 flex w-fit items-center gap-2 px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all duration-200 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800"
                >
                  <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200 text-sm" />
                  <span className="font-semibold text-sm">Back to Dashboard</span>
                </button>

                <div className="flex-1 min-w-0 sm:pl-6 sm:border-l border-slate-200 dark:border-slate-700">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
                    {tool.label}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {tool.desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full">
            {React.cloneElement(tool.component, { setActiveTool })}
          </div>
        </div>
      );
    }

    return (
      <DashboardToolsGrid
        tools={tools}
        categories={categories}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        filteredTools={filteredTools}
        handleToolClick={handleToolClick}
        allowedFeatures={allowedFeatures}
        isPremium={isPremium}
        userPlan={userPlan}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 w-full">
      <DashboardAccess />

      {!activeTool && (
        <DashboardHeader
          shopName={shopName}
          isPremium={isPremium}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          refreshPermissions={refreshPermissions}
        />
      )}

      {renderContent()}
    </div>
  );
}