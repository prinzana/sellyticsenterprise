import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, WifiOff, Zap, Users, Signal, Cloud, Download, Upload } from 'lucide-react';

const offlineFeatures = [
  {
    icon: WifiOff,
    title: 'Works Offline',
    description: 'Record sales, add products, and manage inventory without internet. All changes sync automatically when you reconnect.',
  },
  {
    icon: Signal,
    title: 'Low Bandwidth Optimized',
    description: 'Designed for 2G/3G networks. Lightning fast on slow connections with intelligent data compression.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-First Design',
    description: 'Built from the ground up for mobile. Full functionality on any smartphone — no app download needed.',
  },
  {
    icon: Zap,
    title: 'Instant Load Times',
    description: 'Smart caching ensures pages load in milliseconds, even on older phones with limited memory.',
  },
  {
    icon: Cloud,
    title: 'Auto-Sync When Online',
    description: 'Your data syncs seamlessly in the background. Work offline, sync when convenient.',
  },
  {
    icon: Users,
    title: 'Simplified for Everyone',
    description: 'Intuitive UX designed for all literacy levels. Your entire team can use it from day one.',
  },
];

const techSpecs = [
  { label: 'Works on 2G', icon: Signal },
  { label: 'Offline Mode', icon: WifiOff },
  { label: 'Auto-Sync', icon: Cloud },
  { label: 'Mobile First', icon: Smartphone },
];

export default function OfflineFeatures() {
  return (
    <section id="offline" aria-label="Offline Inventory Management Features" className="relative py-20 sm:py-32 overflow-hidden bg-slate-950">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Mobile Phone Mockup Pattern - Hidden on mobile */}
      <div className="hidden lg:block absolute right-[5%] top-1/2 -translate-y-1/2 opacity-5">
        <div className="w-64 h-[520px] rounded-[3rem] border-8 border-white/20 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-white/20 rounded-b-3xl" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-block px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-4 sm:mb-6">
            Built for a dynamic Environment
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 px-4">
            Business Never Stops.{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Neither Should You.
            </span>
          </h2>
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-400 px-4 mb-8 sm:mb-10">
            Sellytics works perfectly in low-bandwidth areas,
            remote locations, and crowded markets. Run your business anywhere, anytime —
            with or without internet.
          </p>

          {/* Tech Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {techSpecs.map((spec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl"
              >
                <spec.icon className="w-4 h-4 text-emerald-400" />
                <span className="text-xs sm:text-sm font-medium text-emerald-300">{spec.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Split Layout */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center mb-16 sm:mb-20">
          {/* Left: Visual Demo */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Phone Frame */}
            <div className="relative mx-auto max-w-[300px] sm:max-w-[340px]">
              {/* Phone */}
              <div className="relative bg-slate-900 rounded-[2.5rem] border-[8px] sm:border-[10px] border-slate-800 shadow-2xl overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 sm:w-36 h-6 sm:h-7 bg-slate-800 rounded-b-3xl z-10" />

                {/* Screen Content */}
                <div className="relative aspect-[9/19] bg-gradient-to-b from-slate-950 to-slate-900 p-6">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-xs text-white mb-6 px-2">
                    <div className="flex items-center gap-1">
                      <WifiOff className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-500">Offline</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-3 border border-white rounded-sm relative">
                        <div className="absolute inset-0.5 bg-emerald-500 rounded-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Demo Content */}
                  <div className="space-y-3">
                    <div className="bg-emerald-600/20 rounded-xl p-3 border border-emerald-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs text-emerald-300 font-medium">Recording Sale...</span>
                      </div>

                      <div className="h-1.5 bg-emerald-500/20 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-emerald-500"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>

                    </div>
                    <div className="bg-indigo-600/20 rounded-xl p-3 border border-emerald-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-xs text-indigo-300 font-medium">Recording Inventory...</span>
                      </div>

                      <div className="h-1.5 bg-emerald-500/20 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-emerald-500"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div></div>
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                          <div className="h-2 bg-white/10 rounded w-3/4 mb-1.5" />
                          <div className="h-1.5 bg-white/5 rounded w-1/2" />
                        </div>
                      ))}
                    </div>

                    <div className="bg-indigo-600/20 rounded-xl p-3 border border-indigo-500/30 flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs text-indigo-300">Will sync when online</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Icons */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -right-4 top-1/4 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl p-3 backdrop-blur-xl"
              >
                <Download className="w-5 h-5 text-emerald-400" />
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute -left-4 top-2/3 bg-teal-600/20 border border-teal-500/30 rounded-2xl p-3 backdrop-blur-xl"
              >
                <Upload className="w-5 h-5 text-teal-400" />
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Features List */}
          <div className="space-y-4 sm:space-y-5">
            {offlineFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex gap-4 p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 hover:bg-white/[0.04] transition-all duration-300 group"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors duration-300">
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {[
            { value: '99.9%', label: 'Offline Availability', color: 'emerald' },
            { value: '<50KB', label: 'Data Per Session', color: 'indigo' },
            { value: '2G+', label: 'Network Support', color: 'cyan' },
            { value: '<1s', label: 'Page Load Time', color: 'indigo' },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-4 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/5"
            >
              <div className={`text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-${stat.color}-400 to-${stat.color}-600 bg-clip-text text-transparent mb-2`}>
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}