import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../../supabaseClient';
import {
    X, Crown, Check, ArrowRight, Mail, Sparkles, Globe,
    X as XIcon, ChevronDown
} from 'lucide-react';
import { PLANS, PLAN_LIMITS } from '../../../utils/planManager';

// ─── CURRENCY CONFIG ────────────────────────
const currencies = {
    NGN: { symbol: '₦', name: 'Nigerian Naira', rate: 1, locale: 'en-NG' },
    USD: { symbol: '$', name: 'US Dollar', rate: 0.0013, locale: 'en-US' },
    GBP: { symbol: '£', name: 'British Pound', rate: 0.0010, locale: 'en-GB' },
    EUR: { symbol: '€', name: 'Euro', rate: 0.0012, locale: 'en-EU' },
    ZAR: { symbol: 'R', name: 'South African Rand', rate: 0.023, locale: 'en-ZA' },
    KES: { symbol: 'KSh', name: 'Kenyan Shilling', rate: 0.17, locale: 'en-KE' },
    GHS: { symbol: '₵', name: 'Ghanaian Cedi', rate: 0.016, locale: 'en-GH' },
};

// ─── FEATURES PER PLAN ──────────────────────
const planFeatures = {
    free: [
        { text: 'Manage up to 50 products', included: true },
        { text: `${PLAN_LIMITS[PLANS.FREE].maxUsersPerStore} team member per store`, included: true },
        { text: 'Basic sales tracking', included: true },
        { text: 'Inventory management', included: true },
        { text: 'Team collaboration', included: false },
        { text: 'Multi-store management', included: false },
    ],
    premium: [
        { text: 'Everything in Free', included: true },
        { text: `${PLAN_LIMITS[PLANS.PREMIUM].maxUsersPerStore} team members per store`, included: true },
        { text: 'Advanced sales analytics', included: true },
        { text: 'Printable receipts', included: true },
        { text: 'Priority support', included: true },
        { text: 'Multi-store management', included: false },
    ],
    business: [
        { text: 'Everything in Premium', included: true },
        { text: `${PLAN_LIMITS[PLANS.BUSINESS].maxUsersPerStore} team members per store`, included: true },
        { text: `Up to ${PLAN_LIMITS[PLANS.BUSINESS].maxStores} stores`, included: true },
        { text: 'Warehouse management', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'Priority onboarding', included: true },
    ],
};

// ─── PLAN ORDER (for hierarchy comparison) ──
const PLAN_ORDER = [PLANS.FREE, PLANS.PREMIUM, PLANS.BUSINESS];

// ─── DETECT CURRENCY ────────────────────────
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

