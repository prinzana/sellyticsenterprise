import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';
import FinancialFilters from './FinancialFilters';
import FinancialStatsCards from './FinancialStatsCards';
import SalesTrendChart from './SalesTrendChart';
import CogsVsSalesChart from './CogsVsSalesChart';
import ExpenseBreakdownChart from './ExpenseBreakdownChart';
import TopProductsList from './TopProductsList';
import StoreComparisonChart from './StoreComparisonChart';
import StoreComparisonList from './StoreComparisonList';
import { useStores } from './useStores';
import { useSales } from './useSales';
import { useExpenses } from './useExpenses';
import { useDebts } from './useDebts';
import { useInventory } from './useInventory';
import { useStoreComparison } from './useStoreComparison';
import { useFinancialMetrics } from './useFinancialMetrics';
import { useChartData } from './useChartData';
import { useComparisonData } from './useComparisonData';

const SUPPORTED_CURRENCIES = [
    { code: 'NGN', symbol: '₦', name: 'Naira' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'Pound Sterling' },
];

export default function FinancialDashboard() {
    const ownerId = Number(localStorage.getItem('owner_id')) || null;
    const [timeFilter, setTimeFilter] = useState('30d');
    const [timeGranularity, setTimeGranularity] = useState('monthly');
    const [metricFilter, setMetricFilter] = useState('All');
    const [comparisonMetric, setComparisonMetric] = useState('totalSales');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const { preferredCurrency, setPreferredCurrency } = useCurrency();
    const { stores, storeId, setStoreId, isLoading: storesLoading } = useStores(ownerId);
    const { sales, fetchSales, isLoading: salesLoading } = useSales();
    const { expenses, fetchExpenses, isLoading: expensesLoading } = useExpenses();
    const { debts, fetchDebts, isLoading: debtsLoading } = useDebts();
    const { inventory, products, fetchInventory, isLoading: inventoryLoading } = useInventory();
    const { storeComparison, fetchStoreComparison, isLoading: comparisonLoading } = useStoreComparison();

    const isLoading = storesLoading || salesLoading || expensesLoading || debtsLoading || inventoryLoading || comparisonLoading;

    const setCurrency = (code) => {
        const currency = SUPPORTED_CURRENCIES.find(c => c.code === code);
        if (currency) {
            setPreferredCurrency(currency);
        }
    };

    // Computed values using custom hooks
    const metrics = useFinancialMetrics(sales, expenses, debts, inventory, products);
    const chartData = useChartData(sales, expenses, timeGranularity, metrics.totalSales, metrics.totalCOGS, preferredCurrency);
    const comparisonData = useComparisonData(storeComparison, comparisonMetric, preferredCurrency);

    // Effects

    useEffect(() => {
        if (metricFilter === 'Comparison') {
            fetchStoreComparison(stores, timeFilter, startDate, endDate);
        } else if (storeId) {
            fetchSales(storeId, timeFilter, startDate, endDate);
            fetchExpenses(storeId, timeFilter, startDate, endDate);
            fetchDebts(storeId, timeFilter, startDate, endDate);
            fetchInventory(storeId);
        }
    }, [storeId, metricFilter, timeFilter, startDate, endDate, stores, fetchSales, fetchExpenses, fetchDebts, fetchInventory, fetchStoreComparison]);

    if (!ownerId) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-red-600 dark:text-red-400 text-lg font-semibold">
                        Please log in to access this page.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 w-full overflow-x-hidden">
            {/* Dynamic Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40 dark:opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 blur-[120px] rounded-full"></div>
            </div>

            <div className="relative w-full px-2 sm:px-4 py-4 space-y-4 sm:space-y-6">
                {/* Header Section */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-40 -mx-2 sm:-mx-4">
                    <div className="w-full px-4 sm:px-6 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
                                    Financial Dashboard
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                    Comprehensive financial analytics and performance metrics
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Section - More compact & floaty */}
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-2 sm:p-3 overflow-hidden">
                    <FinancialFilters
                        stores={stores}
                        storeId={storeId}
                        setStoreId={setStoreId}
                        timeFilter={timeFilter}
                        setTimeFilter={setTimeFilter}
                        timeGranularity={timeGranularity}
                        setTimeGranularity={setTimeGranularity}
                        metricFilter={metricFilter}
                        setMetricFilter={setMetricFilter}
                        startDate={startDate}
                        setStartDate={setStartDate}
                        endDate={endDate}
                        setEndDate={setEndDate}
                        preferredCurrency={preferredCurrency}
                        setCurrency={setCurrency}
                        SUPPORTED_CURRENCIES={SUPPORTED_CURRENCIES}
                        onApply={() => {
                            if (metricFilter === 'Comparison') {
                                fetchStoreComparison(stores, timeFilter, startDate, endDate);
                            } else if (storeId) {
                                fetchSales(storeId, timeFilter, startDate, endDate);
                                fetchExpenses(storeId, timeFilter, startDate, endDate);
                                fetchDebts(storeId, timeFilter, startDate, endDate);
                                fetchInventory(storeId);
                            } else {
                                toast.error('Please select a store');
                            }
                        }}
                        isLoading={isLoading}
                    />
                </div>

                {/* Content Area */}
                {metricFilter !== 'Comparison' && storeId && (
                    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Stats Cards - Expanded and Modernized */}
                        <div className="w-full">
                            <FinancialStatsCards
                                totalSales={metrics.totalSales}
                                totalExpenses={metrics.totalExpenses}
                                totalDebts={metrics.totalDebts}
                                totalInventoryCost={metrics.totalInventoryCost}
                                totalProfit={metrics.totalProfit}
                                profitMargin={metrics.profitMargin}
                            />
                        </div>

                        {/* Charts Grid - Expanded UI */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {(metricFilter === 'All' || metricFilter === 'Sales') && (
                                <div className="lg:col-span-2">
                                    <SalesTrendChart salesTrendData={chartData.salesTrendData} timeGranularity={timeGranularity} />
                                </div>
                            )}

                            {(metricFilter === 'All' || metricFilter === 'Expenses') && (
                                <div className={(metricFilter === 'All') ? "lg:col-span-1" : "lg:col-span-3"}>
                                    <ExpenseBreakdownChart expensePieData={chartData.expensePieData} hasData={chartData.expenseByType && Object.keys(chartData.expenseByType).length > 0} />
                                </div>
                            )}

                            {(metricFilter === 'All' || metricFilter === 'Sales' || metricFilter === 'COGS') && (
                                <div className="lg:col-span-3">
                                    <CogsVsSalesChart cogsVsSalesData={chartData.cogsVsSalesData} />
                                </div>
                            )}
                        </div>

                        {/* Product Insights */}
                        {(metricFilter === 'All' || metricFilter === 'Sales') && (
                            <div className="w-full">
                                <TopProductsList topProducts={metrics.topProducts} />
                            </div>
                        )}
                    </div>
                )}

                {/* Comparison View - Full Width Expansion */}
                {metricFilter === 'Comparison' && stores.length > 1 && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Metric Selector Card */}
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none">
                            <div className="max-w-md">
                                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                                    Analysis Metric
                                </label>
                                <select
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-lg font-bold text-slate-900 dark:text-white transition-all appearance-none cursor-pointer"
                                    value={comparisonMetric}
                                    onChange={(e) => setComparisonMetric(e.target.value)}
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236366f1'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.2rem' }}
                                >
                                    <option value="totalSales">📈 Total Sales Revenue</option>
                                    <option value="totalExpenses">📉 Operational Expenses</option>
                                    <option value="totalCOGS">📦 Cost of Goods Sold</option>
                                    <option value="totalDebts">💳 Outstanding Debts</option>
                                    <option value="totalProfit">💰 Net Profit Performance</option>
                                    <option value="profitMargin">📊 Profit Margin %</option>
                                </select>
                            </div>
                        </div>

                        {storeComparison.length > 0 ? (
                            <div className="grid grid-cols-1 gap-8">
                                <StoreComparisonChart
                                    comparisonChartData={comparisonData.comparisonChartData}
                                    comparisonMetric={comparisonMetric}
                                />
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                    <div className="xl:col-span-2">
                                        <StoreComparisonList
                                            storeComparison={storeComparison}
                                            bestPerformers={comparisonData.bestPerformers}
                                        />
                                    </div>
                                    <div className="xl:col-span-1">
                                        <TopProductsList
                                            topProducts={metrics.topProducts}
                                            isComparison={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            !isLoading && (
                                <div className="bg-white dark:bg-slate-900 rounded-[32px] p-20 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <Loader2 className="w-10 h-10 text-slate-300 animate-pulse" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Ready to Compare</h3>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                        Select your parameters and click apply to generate the ecosystem comparison analytics.
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                )}

                {/* Advanced Loading UI */}
                {isLoading && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/20 backdrop-blur-[10px] animate-in fade-in duration-300">
                        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[40px] p-12 shadow-2xl border border-white/20 dark:border-slate-800/50 flex flex-col items-center gap-6 max-w-sm mx-auto transform transition-all scale-100">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-indigo-100 dark:border-indigo-900/30 rounded-full animate-pulse"></div>
                                <Loader2 className="w-20 h-20 text-indigo-600 dark:text-indigo-400 animate-spin absolute inset-0 stroke-[3px]" />
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-1">Analyzing Ecosystem</p>
                                <p className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em]">Synthesizing Data...</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}