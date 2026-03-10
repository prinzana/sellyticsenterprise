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
  FaLock
} from 'react-icons/fa';
import { Warehouse } from "lucide-react";
import { supabase } from '../../supabaseClient';
import useStoreUsersAccess from './StoreUsers/useStoreUsersAccess';
import { setupRBAC } from '../../utils/planManager';

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
        const storedEmail = localStorage.getItem('user_email'); // Make sure you set this on Login

        if (!storedEmail) {
          setUserRole('guest');
          setIsLoadingRole(false);
          return;
        }

        const { data } = await supabase
          .from('store_users')
          .select('role')
          .eq('email_address', storedEmail)
          .maybeSingle();

        if (data) {
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

  // Define authorized roles for Financials (Internal sub-user logical check)
  const financialRoles = ['admin', 'account', 'manager', 'md', 'ceo'];

  // All potential navigation items
  const allNavItems = [
    { name: 'Home', icon: FaHome, aria: 'Home', dataTour: 'home', feature: 'PUBLIC' },
    { name: 'Fix Scan', icon: FaQrcode, aria: 'Fix Scan', dataTour: 'fix-scan', feature: 'PUBLIC' },
    { name: 'AI Insights', icon: FaRobot, aria: 'AI Insights', dataTour: 'ai-insights', feature: 'AI_INSIGHTS' },
    { name: 'Admin Ops', icon: FaUserShield, aria: 'Admin Ops', dataTour: 'admin-ops', feature: 'ADMIN_OPS' },
    { name: 'Warehouse', icon: Warehouse, aria: 'Warehouse', dataTour: 'warehouse', feature: 'WAREHOUSE' },
    { name: 'Financials', icon: FaMoneyBillWave, aria: 'Finances', dataTour: 'finance', feature: 'FINANCIAL_DASHBOARD' },
    { name: 'Store Settings', icon: FaBell, aria: 'Settings', dataTour: 'notifications', feature: 'PUBLIC' },
    { name: 'Colleagues', icon: FaIdBadge, aria: 'Colleagues', dataTour: 'colleagues', feature: 'PUBLIC' },
    { name: 'Profile', icon: FaUser, aria: 'Profile', dataTour: 'profile', feature: 'PUBLIC' },
  ];

  // Apply setupRBAC filtering
  const navItems = allNavItems.filter(item => {
    // 1. Basic Public features
    if (item.feature === 'PUBLIC') return true;

    // 2. Financials has an extra internal role check
    if (item.name === 'Financials' && !financialRoles.includes(userRole)) return false;

    // 3. Main RBAC check: Plan + User Feature Assignment
    return setupRBAC(item.feature, userPlan, registrationDate, allowedFeatures);
  });

  const renderContent = () => {
    // Show loading spinner while verifying role and access
    if (isLoadingRole || isLoadingAccess) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p>Verifying Permissions...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'AI Insights':
        return <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow p-4"><AIpowerInsights /></div>;

      case 'Fix Scan':
        return <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow p-4"><StoreUsersDashboardFeatures /></div>;

      case 'Financials':
        // Security Gate: Secondary check inside the render
        if (!financialRoles.includes(userRole)) {
          return (
            <div className="flex flex-col items-center justify-center h-full p-10 bg-white dark:bg-gray-900 rounded-xl shadow-inner text-center">
              <FaLock className="text-red-500 text-5xl mb-4" />
              <h2 className="text-2xl font-bold dark:text-white">Restricted Access</h2>
              <p className="text-gray-500 mt-2">Your role ({userRole}) does not have permission to view Financials.</p>
              <button onClick={() => setActiveTab('Fix Scan')} className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-lg">Return to Dashboard</button>
            </div>
          );
        }
        return <div className="w-full bg-white dark:bg-gray-700 rounded-lg shadow p-4"><FinancialsDashboard /></div>;

      case 'Admin Ops':
        return <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow p-4"><AdminOps /></div>;

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
        className={`fixed md:static top-0 left-0 h-full transition-all duration-300 bg-gray-100 dark:bg-gray-800 z-40 ${sidebarOpen ? 'w-64' : 'w-0 md:w-16'
          } ${sidebarOpen ? 'block' : 'hidden md:block'}`}
      >
        <div className="p-4 md:p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold text-indigo-800 dark:text-indigo-200 ${sidebarOpen ? 'block' : 'hidden'}`}>
              Menu
            </h2>
            <button
              onClick={toggleSidebar}
              className="text-indigo-800 dark:text-indigo-200 md:hidden"
              aria-label="Close sidebar"
            >
              <FaTimes size={24} />
            </button>
          </div>
          <nav className="pt-8">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li
                  key={item.name}
                  data-tour={item.dataTour}
                  onClick={() => handleNavClick(item.name)}
                  className={`flex items-center p-2 rounded cursor-pointer transition hover:bg-indigo-300 dark:hover:bg-indigo-600 ${activeTab === item.name ? 'bg-indigo-200 dark:bg-indigo-600' : ''
                    }`}
                  aria-label={item.aria}
                >
                  <item.icon
                    className={`text-indigo-800 dark:text-indigo-200 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`}
                  />
                  <span className={`text-indigo-800 dark:text-indigo-200 ${sidebarOpen ? 'block' : 'hidden'}`}>
                    {item.name}
                  </span>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div
          className={`p-4 md:p-6 mt-auto flex items-center justify-between ${sidebarOpen ? 'block' : 'hidden md:flex'}`}
        >
          <span className={`text-indigo-800 dark:text-indigo-200 ${sidebarOpen ? 'block' : 'hidden'}`}>
            {darkMode ? 'Dark Mode' : 'Light Mode'}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <div className="w-11 h-6 bg-indigo-800 dark:bg-gray-600 rounded-full transition-colors duration-300">
              <span
                className={`absolute left-1 top-1 bg-white dark:bg-indigo-200 w-4 h-4 rounded-full transition-transform duration-300 ${darkMode ? 'translate-x-5' : ''
                  }`}
              ></span>
            </div>
          </label>
        </div>
      </aside>

      <button
        onClick={toggleSidebar}
        className={`fixed top-4 md:top-4 transition-all duration-300 z-50 rounded-full p-2 bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 md:block hidden ${sidebarOpen ? 'left-64' : 'left-4'
          }`}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-0'
          }`}
      >
        <header className="flex md:hidden items-center justify-between p-4 bg-white dark:bg-gray-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-indigo-800 dark:text-indigo-200"
            aria-label="Open sidebar"
          >
            <FaBars size={24} />
          </button>
          <h1 className="text-xl font-bold text-indigo-800 dark:text-indigo-200">{activeTab}</h1>
          <button
            onClick={() => {
              localStorage.removeItem('hasSeenTour');
              setIsTourOpen(true);
            }}
            className="text-indigo-800 dark:text-indigo-200 text-sm"
          ></button>
        </header>
        <main className="flex-1 overflow-y-auto p-4">{renderContent()}</main>
      </div>
    </div>
  );
};

export default Dashboard;