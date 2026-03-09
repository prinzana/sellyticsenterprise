import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'What is Sellytics and who is it for?',
    answer: 'Sellytics is a mobile-first, offline-ready inventory management and sales tracking platform built for retail businesses in Africa and emerging markets. It\'s perfect for phone shops, electronics stores, supermarkets, open market vendors, multi-store owners, and distributors — anyone who needs to manage stock and track sales efficiently.',
  },
  {
    question: 'Does Sellytics work without internet?',
    answer: 'Yes! Sellytics is built offline-first. You can record sales, add products, manage inventory, track expenses, and run your entire business without internet. All changes automatically sync when you reconnect. It\'s the best offline inventory management app for retail businesses.',
  },
  {
    question: 'How does Sellytics work on slow 2G/3G networks?',
    answer: 'Sellytics is optimized for low-bandwidth areas across Africa and emerging markets. We use intelligent data compression and smart caching to ensure lightning-fast performance even on 2G networks. Most actions use less than 50KB of data, making it the fastest retail management app for low-connectivity environments.',
  },
  {
    question: 'Does Sellytics have a free plan?',
    answer: 'Yes! Sellytics offers a generous free plan that includes up to 50 products, basic sales tracking, inventory management, expense tracking, and 30-day sales history. It\'s the best free inventory management app to get started with — no credit card required.',
  },
  {
    question: 'How much does Sellytics cost?',
    answer: 'Sellytics offers three affordable plans: Free (₦0/month), Premium (₦15,000/month) for growing businesses with unlimited products, analytics, and team collaboration, and Business (₦25,000/month) for multi-store operations with up to 3 stores. Save 20% with yearly billing. Prices are also available in USD, GBP, EUR, and other currencies.',
  },
  {
    question: 'How do I get started with Sellytics?',
    answer: 'Simply click "Start Free Trial" and create your account. Our setup wizard will guide you through adding your first products and making your first sale. Most users are fully set up within 10 minutes. You can also import existing inventory via CSV file.',
  },
  {
    question: 'Can I import my existing inventory into Sellytics?',
    answer: 'Yes! You can import products via CSV file, or use our bulk add feature to quickly onboard your inventory. We also offer migration assistance for Premium and Business plan users to help you transition smoothly from spreadsheets or other systems.',
  },
  {
    question: 'Can Sellytics generate receipts for my customers?',
    answer: 'Yes! Sellytics Premium and Business plans include professional receipt generation. You can generate, share via WhatsApp, and print receipts for every transaction. Each receipt includes a QR code for easy verification.',
  },
  {
    question: 'Is my business data secure with Sellytics?',
    answer: 'Absolutely. We use bank-level encryption (AES-256) for all data, regular automated backups, and comply with international data protection standards. Your business data is stored securely on enterprise-grade infrastructure and is never shared with third parties.',
  },
  {
    question: 'Can I manage multiple store locations with Sellytics?',
    answer: 'Yes! Our Business plan supports multi-store management with up to 3 store locations from a single centralized dashboard. You can view consolidated sales analytics, inventory levels, and staff activity across all locations in real-time.',
  },
  {
    question: 'Is Sellytics easy to use for non-technical people?',
    answer: 'Absolutely! Sellytics has a simplified UX designed for all literacy levels and technical abilities. It works on any smartphone browser — no app download required. Your entire team — from market vendors to store managers — can use it productively from day one.',
  },
  {
    question: 'What customer support does Sellytics offer?',
    answer: 'Free users get email support and access to our help center. Premium users enjoy 24/7 priority support via chat, WhatsApp, and phone. Business users get a dedicated account manager for personalized onboarding and ongoing assistance.',
  },
];

function FAQItem({ faq, index, isOpen, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="border-b border-white/5 last:border-0"
    >
      <button
        onClick={onToggle}
        className="w-full py-5 sm:py-6 flex items-center justify-between text-left group"
      >
        <span className="text-base sm:text-lg font-medium text-white group-hover:text-indigo-400 transition-colors duration-200 pr-4">
          {faq.question}
        </span>
        <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-indigo-600 rotate-180' : ''}`}>
          <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 ${isOpen ? 'text-white' : 'text-slate-400'}`} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-5 sm:pb-6 text-sm sm:text-base text-slate-400 leading-relaxed pr-12 sm:pr-16">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" aria-label="Frequently Asked Questions about Sellytics" className="relative py-20 sm:py-32 overflow-hidden bg-slate-950">
      {/* Background */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-block px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-violet-400 bg-violet-500/10 rounded-full border border-violet-500/20 mb-4 sm:mb-6">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Common{' '}
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Everything you need to know about Sellytics
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="bg-white/[0.02] rounded-2xl sm:rounded-3xl border border-white/5 p-4 sm:p-6 lg:p-8">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-8 sm:mt-12"
        >
          <p className="text-slate-400 mb-4">Still have questions?</p>
          <a
            href="mailto:support@sellytics.com"
            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-200"
          >
            Contact our support team
            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}