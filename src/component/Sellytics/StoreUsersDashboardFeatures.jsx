import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaLock } from 'react-icons/fa';

import { tools } from './StoreUsers/storeUsersToolsConfig';
import useStoreUsersAccess from './StoreUsers/useStoreUsersAccess';
import StoreUsersHeader from './StoreUsers/StoreUsersHeader';
import StoreUsersToolsGrid from './StoreUsers/StoreUsersToolsGrid';

export default function StoreUsersDashboardFeatures() {
  const {
    shopName,
    allowedFeatures,
    isPremium,
    userPlan,
    isLoading,
    error,
    setError,
    refreshPermissions,
  } = useStoreUsersAccess();

  const [activeTool, setActiveTool] = useState(null);

  useEffect(() => {
    if (!isLoading && activeTool && !allowedFeatures.includes(activeTool)) {
      setActiveTool(null);
    }
  }, [allowedFeatures, isLoading, activeTool]);

  const handleToolClick = (key) => {
    const tool = tools.find((t) => t.key === key);
    if (!allowedFeatures.includes(key)) {
      setError(`Access Denied: ${tool.label} is not enabled for your account. Contact your admin to unlock this feature.`);
      return;
    }
    if (!tool.isFreemium && !isPremium) {
      setError(`Access Denied: ${tool.label} is a premium feature. Please upgrade your subscription.`);
      return;
    }
    setActiveTool(key);
    setError('');
  };

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
          <div className="w-full bg-white dark:bg-gray-900 p-4 max-w-7xl mx-auto text-center text-gray-600 dark:text-gray-400">
            <FaLock className="text-2xl sm:text-3xl mb-2" />
            <div className="text-red-500 dark:text-red-400">
              Access Denied: You do not have permission to view {tool.label}. Contact your admin to unlock this feature.
            </div>
          </div>
        );
      }
      if (!tool.isFreemium && !isPremium) {
        return (
          <div className="w-full bg-white dark:bg-gray-900 p-4 max-w-7xl mx-auto text-center text-gray-600 dark:text-gray-400">
            <FaLock className="text-2xl sm:text-3xl mb-2" />
            <p>This feature is available only for premium users. Please upgrade your store's subscription.</p>
            <a
              href="/upgrade"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
            >
              Upgrade to Premium
            </a>
          </div>
        );
      }
      return (
        <div className="w-full bg-slate-50 dark:bg-slate-950 min-h-screen flex flex-col">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-40">
            <div className="w-full px-4 sm:px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <button
                  onClick={() => setActiveTool(null)}
                  className="group flex-shrink-0 flex w-fit items-center gap-2 px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all duration-200 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800 cursor-pointer"
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
      <StoreUsersToolsGrid
        tools={tools}
        handleToolClick={handleToolClick}
        allowedFeatures={allowedFeatures}
        isPremium={isPremium}
        userPlan={userPlan}
      />
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 w-full flex flex-col overflow-hidden">
      <StoreUsersHeader
        shopName={shopName}
        isPremium={isPremium}
        error={error}
        setError={setError}
        refreshPermissions={refreshPermissions}
        showBackButton={!!activeTool}
      />
      {renderContent()}
    </div>
  );
}