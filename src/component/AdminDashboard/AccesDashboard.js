import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Cpu, LayoutDashboard, ChevronRight } from 'lucide-react';
import StoreAccess from './StoreAccess';
import FeatureAssignment from './FeatureAssignment';

const sections = [
  {
    key: 'store-access',
    label: 'Architecture Access',
    shortLabel: 'Access',
    icon: Store,
    desc: 'Govern global dashboard permissions and security protocols',
    component: <StoreAccess />,
    gradient: 'from-indigo-500 to-purple-600'
  },
  {
    key: 'feature-assignment',
    label: 'Module Infrastructure',
    shortLabel: 'Modules',
    icon: Cpu,
    desc: 'Dynamic feature allocation and capability provisioning',
    component: <FeatureAssignment />,
    gradient: 'from-purple-500 to-pink-600'
  },
];

const AccesDashboard = () => {
  const [activeTool, setActiveTool] = useState('store-access');
  const currentTool = sections.find((s) => s.key === activeTool);

  return (
    <div className="space-y-8 w-full">
      {/* Strategic Header */}
      <header className="relative p-8 sm:p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-indigo-500/10" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                <LayoutDashboard size={20} />
              </div>
              <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <span>Security</span>
                <ChevronRight size={10} strokeWidth={3} />
                <span className="text-indigo-600">Access Control</span>
              </nav>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              System Authorization <span className="text-indigo-600">Protocol</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl text-sm font-medium leading-relaxed">
              Precision management of global authentication layers and modular feature distribution across the enterprise infrastructure.
            </p>
          </div>

          {/* Segmented Control Navigation */}
          <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 w-full md:w-auto h-14">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeTool === section.key;
              return (
                <button
                  key={section.key}
                  onClick={() => setActiveTool(section.key)}
                  className={`flex-1 md:w-48 flex items-center justify-center gap-3 px-6 rounded-[0.9rem] text-xs font-black uppercase tracking-widest transition-all relative ${isActive
                      ? 'text-white shadow-xl'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-indigo-600 rounded-[0.9rem]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-2.5">
                    <Icon size={16} strokeWidth={isActive ? 3 : 2} />
                    <span className="hidden sm:inline">{section.label}</span>
                    <span className="sm:hidden">{section.shortLabel}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTool}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-4 sm:px-8">
            <div className={`w-2 h-10 rounded-full bg-gradient-to-b ${currentTool.gradient}`} />
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{currentTool.label}</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mt-0.5">{currentTool.desc}</p>
            </div>
          </div>

          <div className="w-full">
            {currentTool.component}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AccesDashboard;