export default function UpgradePlanModal({ isOpen, onClose, currentPlan, reason = 'team_limit' }) {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState('NGN');
    const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
    const [loading, setLoading] = useState(true);

    const currentPlanIndex = PLAN_ORDER.indexOf(currentPlan);
    const isHighestPlan = currentPlan === PLANS.BUSINESS;

    // ─── FETCH PLANS FROM DB ──────────────────
    useEffect(() => {
        if (!isOpen) return;

        const detectedCurrency = detectUserCurrency();
        setSelectedCurrency(detectedCurrency);

        const fetchPlans = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('subscription_plans')
                .select('id, name, price, description')
                .order('price', { ascending: true });

            if (!error && data) {
                // Deduplicate plans to ensure only one card per level is shown
                const seenLevels = new Set();
                const uniquePlans = data.filter(plan => {
                    const level = getPlanKey(plan.name);
                    if (seenLevels.has(level)) return false;
                    seenLevels.add(level);
                    return true;
                });
                setPlans(uniquePlans);
            }
            setLoading(false);
        };
        fetchPlans();
    }, [isOpen]);

    if (!isOpen) return null;

    // ─── CURRENCY HELPERS ─────────────────────
    const convertPrice = (priceInNGN) => {
        if (priceInNGN === 0) return 0;
        return Math.round(priceInNGN * currencies[selectedCurrency].rate);
    };

    const formatPrice = (price) => {
        if (price === 0) return 'Free';
        try {
            return new Intl.NumberFormat(currencies[selectedCurrency].locale, {
                style: 'currency',
                currency: selectedCurrency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(price);
        } catch {
            return `${currencies[selectedCurrency].symbol}${price.toLocaleString()}`;
        }
    };

    // ─── SUBSCRIBE HANDLER ────────────────────
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
        onClose();
        navigate('/payment', { state: { plan: normalizedPlan } });
    };

    // ─── REASON TEXT ──────────────────────────
    const reasonText = reason === 'team_limit'
        ? "You've reached the team member limit for your current plan."
        : reason === 'store_limit'
            ? "You've reached the store limit for your current plan."
            : reason === 'product_limit'
                ? "You've reached the product limit for your current plan."
                : "This feature requires a higher plan.";

    // ─── PLAN STYLING ─────────────────────────
    const getPlanStyle = (planName) => {
        const key = planName?.toLowerCase() || '';
        if (key.includes('business')) return {
            border: 'border-purple-500 dark:border-purple-400',
            text: 'text-purple-700 dark:text-purple-400',
            btn: 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-purple-500/30',
        };
        if (key.includes('premium')) return {
            border: 'border-blue-500 dark:border-blue-400',
            text: 'text-blue-600 dark:text-blue-400',
            btn: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/30',
        };
        return {
            border: 'border-green-500 dark:border-green-400',
            text: 'text-green-600 dark:text-green-400',
            btn: '',
        };
    };

    const getPlanKey = (planName) => {
        const n = planName?.toLowerCase() || '';
        if (n.includes('business')) return PLANS.BUSINESS;
        if (n.includes('premium')) return PLANS.PREMIUM;
        return PLANS.FREE;
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
                {/* ─── HEADER ─────────────────── */}
                <div className="relative overflow-hidden rounded-t-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-90" />
                    <div className="relative p-6 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Crown className="w-5 h-5 text-amber-300" />
                                <span className="text-white/80 text-xs font-bold uppercase tracking-wider">Upgrade Required</span>
                            </div>
                            <h2 className="text-xl font-bold text-white">{reasonText}</h2>
                            <p className="text-white/70 text-sm mt-1">
                                {isHighestPlan
                                    ? 'You are on the highest plan. Contact support for enterprise options.'
                                    : 'Choose a higher plan to unlock more capacity.'}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* ─── CURRENT PLAN + CURRENCY ── */}
                <div className="px-6 py-3 bg-indigo-50 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Your current plan:</span>
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 px-2.5 py-0.5 rounded-full">
                            {currentPlan}
                        </span>
                    </div>

                    {/* Currency selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-indigo-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all text-xs"
                        >
                            <Globe className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                            <span className="font-medium">{currencies[selectedCurrency].symbol} {selectedCurrency}</span>
                            <ChevronDown className="w-3 h-3" />
                        </button>
                        {showCurrencyMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowCurrencyMenu(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute top-full mt-1 right-0 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50"
                                >
                                    <div className="p-1.5 max-h-60 overflow-y-auto">
                                        {Object.entries(currencies).map(([code, config]) => (
                                            <button
                                                key={code}
                                                onClick={() => { setSelectedCurrency(code); setShowCurrencyMenu(false); }}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-all ${selectedCurrency === code
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                <span className="font-medium">{config.symbol} {code}</span>
                                                <span className="opacity-60">{config.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </div>
                </div>

                {/* ─── PLAN CARDS ────────────── */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : isHighestPlan ? (
                        /* ─── ENTERPRISE CONTACT ──── */
                        <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
                                <Crown className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Enterprise Plan
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto mb-6">
                                Need more than {PLAN_LIMITS[PLANS.BUSINESS].maxUsersPerStore} team members per store
                                or more than {PLAN_LIMITS[PLANS.BUSINESS].maxStores} stores?
                                Contact our support team for a custom enterprise plan.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <a
                                    href="mailto:support@sellytics.com?subject=Enterprise Plan Request"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20"
                                >
                                    <Mail className="w-4 h-4" /> Contact Support
                                </a>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* ─── PLAN CARDS GRID ──────── */
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {plans.map((plan) => {
                                const planKey = getPlanKey(plan.name);
                                const planIndex = PLAN_ORDER.indexOf(planKey);
                                const isCurrent = planKey === currentPlan;
                                const isLower = planIndex < currentPlanIndex;
                                const isUpgrade = planIndex > currentPlanIndex;
                                const isFree = plan.price === 0;
                                const style = getPlanStyle(plan.name);
                                const featureKey = planKey.toLowerCase();
                                const convertedPrice = convertPrice(plan.price);

                                return (
                                    <motion.div
                                        key={plan.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: planIndex * 0.1 }}
                                        className={`relative rounded-2xl border-2 p-5 transition-all duration-200 flex flex-col ${isCurrent
                                            ? `${style.border} bg-indigo-50/50 dark:bg-indigo-950/20`
                                            : isLower
                                                ? 'border-gray-200 dark:border-gray-800 opacity-40 cursor-not-allowed'
                                                : `${style.border} hover:shadow-xl hover:-translate-y-1 cursor-pointer`
                                            }`}
                                    >
                                        {/* Badges */}
                                        {isCurrent && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider whitespace-nowrap">
                                                Current Plan
                                            </div>
                                        )}
                                        {isUpgrade && planIndex === currentPlanIndex + 1 && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
                                                <Sparkles className="w-3 h-3" /> Recommended
                                            </div>
                                        )}

                                        {/* Plan header */}
                                        <div className="flex-1">
                                            <h3 className={`text-xl font-bold ${style.text} mb-1`}>{plan.name} Plan</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 min-h-[32px]">
                                                {plan.description}
                                            </p>

                                            {/* Price */}
                                            <div className="mb-4">
                                                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                                                    {isFree ? 'Free' : formatPrice(convertedPrice)}
                                                </span>
                                                {!isFree && (
                                                    <span className="text-sm text-gray-500 dark:text-gray-400 font-normal"> /month</span>
                                                )}
                                            </div>

                                            {/* Features */}
                                            <ul className="space-y-2 mb-5">
                                                {(planFeatures[featureKey] || []).map((f, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-xs">
                                                        {f.included ? (
                                                            <Check className="w-3.5 h-3.5 mt-0.5 text-green-500 flex-shrink-0" />
                                                        ) : (
                                                            <XIcon className="w-3.5 h-3.5 mt-0.5 text-gray-400 flex-shrink-0" />
                                                        )}
                                                        <span className={f.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}>
                                                            {f.text}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Action button */}
                                        {isUpgrade && (
                                            <motion.button
                                                onClick={() => handleSubscribe(plan)}
                                                className={`w-full py-2.5 bg-gradient-to-r ${style.btn} text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg`}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                Subscribe to {plan.name} <ArrowRight className="w-3.5 h-3.5" />
                                            </motion.button>
                                        )}
                                        {isCurrent && (
                                            <div className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-500 text-sm font-bold rounded-xl text-center">
                                                Your Plan
                                            </div>
                                        )}
                                        {isLower && !isCurrent && (
                                            <div className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-400 text-sm rounded-xl text-center">
                                                —
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {/* Currency note */}
                    {!isHighestPlan && selectedCurrency !== 'NGN' && (
                        <p className="text-center text-[10px] text-gray-400 mt-3">
                            Prices converted from NGN. Payment processed in NGN via Paystack.
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
