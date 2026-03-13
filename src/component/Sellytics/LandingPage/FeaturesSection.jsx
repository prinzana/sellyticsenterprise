import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {

  Bell,
  Package,

  AlertTriangle,
  TrendingUp,
  Activity,
  CheckCircle2,
  XCircle,
  Search,
  ScanLine,
  Scan,
  Store,
  MapPin,
  Users,
  DollarSign,
  TrendingDown,
  Wallet,
  Receipt,
  Clock,
  Building2
} from 'lucide-react';

const features = [
  {
    icon: TrendingUp,
    title: 'Profit & Sales Analytics',
    description: 'Understand your numbers like a pro. Track daily sales, profit margins, and inventory value in real-time.',
    gradient: 'from-blue-500 to-cyan-400',
    hasDemo: true,
    demoType: 'dashboard'
  },
  {
    icon: Wallet,
    title: 'Debt & Credit Tracker',
    description: 'Track debtors, manage part-payments, and never lose track of money owed to your business.',
    gradient: 'from-emerald-500 to-teal-400',
  },
  {
    icon: Receipt,
    title: 'WhatsApp Receipts',
    description: 'Save money on paper. Generate professional digital receipts and share them instantly via WhatsApp or Email.',
    gradient: 'from-green-500 to-emerald-400',
  },
  {
    icon: Clock,
    title: 'Employee Time Sheets',
    description: 'Monitor staff attendance and lateness effortlessly. Keep your team accountable from anywhere.',
    gradient: 'from-orange-500 to-amber-400',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description: 'Assign specific roles to staff. Control exactly what managers, cashiers, and auditors can see and do.',
    gradient: 'from-violet-500 to-purple-400',
    hasDemo: true,
    demoType: 'multistore'
  },
  {
    icon: AlertTriangle,
    title: 'Theft & Audit Tool',
    description: 'Reconcile stock and check for theft instantly. identify discrepancies and unusual activity in seconds.',
    gradient: 'from-red-500 to-rose-400',
    hasDemo: true,
    demoType: 'audit'
  },
  {
    icon: Scan,
    title: 'Dual Barcode Scanning',
    description: 'Onboard products at the speed of light. Use your phone camera or plug in an external hardware scanner for high-volume operations.',
    gradient: 'from-cyan-500 to-blue-400',
  },
  {
    icon: Building2,
    title: 'Warehouse Monetization',
    description: 'Turn your empty store shelves or backroom into extra cash by listing warehouse space for others.',
    gradient: 'from-indigo-500 to-violet-400',
  }
];

const DashboardDemo = () => {
  return (
    <div className="relative w-full max-w-md mx-auto p-4 sm:p-6 bg-slate-900/80 rounded-2xl border border-blue-500/20 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-white">Today's Overview</h4>
        <Activity className="w-4 h-4 text-blue-400" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Revenue', value: '$124K', change: '+12%', color: 'emerald' },
          { label: 'Orders', value: '89', change: '+8%', color: 'blue' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.2 }}
            className="bg-white/5 rounded-xl p-3 border border-white/10"
          >
            <div className="text-xs text-slate-400 mb-1">{stat.label}</div>
            <div className="text-lg font-bold text-white">{stat.value}</div>
            <div className={`text-xs text-${stat.color}-400 flex items-center gap-1 mt-1`}>
              <TrendingUp className="w-3 h-3" />
              {stat.change}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="relative h-24 mb-2">
        <svg className="w-full h-full" viewBox="0 0 300 100">
          <motion.path
            d="M 0,80 L 50,60 L 100,70 L 150,40 L 200,50 L 250,30 L 300,35"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none" />
      </div>
      <div className="text-xs text-slate-500 text-center">Sales Performance (Last 7 Days)</div>
    </div>
  );
};

