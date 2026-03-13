import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Wallet,
  Users2,
  Building2,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

const clusters = [
  {
    id: 'loss-prevention',
    title: 'Loss Prevention & Security',
    subtitle: 'Stop Inventory Leakage',
    description: 'Protect your margins. Our intelligent audit tools help you spot theft and errors before they impact your bottom line.',
    hook: 'Stop losing money to theft. Use the Store Audit Tool to reconcile stock in multiple locations in minutes.',
    icon: ShieldAlert,
    color: 'emerald',
    features: ['Real-time Anomaly Detection', 'Mobile Stock Audit Tool', 'Prevent Stealth Inventory Shrinkage'],
    gradient: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/30'
  },
  {
    id: 'financial-debt',
    title: 'Financial & Debt Clarity',
    subtitle: 'Manage Cash Flow Like a Pro',
    description: 'No more "forgotten" debts. Track who owes you, manage part-payments, and understand your true profit margins.',
    hook: 'Track debtors and part payments with ease. Send professional digital receipts via WhatsApp instantly.',
    icon: Wallet,
    color: 'blue',
    features: ['Smart Debtor Management', 'Automatic WhatsApp Receipts', 'Simplified Profit/Loss Accounting'],
    gradient: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'border-blue-500/30'
  },
  {
    id: 'workforce-ops',
    title: 'Modern Workforce & Ops',
    subtitle: 'Manage Staff From Anywhere',
    description: 'Scale your business with confidence. Assign roles, monitor attendance, and sync multiple outlets in real-time.',
    hook: 'Assign staff roles (Manager vs Cashier) and monitor employee lateness even when you are not in the shop.',
    icon: Users2,
    color: 'purple',
    features: ['Role-Based Access Control', 'Employee Time Sheet Monitoring', 'Dual-Scan (Phone & External Scanners)'],
    gradient: 'from-purple-500/20 to-violet-500/20',
    borderColor: 'border-purple-500/30'
  },
  {
    id: 'revenue-expansion',
    title: 'Revenue Expansion',
    subtitle: 'Monetize Your Extra Space',
    description: 'Don\'t let empty shelves go to waste. Use our unique warehousing tool to turn extra space into a revenue stream.',
    hook: 'Have extra space in your store? List and manage warehouse space for others to earn extra monthly income.',
    icon: Building2,
    color: 'amber',
    features: ['Warehouse Space Management', 'Extra Income Tracking', 'Space-as-a-Service Tools'],
    gradient: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30'
  }
];

const colorMap = {
  emerald: {
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/20',
    icon: 'text-emerald-400',
    accent: 'text-emerald-500'
  },
  blue: {
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/20',
    icon: 'text-blue-400',
    accent: 'text-blue-500'
  },
  purple: {
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/20',
    icon: 'text-purple-400',
    accent: 'text-purple-500'
  },
  amber: {
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/20',
    icon: 'text-amber-400',
    accent: 'text-amber-500'
  }
};

export default function SolutionClusters() {
  return (
    <section className="relative py-24 sm:py-32 bg-slate-950 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 sm:mb-24">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-slate-400 mb-6"
          >
            All-In-One Solution
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold text-white mb-6"
          >
            One App. <span className="text-indigo-400">Total Control</span> Of Your Business.
          </motion.h2>
          <p className="max-w-2xl mx-auto text-lg text-slate-400">
            Sellytics isn't just a POS. It's a comprehensive business intelligence platform designed
            to solve the biggest pain points of retail in emerging markets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {clusters.map((cluster, index) => {
            const colors = colorMap[cluster.color];
            return (
              <motion.div
                key={cluster.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative group p-8 sm:p-10 rounded-3xl bg-white/[0.02] border ${colors.border} backdrop-blur-sm hover:bg-white/[0.04] transition-all duration-500`}
              >
                {/* Feature Icon Column */}
                <div className="flex flex-col sm:flex-row gap-8 items-start">
                  <div className={`flex-shrink-0 p-4 rounded-2xl bg-gradient-to-br ${cluster.gradient} shadow-lg`}>
                    <cluster.icon className={`w-8 h-8 ${colors.icon}`} />
                  </div>

                  <div className="flex-1">
                    <span className={`text-xs font-bold tracking-wider uppercase ${colors.text} mb-2 block`}>
                      {cluster.subtitle}
                    </span>
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors">
                      {cluster.title}
                    </h3>
                    <p className="text-slate-400 mb-6 leading-relaxed">
                      {cluster.description}
                    </p>

                    {/* The "Hook" - Premium styling */}
                    <div className="relative mb-8 p-4 rounded-xl bg-white/5 border-l-4 border-indigo-500 italic text-slate-300 text-sm">
                      "{cluster.hook}"
                    </div>

                    <ul className="space-y-4">
                      {cluster.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center gap-3 text-slate-300">
                          <CheckCircle className={`w-5 h-5 ${colors.accent} flex-shrink-0`} />
                          <span className="text-sm font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button className="mt-10 flex items-center gap-2 text-indigo-400 font-semibold hover:text-indigo-300 transition-colors group/btn">
                      Learn more
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Decorative Corner */}
                <div className={`absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity`}>
                  <cluster.icon className="w-24 h-24" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
