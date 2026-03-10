import React, { useState, useEffect } from 'react';
import {
  Users,
  Store,
  ShieldCheck,
  UserPlus,
  CreditCard,
  Key,
  LifeBuoy,
  LayoutDashboard,
  Bell,
  Search,
  Sun,
  Moon,
  ChevronRight,
  Menu,
  RefreshCcw,
  ArrowUpRight,

} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import AdminProfile from './AdminProfile';
import Stores from './Stores';
import StoreUsers from './StoreUsers';
import Owners from './Owners';

import PriceUpdateCompo from '../Payments/PriceUpdateCompo';
import AccesDashboard from './AccesDashboard';
import AdminOnboardStores from '../Sellytics/StoreOnboard/AdminOnboardStores';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalStores: 0,
    totalOwners: 0,
    totalUsers: 0,
    activePlans: 0
  });
  const [recentStores, setRecentStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [storesRes, ownersRes, usersRes, recentRes] = await Promise.all([
          supabase.from('stores').select('id', { count: 'exact' }),
          supabase.from('owners').select('id', { count: 'exact' }),
          supabase.from('store_users').select('id', { count: 'exact' }),
          supabase.from('stores').select('shop_name, full_name, created_at, plan').order('created_at', { ascending: false }).limit(5)
        ]);

        setStats({
          totalStores: storesRes.count || 0,
          totalOwners: ownersRes.count || 0,
          totalUsers: usersRes.count || 0,
          activePlans: 12
        });
        setRecentStores(recentRes.data || []);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { title: 'Total Revenue', value: '₦1.2M', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', trend: '+12.5%' },
    { title: 'Registered Stores', value: stats.totalStores, icon: Store, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', trend: '+8.2%' },
    { title: 'System Growth', value: stats.totalOwners, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30', trend: '+14%' },
    { title: 'Active Staff', value: stats.totalUsers, icon: UserPlus, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30', trend: '+5.1%' }
  ];

  return (
    <div className="space-y-8">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
          >
            <div className="flex justify-between items-center mb-6">
              <div className={`p-4 rounded-2xl ${card.bg} ${card.color} transition-transform group-hover:scale-110`}>
                <card.icon size={22} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Growth</span>
                <span className="text-sm font-bold text-emerald-500 flex items-center gap-1">
                  <ArrowUpRight size={14} /> {card.trend}
                </span>
              </div>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold truncate mb-1">{card.title}</h3>
            <p className="text-3xl font-black text-gray-900 dark:text-white tabular-nums">
              {loading ? <span className="inline-block w-20 h-8 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" /> : card.value}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <RefreshCcw size={20} className="text-indigo-600" />
              Recent System Activity
            </h3>
            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">View All Logs</button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Store Entity</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Administrator</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tier</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {recentStores.map((store, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shadow-sm">
                            {store.shop_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{store.shop_name}</p>
                            <p className="text-[11px] text-gray-400 font-medium">Enterprise Hub</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">{store.full_name}</td>
                      <td className="px-8 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-tight ${store.plan === 'BUSINESS'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                          {store.plan || 'PREMIUM'}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                          {new Date(store.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-[10px] text-gray-400">{new Date(store.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
            <ShieldCheck size={20} className="text-indigo-600" />
            Control Center
          </h3>

          <div className="grid gap-4">
            {[
              { label: 'New Owner', icon: UserPlus, desc: 'Onboard client', color: 'bg-indigo-600' },
              { label: 'Pricing Tiers', icon: CreditCard, desc: 'Manage plans', color: 'bg-emerald-600' },
              { label: 'Audit Logs', icon: Key, desc: 'Security history', color: 'bg-gray-800' },
            ].map((action, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-4 p-5 text-left bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[1.5rem] hover:border-indigo-200 transition-all group shadow-sm"
              >
                <div className={`p-3 rounded-xl ${action.color} text-white group-hover:scale-110 transition-transform shadow-lg`}>
                  <action.icon size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">{action.label}</h4>
                  <p className="text-[11px] text-gray-400 font-medium">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2rem] text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-lg font-bold mb-2">Enterprise Help?</h4>
              <p className="text-indigo-100 text-xs mb-4 leading-relaxed font-medium">Get priority support for infrastructure issues.</p>
              <button className="w-full py-3 bg-white text-indigo-700 text-xs font-black rounded-xl hover:bg-indigo-50 transition-colors shadow-sm uppercase tracking-widest">
                CONTACT TECH OPS
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview': return <DashboardStats />;
      case 'Stores': return <Stores />;
      case 'Store Users': return <StoreUsers />;
      case 'Owners': return <Owners />;
      case 'Admin Profile': return <AdminProfile />;
      case 'Pricing': return <PriceUpdateCompo />;
      case 'Store Access': return <AccesDashboard />;
      case 'Store Supports': return <AdminOnboardStores />;
      default: return <DashboardStats />;
    }
  };

  const menuGroups = [
    {
      label: 'Main',
      items: [
        { name: 'Overview', icon: LayoutDashboard },
        { name: 'Stores', icon: Store },
        { name: 'Owners', icon: Users },
        { name: 'Store Users', icon: UserPlus },
      ]
    },
    {
      label: 'Financials',
      items: [
        { name: 'Pricing', icon: CreditCard },
      ]
    },
    {
      label: 'Security & Ops',
      items: [
        { name: 'Store Access', icon: Key },
        { name: 'Store Supports', icon: LifeBuoy },
        { name: 'Admin Profile', icon: ShieldCheck },
      ]
    }
  ];

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark' : ''} bg-[#FCFCFD] dark:bg-[#09090B] relative`}>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[45]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isMobile ? (sidebarOpen ? 300 : 0) : (sidebarOpen ? 300 : 96),
          x: isMobile && !sidebarOpen ? -320 : 0
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed lg:relative h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 shadow-2xl overflow-hidden`}
      >
        <div className="flex flex-col h-full relative z-10">
          <div className="p-8 flex items-center justify-between">
            <div className={`flex items-center gap-4 ${!sidebarOpen && 'justify-center w-full'}`}>
              <div className="w-12 h-12 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
                <ShieldCheck size={28} strokeWidth={2.5} />
              </div>
              {sidebarOpen && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">SELLYTICS</h1>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Command Hub</span>
                </motion.div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
            {menuGroups.map((group, idx) => (
              <div key={idx} className="mb-10 last:mb-0">
                {sidebarOpen && (
                  <h4 className="px-5 text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.25em] mb-4">
                    {group.label}
                  </h4>
                )}
                <ul className="space-y-1.5">
                  {group.items.map((item) => (
                    <li key={item.name}>
                      <button
                        onClick={() => setActiveTab(item.name)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative group ${activeTab === item.name
                          ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 font-bold px-5'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 px-5'
                          }`}
                      >
                        <item.icon size={22} className={`${activeTab === item.name ? 'text-white' : 'text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}`} />
                        {sidebarOpen && (
                          <span className={`text-[15px] font-bold ${activeTab === item.name ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                            {item.name}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 backdrop-blur-sm">
            <div className={`flex items-center gap-4 p-4 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm ${!sidebarOpen && 'justify-center'}`}>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg">AD</div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gray-900 dark:text-white truncate">Super Admin</p>
                  <p className="text-[11px] font-bold text-gray-400 truncate opacity-70">Infrastructure Control</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top Header */}
        <header className={`h-20 lg:h-24 flex items-center justify-between px-4 lg:px-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40 transition-shadow ${scrolled ? 'shadow-lg shadow-black/5' : ''}`}>
          <div className="flex items-center gap-3 lg:gap-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 lg:p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl lg:rounded-2xl text-gray-400 border border-gray-100 dark:border-gray-800 transition-all active:scale-90 shadow-sm"
            >
              <Menu size={20} />
            </button>
            <div>
              <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">
                <LayoutDashboard size={12} className="text-indigo-600" />
                <span>Enterprise Dashboard</span>
                {activeTab !== 'Overview' && (
                  <>
                    <ChevronRight size={10} strokeWidth={3} />
                    <span className="text-indigo-600">{activeTab}</span>
                  </>
                )}
              </nav>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{activeTab}</h2>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative hidden xl:block group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Global System Search..."
                className="pl-12 pr-6 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 rounded-2xl text-sm font-medium transition-all outline-none w-80 shadow-sm focus:shadow-indigo-500/10 placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center gap-2 p-1.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl">
              <button
                onClick={() => setDarkMode(false)}
                className={`p-2.5 rounded-xl transition-all ${!darkMode ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400'}`}
              >
                <Sun size={18} />
              </button>
              <button
                onClick={() => setDarkMode(true)}
                className={`p-2.5 rounded-xl transition-all ${darkMode ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}
              >
                <Moon size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                <Bell size={20} />
              </div>
              <div className="hidden sm:block mr-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Status</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-black text-emerald-500 tracking-tight">OPERATIONAL</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-12 custom-scrollbar bg-[#FCFCFD] dark:bg-[#09090B]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.99, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.99, y: -10 }}
              transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
              className="max-w-[1800px] mx-auto pb-20"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E4E4E7; border-radius: 20px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272A; }
      `}</style>
    </div>
  );
};

export default Dashboard;