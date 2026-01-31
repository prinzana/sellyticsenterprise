// src/components/SalesDashboard/Component/SalesSummaryCard.jsx
import React from "react";
import {
  DollarSign,
  TrendingUp,
  Package,
  Users,
  Clock,
  Calendar,
  Zap,
  Award,
} from "lucide-react";
import { useCurrency } from "../../../context/currencyContext";

export default function SalesSummaryCard({ metrics }) {
  const { formatPrice } = useCurrency();

  if (!metrics) return null;

  const bestHour = metrics.bestSellingHours?.reduce(
    (max, h) => (h.total > max.total ? h : max),
    { hour: null, total: 0 }
  ) || { hour: null, total: 0 };

  const last30Total = metrics.last30Days?.reduce((sum, d) => sum + (d.total || 0), 0) || 0;

  const top3Sold = (metrics.mostSoldItems || [])
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 3);

  return (
    <div className="w-full px-2 sm:px-3">
      <h3 className="text-sm sm:text-base font-bold text-indigo-700 dark:text-indigo-400 text-center mb-2 sm:mb-3">
        Sales Summary
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2.5 sm:p-3 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              Total Revenue
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
              {formatPrice(metrics.totalRevenue || 0, { abbreviate: false })}
            </p>
          </div>
        </div>

        {/* Average Daily Sales */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2.5 sm:p-3 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              Avg Daily Sales
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
              {formatPrice(metrics.avgDailySales || 0)}
            </p>
          </div>
        </div>

        {/* Fastest Moving Item */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2.5 sm:p-3 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              Fastest Moving
            </p>
            <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
              {metrics.fastestMovingItem?.productName || "N/A"}
            </p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
              {metrics.fastestMovingItem?.quantity || 0} units
            </p>
          </div>
        </div>

        {/* Top Customer */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2.5 sm:p-3 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-pink-600 dark:text-pink-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              Top Customer
            </p>
            <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
              {metrics.topCustomers?.[0]?.customerName || "N/A"}
            </p>
            <p className="text-[10px] text-pink-600 dark:text-pink-400 mt-0.5 truncate">
              {formatPrice(metrics.topCustomers?.[0]?.total || 0)}
            </p>
          </div>
        </div>

        {/* Peak Hour */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2.5 sm:p-3 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              Peak Hour
            </p>
            <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {bestHour.hour !== null ? `${bestHour.hour}:00` : "—"}
            </p>
            <p className="text-[10px] text-cyan-600 dark:text-cyan-400 mt-0.5 truncate">
              {bestHour.hour !== null ? formatPrice(bestHour.total) : "No data"}
            </p>
          </div>
        </div>

        {/* Last 30 Days */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2.5 sm:p-3 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              Last 30 Days
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
              {formatPrice(last30Total)}
            </p>
          </div>
        </div>

        {/* Slowest Moving */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2.5 sm:p-3 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
            <Package className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              Slowest Moving
            </p>
            <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
              {metrics.slowestMovingItem?.productName || "N/A"}
            </p>
            <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">
              {metrics.slowestMovingItem?.quantity || 0} units
            </p>
          </div>
        </div>

        {/* Top 3 Best Sellers */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2.5 sm:p-3 border border-slate-200 dark:border-slate-700 flex items-start gap-2">
          <div className="w-8 h-8 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center flex-shrink-0">
            <Award className="w-4 h-4 text-fuchsia-600 dark:text-fuchsia-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              Top 3 Best Sellers
            </p>
            <ol className="mt-1 space-y-1 text-[10px]">
              {top3Sold.length > 0 ? (
                top3Sold.map((item, i) => (
                  <li key={item.productId} className="flex flex-col">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                      {i + 1}. {item.productName}
                    </span>
                    <span className="text-[10px] font-bold text-fuchsia-600 dark:text-fuchsia-400">
                      {item.quantity} units
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 dark:text-slate-400">No sales yet</li>
              )}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}