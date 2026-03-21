import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { BarChart3 } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function StoreComparisonChart({ comparisonChartData, comparisonMetric }) {
  const { formatPrice } = useCurrency();

  // Safe default data
  const safeData = comparisonChartData || { labels: [], datasets: [] };

  // Show placeholder if no data
  if (!safeData.labels?.length) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {comparisonMetric} Comparison
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Store performance analysis</p>
            </div>
          </div>
        </div>
        <div className="p-6 text-center text-slate-500 dark:text-slate-400">
          No comparison data available
        </div>
      </div>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12 },
          color: '#64748b',
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        callbacks: {
          label: function (context) {
            if (comparisonMetric === 'profitMargin') {
              return `${context.label}: ${context.parsed.y}%`;
            }
            return `${context.label}: ${formatPrice(context.parsed.y)}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: {
          font: { size: 11 },
          color: '#64748b',
          callback: function(value) {
            if (comparisonMetric === 'profitMargin') return value + '%';
            if (Math.abs(value) >= 1e9) return (value / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
            if (Math.abs(value) >= 1e6) return (value / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
            if (Math.abs(value) >= 1e3) return (value / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
            return value;
          },
        },
      },
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: {
          font: { size: 11 },
          color: '#64748b',
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Store Comparison
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Store performance analysis</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="h-96">
          <Bar data={safeData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}