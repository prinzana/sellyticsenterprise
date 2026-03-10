import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import { Globe, Check, X, Sparkles } from 'lucide-react';

// Currency configuration
const currencies = {
  NGN: { symbol: '₦', name: 'Nigerian Naira', rate: 1, locale: 'en-NG' },
  USD: { symbol: '$', name: 'US Dollar', rate: 0.0013, locale: 'en-US' },
  GBP: { symbol: '£', name: 'British Pound', rate: 0.0010, locale: 'en-GB' },
  EUR: { symbol: '€', name: 'Euro', rate: 0.0012, locale: 'en-EU' },
  ZAR: { symbol: 'R', name: 'South African Rand', rate: 0.023, locale: 'en-ZA' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling', rate: 0.17, locale: 'en-KE' },
  GHS: { symbol: '₵', name: 'Ghanaian Cedi', rate: 0.016, locale: 'en-GH' },
};

// Static features mapping (unchanged)
const features = {
  free: [
    { text: 'Manage up to 50 products with ease', included: true },
    { text: 'Basic sales tracking for daily operations', included: true },
    { text: 'Inventory, product, and pricing management', included: true },
    { text: 'Track expenses and customer debts', included: true },
    { text: 'View sales history (last 30 days)', included: true },
    { text: 'Team collaboration features', included: false },
    { text: 'Multi-store management', included: false },
    { text: 'Staff training resources', included: false },
    { text: 'Priority support', included: false },
    { text: 'Printable receipts', included: false },
    { text: 'Access to a dedicted Warehouse', included: false },
  ],
  premium: [
    { text: 'All Free Plan features', included: true },
    { text: 'Advanced sales analytics dashboard', included: true },
    { text: 'Full sales history and downloadable reports', included: true },
    { text: 'Staff onboarding and training', included: true },
    { text: 'Priority customer support (24/7)', included: true },
    { text: 'Printable and email-ready receipts', included: true },
    { text: 'Single-store team collaboration', included: true },
    { text: 'Multi-store management', included: false },
    { text: 'Advanced product insights', included: false },
    { text: 'Priority onboarding', included: false },
    { text: 'Access to a dedicted Warehouse', included: false },
  ],
  business: [
    { text: 'All Free and Premium Plan features', included: true },
    { text: 'Manage up to 3 stores with multi-store dashboard', included: true },
    { text: 'Advanced product insights and analytics', included: true },
    { text: 'Multi-store team management', included: true },
    { text: 'Dedicated account manager', included: true },
    { text: 'Priority Onboarding', included: true },
    { text: 'Priority onboarding', included: true },
    { text: 'Access to a dedicted Warehouse', included: true },
  ],
};

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, type: 'spring', stiffness: 100 } },
};

// Detect user's currency
const detectUserCurrency = () => {
  const userLocale = navigator.language || 'en-NG';
  const localeMap = {
    'en-US': 'USD', 'en-GB': 'GBP', 'en-NG': 'NGN',
    'en-ZA': 'ZAR', 'en-KE': 'KES', 'en-GH': 'GHS',
  };
  for (const [locale, currency] of Object.entries(localeMap)) {
    if (userLocale.startsWith(locale)) return currency;
  }
  return 'NGN';
};

