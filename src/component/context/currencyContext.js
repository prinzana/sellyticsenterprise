// src/context/CurrencyContext.js
import React, { useState, useEffect, useCallback, useContext } from 'react';

const CURRENCY_STORAGE_KEY = 'preferred_currency';

// Define available currencies
const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

const CurrencyContext = React.createContext();

const getInitialCurrency = () => {
  if (typeof window !== 'undefined') {
    const storedCode = localStorage.getItem(CURRENCY_STORAGE_KEY);
    const defaultCurrency = SUPPORTED_CURRENCIES.find(c => c.code === 'NGN') || SUPPORTED_CURRENCIES[0];

    if (storedCode) {
      return SUPPORTED_CURRENCIES.find(c => c.code === storedCode) || defaultCurrency;
    }
    return defaultCurrency;
  }
  return SUPPORTED_CURRENCIES.find(c => c.code === 'NGN') || SUPPORTED_CURRENCIES[0];
};

export function CurrencyProvider({ children }) {
  const [preferredCurrency, setPreferredCurrency] = useState(getInitialCurrency);
  console.log('✅ CurrencyProvider mounted');
  const setCurrency = useCallback((currencyCode) => {
    const newCurrency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
    if (newCurrency) {
      setPreferredCurrency(newCurrency);
      localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency.code);
    }
  }, []);

  // Format price function - ADDED
  // In CurrencyContext.js - UPDATED formatPrice function


  const formatPrice = useCallback((price, options = {}) => {
    const { abbreviate = false } = options;

    if (price === null || price === undefined || price === '') return 'N/A';

    const numPrice = Number(price);
    if (isNaN(numPrice)) return 'N/A';

    const abs = Math.abs(numPrice);
    const symbol = preferredCurrency.symbol;

    // SHORTENING — STARTS AT 100,000 (only if abbreviate is true)
    if (abbreviate) {
      if (abs >= 1_000_000_000_000) {
        return `${symbol}${(numPrice / 1_000_000_000_000).toFixed(2)}T`;
      }

      if (abs >= 1_000_000_000) {
        return `${symbol}${(numPrice / 1_000_000_000).toFixed(2)}B`;
      }

      if (abs >= 1_000_000) {
        return `${symbol}${(numPrice / 1_000_000).toFixed(2)}M`;
      }

      if (abs >= 100_000) {
        return `${symbol}${(numPrice / 1_000).toFixed(2)}K`;
      }
    }

    // NORMAL FORMATTING (NO SHORTENING)
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: preferredCurrency.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numPrice);
    } catch {
      // Fallback
      return `${symbol}${numPrice.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
  }, [preferredCurrency]);

  // Sync on mount
  useEffect(() => {
    const initialCurrency = getInitialCurrency();
    if (preferredCurrency.code !== initialCurrency.code) {
      setPreferredCurrency(initialCurrency);
    }
  }, [preferredCurrency.code]);

  const value = {
    preferredCurrency,
    setCurrency,
    SUPPORTED_CURRENCIES,
    formatPrice, // Now included
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error(
      'useCurrency must be used inside a CurrencyProvider'
    );
  }
  return context;
};
