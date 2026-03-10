import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaBars,
  FaTimes,
  FaQrcode,
  FaUsersCog,
  FaCrown,
  FaStore,
  FaHome,
  FaRobot,
  FaUserShield,
  FaMoneyBillWave,
} from 'react-icons/fa';
import { Warehouse } from "lucide-react";
import UserOnboardingTour from './StoreUsers/UserOnboardingTour';

import StoreOwnerDashboard from './Profile/StoreOwnerDashboard';
import PricingFeatures from '../Payments/PricingFeatures';
import StoreDashboardFeatures from './StoreDashboardFeatures';
import AIDashboard from './AiInsights/AIDashboard';
import AdminOpsDashboard from './AdminOps/AdminOpsDashboard';
import FinancialsDashboard from './Financials/FinancialsDashboard';
import AlertDashboard from './StoreSettings/AlertDashboard';
import WarehouseHub from './Hub/WarehouseHub';
import MyStores from './MultiStoreDB/MyStores';

import useDashboardAccess from './Stores/useDashboardAccess';
import { hasFeature, getTrialDaysRemaining } from '../../utils/planManager';

const StoreDashboard = () => {
  const { userPlan, registrationDate, isLoading, isParentStore } = useDashboardAccess();
  const [activeTab, setActiveTab] = useState('Fix Scan');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const navigate = useNavigate();

  // Navigation items definition
  const allNavItems = [
    { name: 'Home', icon: FaHome, aria: 'Home: Go to the landing page', feature: 'PUBLIC' },
    // Only show "My Stores" tab if this is the PARENT (first/original) store
    ...(isParentStore ? [
      { name: 'My Stores', icon: FaStore, aria: 'Manage all your stores', feature: 'MULTI_STORE' },
    ] : []),
    { name: 'Fix Scan', icon: FaQrcode, aria: 'Fix Scan: View and edit your profile', feature: 'PUBLIC' },
    { name: 'AI Insights', icon: FaRobot, aria: 'AI Insights: Explore AI-driven insights', feature: 'AI_INSIGHTS' },
    { name: 'Financials', icon: FaMoneyBillWave, aria: 'Financials: View financial data', feature: 'FINANCIAL_DASHBOARD' },
    { name: 'Warehouse', icon: Warehouse, aria: 'Manage your Warehouse Inventory', feature: 'WAREHOUSE' },
    { name: 'Admin Ops', icon: FaUserShield, aria: 'Admin Ops: Manage store operations', feature: 'ADMIN_OPS' },
    { name: 'Store Settings', icon: FaUsersCog, aria: 'Manage settings and alerts', feature: 'PUBLIC' },
    { name: 'Upgrade', icon: FaCrown, aria: 'Upgrade: Upgrade your plan', feature: 'PUBLIC' },
    { name: 'Profile', icon: FaUser, aria: 'Profile: View your profile', feature: 'PUBLIC' },
  ];

  // Filter nav items based on plan
  const navItems = allNavItems.filter(item => {
    if (item.feature === 'PUBLIC') return true;
    return hasFeature(item.feature, userPlan, registrationDate);
  });

  const trialDays = getTrialDaysRemaining(registrationDate);

  // Check if tour has been shown before
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      setIsTourOpen(true);
    }
  }, []);

  // Toggle dark modes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleTourClose = () => {
    setIsTourOpen(false);
    localStorage.setItem('hasSeenTour', 'true');
  };

  const renderContent = () => {
    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading your workspace...</div>;

    switch (activeTab) {
      case 'Fix Scan': return <div className="w-full bg-white dark:bg-gray-900 p-4"><StoreDashboardFeatures /></div>;
      case 'AI Insights': return <div className="w-full bg-white dark:bg-gray-900 p-4"><AIDashboard /></div>;
      case 'Admin Ops': return <div className="w-full bg-white dark:bg-gray-900 p-4"><AdminOpsDashboard /></div>;
      case 'Financials': return <div className="w-full bg-white dark:bg-gray-900 p-4"><FinancialsDashboard /></div>;
      case 'Warehouse': return <div className="w-full bg-white dark:bg-gray-900 p-4"><WarehouseHub /></div>;
      case 'Store Settings': return <div className="w-full bg-white dark:bg-gray-900 p-4"><AlertDashboard /></div>;
      case 'Upgrade': return <div className="w-full bg-white dark:bg-gray-900 p-4"><PricingFeatures /></div>;
      case 'Profile': return <div className="w-full bg-white dark:bg-gray-900 p-4"><StoreOwnerDashboard /></div>;
      case 'My Stores': return <div className="w-full bg-white dark:bg-gray-900 p-4"><MyStores setActiveTab={setActiveTab} /></div>;
      default: return <div className="w-full bg-white dark:bg-gray-900 p-4">Dashboard Content</div>;
    }
  };

  const handleNavClick = (tab) => {
    if (tab === 'Home') {
      navigate('/');
    } else {
      setActiveTab(tab);
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <UserOnboardingTour isOpen={isTourOpen} onClose={handleTourClose} setActiveTab={setActiveTab} />

      <aside
        className={`fixed md:static top-0 left-0 h-full transition-all duration-300 bg-white dark:bg-gray-900 z-40 ${sidebarOpen ? 'w-64' : 'w-0 md:w-16'
          } ${sidebarOpen ? 'block' : 'hidden md:block'}`}
      >
        <div className="p-3 flex flex-col h-full uppercase">
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className={`text-xl font-extrabold text-indigo-900 dark:text-white tracking-widest ${sidebarOpen ? 'block' : 'hidden'}`}>
              Sellytics
            </h2>
            <button
              onClick={toggleSidebar}
              className={`flex items-center justify-center bg-indigo-600 text-white rounded-full shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-10 h-10' : 'w-10 h-10 mx-auto'}`}
            >
              {sidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
            </button>
          </div>

          {trialDays > 0 && sidebarOpen && (
            <div className="mb-4 p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800">
              <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-center">
                Business Trial: {trialDays} Days Left
              </p>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li
                  key={item.name}
                  onClick={() => handleNavClick(item.name)}
                  className={`flex items-center p-3 rounded-2xl cursor-pointer transition-all duration-200 group ${activeTab === item.name
                    ? 'bg-indigo-50 dark:bg-indigo-900/40'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  aria-label={item.aria}
                >
                  <item.icon
                    className={`text-base transition-transform duration-200 group-hover:scale-110 ${activeTab === item.name ? 'text-indigo-700' : 'text-indigo-600'
                      } ${sidebarOpen ? 'mr-3' : 'mx-auto'}`}
                  />
                  <span className={`text-[11px] font-bold tracking-wide whitespace-nowrap ${sidebarOpen ? 'block' : 'hidden'} ${activeTab === item.name ? 'text-indigo-900' : 'text-slate-600'}`}>
                    {item.name}
                  </span>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className={`flex items-center justify-between ${sidebarOpen ? 'px-1' : 'justify-center'}`}>
              <span className={`text-xs text-slate-500 ${sidebarOpen ? 'block' : 'hidden'}`}>
                {darkMode ? 'Dark' : 'Light'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full transition-colors">
                  <span className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${darkMode ? 'translate-x-5' : ''}`} />
                </div>
              </label>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'md:ml-0' : 'md:ml-0'}`}>
        {/* Mobile Header */}
        <header className="flex md:hidden items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <button onClick={() => setSidebarOpen(true)} className="text-indigo-800 dark:text-indigo-200">
            <FaBars size={24} />
          </button>
          <h1 className="text-lg font-bold text-indigo-800 dark:text-white tracking-tight">
            {activeTab}
          </h1>
          <div className="w-6" />
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-950">{renderContent()}</main>
      </div>
    </div>
  );
};

export default StoreDashboard;