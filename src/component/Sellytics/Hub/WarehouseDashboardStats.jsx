// WarehouseDashboardStats.jsx - Ultra Compact & Sleek Stats Cards
import React from "react";
import { motion } from "framer-motion";
import { 
  Package, 
  RotateCcw,
  Store,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const StatCard = ({ title, value, change, icon: Icon, color, delay = 0 }) => {
  const colorClasses = {
    indigo: {
      gradient: "from-indigo-500/10 to-indigo-600/5",
      iconBg: "bg-indigo-500",
      ring: "ring-indigo-500/20",
      trend: "text-indigo-600"
    },
    emerald: {
      gradient: "from-emerald-500/10 to-emerald-600/5",
      iconBg: "bg-emerald-500",
      ring: "ring-emerald-500/20",
      trend: "text-emerald-600"
    },
    amber: {
      gradient: "from-amber-500/10 to-amber-600/5",
      iconBg: "bg-amber-500",
      ring: "ring-amber-500/20",
      trend: "text-amber-600"
    },
    rose: {
      gradient: "from-rose-500/10 to-rose-600/5",
      iconBg: "bg-rose-500",
      ring: "ring-rose-500/20",
      trend: "text-rose-600"
    },
    violet: {
      gradient: "from-violet-500/10 to-violet-600/5",
      iconBg: "bg-violet-500",
      ring: "ring-violet-500/20",
      trend: "text-violet-600"
    },
    cyan: {
      gradient: "from-cyan-500/10 to-cyan-600/5",
      iconBg: "bg-cyan-500",
      ring: "ring-cyan-500/20",
      trend: "text-cyan-600"
    },
  };

  const colors = colorClasses[color] || colorClasses.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className="group relative"
    >
      {/* Card */}
      <div className={`relative overflow-hidden bg-white dark:bg-surface-800 rounded-xl border border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-lg dark:hover:shadow-slate-950/50`}>
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        
        {/* Content */}
        <div className="relative p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            {/* Left: Stats */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 truncate">{title}</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-1.5">{value}</p>
              
              {change !== null && change !== undefined && (
                <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold ${
                  change >= 0 
                    ? "bg-emerald-50 text-emerald-700" 
                    : "bg-rose-50 text-rose-700"
                }`}>
                  {change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{Math.abs(change)}%</span>
                </div>
              )}
            </div>

            {/* Right: Icon */}
            <div className={`flex-shrink-0 p-2 sm:p-2.5 ${colors.iconBg} rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Bottom Accent Line */}
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      </div>
    </motion.div>
  );
};

const StatSkeleton = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4">
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 space-y-2">
        <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
        <div className="h-6 sm:h-7 w-24 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="h-9 w-9 sm:h-10 sm:w-10 bg-slate-200 rounded-lg animate-pulse" />
    </div>
  </div>
);

export default function WarehouseDashboardStats({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Inventory",
      value: stats?.totalInventory?.toLocaleString() || "0",
      change: stats?.inventoryChange ?? null,
      icon: Package,
      color: "indigo"
    },
    {
      title: "Internal Stores",
      value: stats?.internalStores || "0",
      icon: Store,
      color: "emerald"
    },
    {
      title: "External Clients",
      value: stats?.externalClients || "0",
      icon: Users,
      color: "violet"
    },
    {
      title: "Pending Returns",
      value: stats?.pendingReturns || "0",
      icon: RotateCcw,
      color: stats?.pendingReturns > 0 ? "amber" : "cyan"
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statCards.map((stat, index) => (
        <StatCard
          key={stat.title}
          {...stat}
          delay={index * 0.05}
        />
      ))}
    </div>
  );
}