export default function SubscriptionPlansComponent() {
  const [expandedPlans, setExpandedPlans] = useState({});
  const [plans, setPlans] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState('NGN');
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const navigate = useNavigate();

  // Auto-detect currency on mount
  useEffect(() => {
    const detectedCurrency = detectUserCurrency();
    setSelectedCurrency(detectedCurrency);
  }, []);

  // Fetch plans from Supabase
  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('id, name, price, description')
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching plans:', error);
      } else {
        // Deduplicate plans to ensure only one card per level is shown
        const seenLevels = new Set();
        const getLevel = (name) => {
          const n = name?.toLowerCase() || '';
          if (n.includes('business')) return 'business';
          if (n.includes('premium')) return 'premium';
          return 'free';
        };

        const uniquePlans = data.filter(plan => {
          const level = getLevel(plan.name);
          if (seenLevels.has(level)) return false;
          seenLevels.add(level);
          return true;
        });
        setPlans(uniquePlans);
      }
    };
    fetchPlans();
  }, []);

  // Convert price to selected currency
  const convertPrice = (priceInNGN) => {
    if (priceInNGN === 0) return 0;
    const rate = currencies[selectedCurrency].rate;
    return Math.round(priceInNGN * rate);
  };

  // Format price with proper currency
  const formatPrice = (price) => {
    const currencyConfig = currencies[selectedCurrency];
    if (price === 0) return 'Free';

    try {
      return new Intl.NumberFormat(currencyConfig.locale, {
        style: 'currency',
        currency: selectedCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    } catch {
      return `${currencyConfig.symbol}${price.toLocaleString()}`;
    }
  };

  const toggleDetails = (planId) => {
    setExpandedPlans((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };

  const handleSubscribe = (plan) => {
    const convertedPrice = convertPrice(plan.price);
    const normalizedPlan = {
      ...plan,
      nameKey: plan.name.toLowerCase().trim(),
      convertedPrice,
      currency: selectedCurrency,
      currencySymbol: currencies[selectedCurrency].symbol,
      originalPrice: plan.price,
    };
    navigate('/payment', { state: { plan: normalizedPlan } });
  };

  return (
    <motion.section
      className="py-20 md:py-24 px-6 md:px-20 bg-gradient-to-b from-indigo-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
    >
      {/* Wavy Borders */}
      <svg className="absolute top-0 w-full" viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path d="M0,0 C280,100 720,0 1440,100 L1440,0 Z" fill="url(#gradient)" className="dark:fill-gray-800" />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#e0e7ff', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#c7d2fe', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>
      <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path d="M0,100 C280,0 720,100 1440,0 L1440,100 Z" fill="url(#gradient)" className="dark:fill-gray-800" />
      </svg>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <motion.h2
            className="text-3xl md:text-4xl font-extrabold text-indigo-900 dark:text-white font-sans"
            variants={cardVariants}
          >
            Unlock Your Business Potential
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-gray-600 dark:text-gray-300 font-medium max-w-3xl mx-auto"
            variants={cardVariants}
          >
            Whether you're launching a small shop or scaling multiple stores, our flexible plans empower your growth.
          </motion.p>

          {/* Currency Selector */}
          <motion.div
            className="flex justify-center mt-6"
            variants={cardVariants}
          >
            <div className="relative">
              <button
                onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-gray-800 border border-indigo-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              >
                <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium">
                  {currencies[selectedCurrency].symbol} {selectedCurrency}
                </span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Currency Dropdown */}
              {showCurrencyMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowCurrencyMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-2 max-h-80 overflow-y-auto">
                      {Object.entries(currencies).map(([code, config]) => (
                        <button
                          key={code}
                          onClick={() => {
                            setSelectedCurrency(code);
                            setShowCurrencyMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${selectedCurrency === code
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                          <span className="text-sm font-medium">
                            {config.symbol} {code}
                          </span>
                          <span className="text-xs opacity-70">{config.name}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>

          {/* Currency Info */}
          <motion.p
            className="text-sm text-gray-500 dark:text-gray-400 mt-2"
            variants={cardVariants}
          >
            Prices shown in {currencies[selectedCurrency].name}
            {selectedCurrency !== 'NGN' && ' (converted from NGN)'}
          </motion.p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const getLevel = (name) => {
              const n = name?.toLowerCase() || '';
              if (n.includes('business')) return 'business';
              if (n.includes('premium')) return 'premium';
              return 'free';
            };
            const planKey = getLevel(plan.name);
            const isFree = plan.price === 0;
            const isPremium = planKey === 'premium';
            const isExpanded = expandedPlans[plan.id] || false;
            const convertedPrice = convertPrice(plan.price);

            return (
              <motion.div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-800 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 flex flex-col justify-between border-2 ${isPremium
                  ? 'border-blue-500 dark:border-blue-400'
                  : planKey === 'business'
                    ? 'border-purple-500 dark:border-purple-400'
                    : 'border-green-500 dark:border-green-400'
                  }`}
                variants={cardVariants}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                {/* Popular Badge */}
                {isPremium && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </div>
                )}

                <div className="space-y-4">
                  {/* Plan Name */}
                  <h2
                    className={`text-2xl font-bold capitalize ${isPremium
                      ? 'text-blue-600 dark:text-blue-400'
                      : planKey === 'business'
                        ? 'text-purple-700 dark:text-purple-400'
                        : 'text-green-600 dark:text-green-400'
                      }`}
                  >
                    {plan.name} Plan
                  </h2>

                  {/* Description */}
                  <p className="text-base text-gray-700 dark:text-gray-300 min-h-[48px]">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="py-4">
                    <p className="text-4xl font-extrabold text-indigo-900 dark:text-white">
                      {isFree ? 'Free' : formatPrice(convertedPrice)}
                      {!isFree && (
                        <span className="text-base text-gray-500 dark:text-gray-400 font-normal"> /month</span>
                      )}
                    </p>
                  </div>

                  {/* Toggle Details Button */}
                  <button
                    className="w-full bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 py-2.5 px-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                    onClick={() => toggleDetails(plan.id)}
                  >
                    {isExpanded ? 'Hide Details' : 'Show Details'}
                  </button>

                  {/* Features List */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3 overflow-hidden"
                      >
                        {features[planKey]?.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            {feature.included ? (
                              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            )}
                            <span className={`text-sm ${feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'}`}>
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>

                {/* Subscribe Button */}
                <motion.button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isFree}
                  className={`mt-6 w-full py-3 px-4 font-semibold rounded-xl transition-all duration-300 ${isFree
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                    : isPremium
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-blue-500/30'
                      : planKey === 'business'
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-purple-500/30'
                        : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-green-500/30'
                    }`}
                  whileHover={!isFree ? { scale: 1.02 } : {}}
                  whileTap={!isFree ? { scale: 0.98 } : {}}
                >
                  {isFree ? 'Current Plan' : `Subscribe to ${plan.name}`}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}