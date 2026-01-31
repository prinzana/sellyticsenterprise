/**
 * SwiftCheckout - Currency Hook
 * Handles currency formatting and preferences
 */
import { useState, useCallback, useEffect } from 'react';

const CURRENCY_STORAGE_KEY = 'preferred_currency';

export const SUPPORTED_CURRENCIES = [
  { code: 'NGN', symbol: '₦', name: 'Naira' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'Pound Sterling' }
];

export default function useCurrency() {
  const getInitialCurrency = () => {
    if (typeof window !== 'undefined') {
      const storedCode = localStorage.getItem(CURRENCY_STORAGE_KEY);
      return SUPPORTED_CURRENCIES.find(c => c.code === storedCode) || SUPPORTED_CURRENCIES[0];
    }
    return SUPPORTED_CURRENCIES[0];
  };

  const [preferredCurrency, setPreferredCurrency] = useState(getInitialCurrency);

  useEffect(() => {
    const handler = () => setPreferredCurrency(getInitialCurrency());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const setCurrency = useCallback((currencyCode) => {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
    if (currency) {
      localStorage.setItem(CURRENCY_STORAGE_KEY, currencyCode);
      setPreferredCurrency(currency);
    }
  }, []);

  const formatPrice = useCallback((value) => {
    const num = Number(value) || 0;
    return `${preferredCurrency.symbol}${num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }, [preferredCurrency]);

  const formatNumber = useCallback((value) => {
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }, []);

  return {
    preferredCurrency,
    setCurrency,
    formatPrice,
    formatNumber,
    SUPPORTED_CURRENCIES
  };
}