import React from 'react';
import { motion } from 'framer-motion';
import { Store, Briefcase, ShoppingBag, Truck } from 'lucide-react';

const useCases = [
  {
    icon: Store,
    title: 'Retail Shops',
    description: 'Perfect for phone shops, electronics stores, and general merchandise retailers.',
    image: 'images/Emeka.jpg',
  },
  {
    icon: Briefcase,
    title: 'Multi-Store Owners',
    description: 'Manage multiple locations from a single dashboard with real-time synchronization.',
    image: 'images/multistore.jpg',
  },
  {
    icon: Briefcase,
    title: 'Open Market Operations',
    description: 'Tailored for dynamic market stalls, pop-up shops, and vendors thriving on flexible, negotiated pricing.',
    image: 'images/market.jpg',
  },
  {
    icon: ShoppingBag,
    title: 'Corporate Operations',
    description: 'Built for structured retail like supermarkets and chain stores, streamlining inventory and sales with fixed pricing',
    image: 'images/Office.jpg',
  },
  {
    icon: Truck,
    title: 'Distributors',
    description: 'Manage wholesale operations, track deliveries, and monitor B2B relationships.',
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80',
  }
];

export default function UseCasesSection() {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden bg-slate-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-24"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-medium text-emerald-400">Versatile Solutions</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 px-4">
            Built for{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Every Business
              </span>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="absolute bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 blur-sm -z-10"
              />
            </span>
          </h2>

          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-400 px-4 leading-relaxed">
            From bustling market stalls to corporate retail chains, Sellytics adapts to your
            unique business model with precision and flexibility.
          </p>
        </motion.div>

        {/* Use Cases Grid - Staggered Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {useCases.map((useCase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative ${index === 3 ? 'md:col-span-2 lg:col-span-1' : ''}`}
            >
              {/* Card Container with Hover Effect */}
              <div className="relative h-full rounded-3xl overflow-hidden bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 backdrop-blur-sm transition-all duration-500 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2">
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-transparent to-purple-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />

                {/* Image Section */}
                <div className="relative h-56 sm:h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-purple-500/20 mix-blend-overlay z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <img
                    src={useCase.image}
                    alt={`${useCase.title} - Sellytics Inventory Management Solution`}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                  />

                  {/* Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-950/50" />

                  {/* Floating Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="absolute top-4 right-4 p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl"
                  >
                    <useCase.icon className="w-6 h-6 text-emerald-400" />
                  </motion.div>

                  {/* Bottom Gradient Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Content Section */}
                <div className="relative p-6 sm:p-8">
                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors duration-300">
                    {useCase.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-4 group-hover:text-slate-300 transition-colors duration-300">
                    {useCase.description}
                  </p>

                  {/* Learn More Link */}
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-400 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span>Explore use case</span>
                    <motion.svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </motion.svg>
                  </div>
                </div>

                {/* Shine Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transform translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 sm:mt-20 text-center"
        >
          <p className="text-slate-400 mb-6">
            Not sure which model fits your business?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300"
          >
            Talk to Our Team
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}