import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Package, TrendingUp, Shield } from 'lucide-react';

const floatingIcons = [
  { Icon: BarChart3, position: 'top-20 left-[10%]', delay: 0 },
  { Icon: Package, position: 'top-32 right-[15%]', delay: 0.2 },
  { Icon: TrendingUp, position: 'bottom-32 left-[20%]', delay: 0.4 },
  { Icon: Shield, position: 'bottom-20 right-[10%]', delay: 0.6 },
];

export default function HeroSection() {
  return (
    <section id="hero" aria-label="Sellytics - Inventory Management and Sales Tracking" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 sm:pt-24">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-indigo-600/20 rounded-full blur-[100px] sm:blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-purple-600/20 rounded-full blur-[100px] sm:blur-[120px]" />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Floating Icons - Hidden on mobile */}
      <div className="hidden lg:block">
        {floatingIcons.map(({ Icon, position, delay }, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.5, duration: 0.8 }}
            className={`absolute ${position}`}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
              className="p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl"
            >
              <Icon className="w-6 h-6 text-indigo-400" />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-6 sm:mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-300">Offline-First Inventory App • Mobile-Optimized • AI-Powered Analytics</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6"
          >
            <span className="bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
              Inventory Management & Sales Tracking
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Built for Modern Retail Businesses
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-slate-400 mb-8 sm:mb-10 px-4"
          >
            <span className="text-white font-semibold">Mobile-first. Offline-ready.</span> The best inventory management software for retail businesses.
            Manage stock, track sales, generate receipts, and get AI-powered insights — even without internet. Works perfectly on 2G/3G networks.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4"
          >
            <Link
              to="/register"
              className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            {/* <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium text-white border border-white/10 rounded-full hover:bg-white/5 transition-all duration-300 backdrop-blur-xl">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
              </div>
              Watch Demo
            </button>*/}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 sm:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 max-w-4xl mx-auto"
          >
            {[
              { value: '1K+', label: 'Active Retail Users' },
              { value: '500K+', label: 'Sales Tracked Offline' },
              { value: '99.9%', label: 'Platform Uptime' },
              { value: '4.9/5', label: 'User Rating' },
            ].map((stat, index) => (
              <div key={index} className="text-center p-4 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
    </section>
  );
}