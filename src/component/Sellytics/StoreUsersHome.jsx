import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaBars,
  FaTimes,
  FaQrcode,
  FaBell,
  FaIdBadge,
  FaHome,
  FaRobot,
  FaUserShield,
  FaMoneyBillWave,
  FaLock,
  FaWarehouse
} from 'react-icons/fa';
import { supabase } from '../../supabaseClient';
import useStoreUsersAccess from './StoreUsers/useStoreUsersAccess';
import { setupRBAC, hasFeature } from '../../utils/planManager';

// Component Imports
import StoreUsersTour from './StoreUsers/StoreUsersTour';
import StoreUserProfile from './Profile/StoreUsersProfile';
import Colleagues from './AdminOps/Colleagues';
import StoreUsersDashboardFeatures from './StoreUsersDashboardFeatures';
import AIpowerInsights from './AiInsights/AIpowerInsights';
import AdminOps from './AdminOps/AdminOps';
import FinancialsDashboard from './Financials/FinancialsDashboard';
import AlertDashboard from './StoreSettings/AlertDashboard';
import WarehouseHub from './Hub/WarehouseHub';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Fix Scan');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Permissions & Access Hook
  const {
    userPlan,
    registrationDate,
    allowedFeatures,
    isLoading: isLoadingAccess
  } = useStoreUsersAccess();

  const [userRole, setUserRole] = useState(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  const navigate = useNavigate();

  // 1. Verify Role via Email on Mount
  useEffect(() => {
    const verifyUserRole = async () => {
      setIsLoadingRole(true);
      try {
        const storedUserId = localStorage.getItem('user_id');
        const storedStoreId = localStorage.getItem('store_id');

        if (!storedUserId || !storedStoreId) {
          setUserRole('guest');
          setIsLoadingRole(false);
          return;
        }

        const { data, error } = await supabase
          .from('store_users')
          .select('role')
          .eq('id', storedUserId)
          .eq('store_id', storedStoreId)
          .single();

        if (error) {
          setUserRole('unauthorized');
        } else if (data && data.role) {
          setUserRole(data.role.toLowerCase().trim());
        } else {
          setUserRole('unauthorized');
        }
      } catch (err) {
        console.error("Auth Error:", err);
        setUserRole('error');
      } finally {
        setIsLoadingRole(false);
      }
    };

    verifyUserRole();
  }, []);

  // 2. Check if tour has been shown before
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      setIsTourOpen(true);
    }
  }, []);

  // 3. Toggle dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleTourClose = () => {
    setIsTourOpen(false);
    localStorage.setItem('hasSeenTour', 'true');
  };

  const handleNavClick = (tab) => {
    if (tab === 'Home') {
      navigate('/');
    } else {
      setActiveTab(tab);
      setSidebarOpen(false);
    }
  };


  // All potential navigation items
  const allNavItems = [
    { name: 'Home', icon: FaHome, aria: 'Home', dataTour: 'home', feature: 'PUBLIC' },
    { name: 'Fix Scan', icon: FaQrcode, aria: 'Fix Scan', dataTour: 'fix-scan', feature: 'PUBLIC' },
    { name: 'AI Insights', icon: FaRobot, aria: 'AI Insights', dataTour: 'ai-insights', feature: 'AI_INSIGHTS' },
    { name: 'Admin Ops', icon: FaUserShield, aria: 'Admin Ops', dataTour: 'admin-ops', feature: 'ADMIN_OPS' },
    { name: 'Warehouse', icon: FaWarehouse, aria: 'Warehouse', dataTour: 'warehouse', feature: 'WAREHOUSE' },
    { name: 'Financials', icon: FaMoneyBillWave, aria: 'Finances', dataTour: 'finance', feature: 'FINANCIAL_DASHBOARD' },
    { name: 'Store Settings', icon: FaBell, aria: 'Settings', dataTour: 'notifications', feature: 'PUBLIC' },
    { name: 'Colleagues', icon: FaIdBadge, aria: 'Colleagues', dataTour: 'colleagues', feature: 'PUBLIC' },
    { name: 'Profile', icon: FaUser, aria: 'Profile', dataTour: 'profile', feature: 'PUBLIC' },
  ];


  // Define authorized roles for Financials
  const financialRoles = ['account', 'accountant', 'md', 'ceo'];

  // Apply StoreDashboard's logic: Check if the Store's Subscription Plan allows the feature
  const navItems = allNavItems.filter(item => {
    // 1. Basic Public features
    if (item.feature === 'PUBLIC') return true;

    // 2. Hide Financials from users without approved roles
    if (item.name === 'Financials' && !financialRoles.includes(userRole)) {
      return false;
    }

    // 3. Main RBAC check: Plan limits 
    // (We rely on store's plan access to show/hide these premium sections globally for the store)
    return hasFeature(item.feature, userPlan, registrationDate);
  });

  const renderContent = () => {
    // Show loading spinner while verifying role and access
    if (isLoadingRole || isLoadingAccess) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-500 mx-auto"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-400 dark:border-t-purple-500 animate-spin mx-auto" style={{ animationDuration: '1.5s' }}></div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Verifying Permissions...</p>
          </div>
        </div>
      );
    }

    // Helper function for rendering restricted access UI
    const renderRestrictedGate = (moduleName) => (
      <div className="flex flex-col items-center justify-center h-full p-10 bg-white dark:bg-gray-900 rounded-xl shadow-inner text-center">
        <FaLock className="text-red-500 text-5xl mb-4" />
        <h2 className="text-2xl font-bold dark:text-white">Restricted Access</h2>
        <p className="text-gray-500 mt-2">Your role does not have permission to view {moduleName}.</p>
        <button onClick={() => setActiveTab('Fix Scan')} className="mt-6 bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">Return to Dashboard</button>
      </div>
    );

    switch (activeTab) {
      case 'AI Insights':
        return <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow p-4"><AIpowerInsights /></div>;

      case 'Fix Scan':
        return <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow p-4"><StoreUsersDashboardFeatures /></div>;

      case 'Financials':
        if (!financialRoles.includes(userRole)) return renderRestrictedGate('Financials');
        return <div className="w-full bg-white dark:bg-gray-700 rounded-lg shadow p-4"><FinancialsDashboard /></div>;

      case 'Admin Ops':
        return <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow p-4"><AdminOps isStoreUser={true} /></div>;

      case 'Warehouse':
        return <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow p-4"><WarehouseHub /></div>;

      case 'Store Settings':
        return <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow p-4"><AlertDashboard /></div>;

      case 'Profile':
        return <div className="w-full bg-white dark:bg-gray-700 rounded-lg shadow p-4"><StoreUserProfile /></div>;

      case 'Colleagues':
        return <div className="w-full bg-white dark:bg-gray-700 rounded-lg shadow p-4"><Colleagues /></div>;

      default:
        return <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow p-4 font-bold">Welcome to Sellytics Dashboard</div>;
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <StoreUsersTour
        isOpen={isTourOpen}
        onClose={handleTourClose}
        setActiveTab={setActiveTab}
      />

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
                  data-tour={item.dataTour}
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

export default Dashboard;