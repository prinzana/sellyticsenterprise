// StoresList.jsx - Stores List Component (shadcn components replaced with plain HTML/Tailwind)
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Store, 
  ChevronRight, 
  Plus, 
  Building2,
  Mail,
  Phone,
  Package,
  RefreshCw
} from "lucide-react";
import ClientOnboardModal from "./ClientOnboardModal";

const StoreCard = ({ store, type, onSelect }) => {
  const isInternal = type === "internal";
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(store)}
      className="cursor-pointer"
    >
      <div className={`
        p-4 rounded-xl border-2 transition-all duration-200
        ${isInternal 
          ? "border-emerald-200 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-surface-800 hover:border-emerald-400" 
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-800 hover:border-indigo-300 dark:hover:border-indigo-500"
        }
        hover:shadow-lg
      `}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`
              p-2 rounded-lg
              ${isInternal ? "bg-emerald-100 dark:bg-emerald-950/60" : "bg-slate-100 dark:bg-surface-700"}
            `}>
              {isInternal ? (
                <Store className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Building2 className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">{store.client_name}</h4>
              {store.business_name && store.business_name !== store.client_name && (
                <p className="text-xs text-slate-500 dark:text-slate-400">{store.business_name}</p>
              )}
            </div>
          </div>
          <span 
            className={`
              inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
              ${isInternal 
                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" 
                : "bg-slate-100 dark:bg-surface-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
              }
            `}
          >
            {isInternal ? "Internal" : "External"}
          </span>
        </div>

        <div className="space-y-1 text-sm text-slate-500 dark:text-slate-400 mb-3">
          {store.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              <span className="truncate">{store.email}</span>
            </div>
          )}
          {store.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" />
              <span>{store.phone}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Package className="w-4 h-4" />
            <span>{store.product_count || 0} products</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500" />
        </div>
      </div>
    </motion.div>
  );
};

const StoreSkeleton = () => (
  <div className="p-4 rounded-xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-surface-800">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-surface-700 animate-pulse" />
        <div>
          <div className="h-5 w-32 bg-slate-200 dark:bg-surface-700 rounded animate-pulse" />
          <div className="h-3 w-24 mt-1 bg-slate-200 dark:bg-surface-700 rounded animate-pulse" />
        </div>
      </div>
      <div className="h-5 w-16 bg-slate-200 dark:bg-surface-700 rounded-full animate-pulse" />
    </div>
    <div className="h-4 w-full bg-slate-200 dark:bg-surface-700 rounded animate-pulse mb-2" />
    <div className="h-4 w-2/3 bg-slate-200 dark:bg-surface-700 rounded animate-pulse" />
  </div>
);

export default function StoresList({ 
  title, 
  subtitle, 
  stores, 
  type, 
  loading, 
  onStoreSelect,
  warehouseId,
  onRefresh 
}) {
  const [showOnboardModal, setShowOnboardModal] = useState(false);

  const handleOnboardSuccess = () => {
    setShowOnboardModal(false);
    onRefresh?.();
  };

  return (
    <>
      {/* Main Card - replaced shadcn Card with div + Tailwind */}
      <div className="bg-white dark:bg-surface-800 rounded-xl shadow-lg dark:shadow-surface-950/50 border border-slate-100 dark:border-slate-700/60">
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onRefresh}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                aria-label="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              {type === "external" && (
                <button
                  onClick={() => setShowOnboardModal(true)}
                  className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Client
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => <StoreSkeleton key={i} />)}
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <div className={`
                w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4
                ${type === "internal" ? "bg-emerald-100 dark:bg-emerald-950/60" : "bg-slate-100 dark:bg-slate-800"}
              `}>
                {type === "internal" ? (
                  <Store className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                )}
              </div>
              <h4 className="font-medium text-slate-600 dark:text-slate-300">No {type} stores yet</h4>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                {type === "internal" 
                  ? "Internal stores are auto-linked from Sellytics"
                  : "Add external clients to manage their inventory"
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2">
              <AnimatePresence>
                {stores.map((store) => (
                  <StoreCard 
                    key={store.id} 
                    store={store} 
                    type={type}
                    onSelect={onStoreSelect}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Onboard Modal - unchanged (assumed to be custom) */}
      <AnimatePresence>
        {showOnboardModal && (
          <ClientOnboardModal
            warehouseId={warehouseId}
            onClose={() => setShowOnboardModal(false)}
            onSuccess={handleOnboardSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
}