const MultiStoreDemo = () => {
  const stores = [
    {
      id: 1,
      name: 'Buchi Stores',
      location: 'Lagos',
      revenue: '$45.2K',
      orders: 234,
      trend: 'up',
      performance: 92,
      staff: 8,
      status: 'active'
    },
    {
      id: 2,
      name: 'Calabar Branch',
      location: 'Calabar',
      revenue: '$38.5K',
      orders: 189,
      trend: 'up',
      performance: 85,
      staff: 6,
      status: 'active'
    },
    {
      id: 3,
      name: 'Airport Store',
      location: 'Aba',
      revenue: '₦28.1K',
      orders: 142,
      trend: 'down',
      performance: 71,
      staff: 5,
      status: 'warning'
    },
  ];

  return (
    <div className="relative w-full max-w-2xl mx-auto p-4 sm:p-6 bg-slate-900/80 rounded-2xl border border-violet-500/20 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-sm font-semibold text-white mb-1">Multi-Store Dashboard</h4>
          <p className="text-xs text-slate-400">Manage all locations in one place</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/30 rounded-full">
          <Store className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-xs text-violet-300 font-medium">3 Stores</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Total Revenue', value: '$111.8K', icon: DollarSign, color: 'emerald' },
          { label: 'Total Orders', value: '565', icon: Package, color: 'blue' },
          { label: 'Total Staff', value: '19', icon: Users, color: 'purple' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 rounded-xl p-3 border border-white/10"
          >
            <stat.icon className={`w-4 h-4 text-${stat.color}-400 mb-2`} />
            <div className="text-xs text-slate-400 mb-1">{stat.label}</div>
            <div className="text-base font-bold text-white">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Store Cards */}
      <div className="space-y-3">
        {stores.map((store, index) => (
          <motion.div
            key={store.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-violet-500/30 transition-all group"
          >
            {/* Store Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-semibold text-white mb-1">{store.name}</h5>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{store.location}</span>
                  </div>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${store.status === 'active'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                {store.status === 'active' ? '● Active' : '⚠ Warning'}
              </div>
            </div>

            {/* Store Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-slate-500 mb-1">Revenue</div>
                <div className="text-sm font-bold text-white">{store.revenue}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Orders</div>
                <div className="text-sm font-bold text-white">{store.orders}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Staff</div>
                <div className="text-sm font-bold text-white">{store.staff}</div>
              </div>
            </div>

            {/* Performance Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400">Performance</span>
                <div className="flex items-center gap-1">
                  {store.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-400" />
                  )}
                  <span className={store.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}>
                    {store.performance}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${store.performance >= 85
                    ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                    : store.performance >= 75
                      ? 'bg-gradient-to-r from-violet-500 to-purple-400'
                      : 'bg-gradient-to-r from-amber-500 to-orange-400'
                    }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${store.performance}%` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Quick Actions</span>
          <button className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors">
            Add Store
          </button>
        </div>
      </div>
    </div>
  );
};

const AlertsDemo = () => {
  const [alerts] = useState([
    { id: 1, type: 'warning', message: 'iPhone 13 Pro stock low (3 left)', icon: Package },
    { id: 2, type: 'success', message: 'Daily sales target achieved!', icon: TrendingUp },
    { id: 3, type: 'danger', message: 'Unusual activity detected in Store 2', icon: AlertTriangle },
  ]);

  const typeColors = {
    warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
    success: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    danger: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  };

  return (
    <div className="relative w-full max-w-md mx-auto p-4 sm:p-6 bg-slate-900/80 rounded-2xl border border-orange-500/20 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-white">Live Alerts</h4>
        <div className="flex items-center gap-1">
          <motion.div
            className="w-2 h-2 rounded-full bg-orange-500"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-xs text-slate-400">Live</span>
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ delay: index * 0.3 }}
              className={`${typeColors[alert.type].bg} border ${typeColors[alert.type].border} rounded-xl p-3 flex items-start gap-3`}
            >
              <alert.icon className={`w-4 h-4 ${typeColors[alert.type].text} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white leading-relaxed">{alert.message}</p>
                <span className="text-xs text-slate-500 mt-1 block">Just now</span>
              </div>
              <Bell className={`w-3 h-3 ${typeColors[alert.type].text} flex-shrink-0`} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const AuditDemo = () => {
  const [scanning, setScanning] = useState(true);
  const [products] = useState([
    { name: 'iPhone 13', status: 'verified', expected: 15, actual: 15 },
    { name: 'Samsung S21', status: 'verified', expected: 8, actual: 8 },
    { name: 'AirPods Pro', status: 'discrepancy', expected: 20, actual: 17 },
    { name: 'MacBook Air', status: 'scanning', expected: 5, actual: '...' },
  ]);

  React.useEffect(() => {
    const timer = setTimeout(() => setScanning(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto p-4 sm:p-6 bg-slate-900/80 rounded-2xl border border-indigo-500/20 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-white">Store Audit</h4>
        <div className="flex items-center gap-2">
          {scanning ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Search className="w-4 h-4 text-indigo-400" />
              </motion.div>
              <span className="text-xs text-indigo-400">Scanning...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-400">Complete</span>
            </>
          )}
        </div>
      </div>

      <div className="relative mb-4 h-16 bg-indigo-950/50 rounded-xl overflow-hidden border border-indigo-500/20">
        <AnimatePresence>
          {scanning && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 flex items-center justify-center">
          <ScanLine className="w-8 h-8 text-indigo-400/50" />
        </div>
      </div>

      <div className="space-y-2">
        {products.map((product, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="bg-white/5 rounded-lg p-2.5 border border-white/10 flex items-center justify-between"
          >
            <div className="flex items-center gap-2 flex-1">
              {product.status === 'verified' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
              {product.status === 'discrepancy' && <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
              {product.status === 'scanning' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                </motion.div>
              )}
              <span className="text-xs text-white">{product.name}</span>
            </div>
            <div className="text-xs text-slate-400">
              {product.actual}/{product.expected}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-slate-400">Progress</span>
        <span className="text-white font-medium">75% Complete</span>
      </div>
      <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
          initial={{ width: 0 }}
          animate={{ width: '75%' }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function FeaturesSection() {
  const [activeDemo, setActiveDemo] = useState(null);

  return (
    <section id="features" aria-label="Sellytics Inventory Management Features" className="relative py-20 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-20"
        >
          <span className="inline-block px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-indigo-400 bg-indigo-500/10 rounded-full border border-indigo-500/20 mb-4 sm:mb-6">
            Powerful Features
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 px-4">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Grow
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 px-4">
            From real-time sales analytics and AI-powered inventory insights to multi-store management, Sellytics provides
            all the tools you need to run a successful retail business.
          </p>
        </motion.div>

        <div className="mb-16 sm:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">See It In Action</h3>
            <p className="text-sm sm:text-base text-slate-400">Click on a feature to view live demo</p>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {['dashboard', 'multistore', 'alerts', 'audit'].map((type) => (
              <button
                key={type}
                onClick={() => setActiveDemo(activeDemo === type ? null : type)}
                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm font-medium transition-all duration-300 ${activeDemo === type
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                  }`}
              >
                {type === 'dashboard' && '📊 Dashboard'}
                {type === 'multistore' && '🏪 Multi-Store'}
                {type === 'alerts' && '🔔 Smart Alerts'}
                {type === 'audit' && '🔍 Store Audit'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeDemo && (
              <motion.div
                key={activeDemo}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center"
              >
                {activeDemo === 'dashboard' && <DashboardDemo />}
                {activeDemo === 'multistore' && <MultiStoreDemo />}
                {activeDemo === 'alerts' && <AlertsDemo />}
                {activeDemo === 'audit' && <AuditDemo />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              onClick={() => feature.hasDemo && setActiveDemo(feature.demoType)}
              className={`group relative p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 hover:bg-white/[0.04] ${feature.hasDemo ? 'cursor-pointer' : ''
                }`}
            >
              {feature.hasDemo && (
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs text-indigo-300 font-medium">
                  View Demo
                </div>
              )}

              <div className={`inline-flex p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.gradient} mb-4 sm:mb-6 shadow-lg`}>
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>

              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                {feature.description}
              </p>

              <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}