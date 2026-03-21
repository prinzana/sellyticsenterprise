import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function CogsVsSalesChart({ cogsVsSalesData }) {
  const { formatPrice } = useCurrency();
  const [showChart, setShowChart] = useState(true);

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
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)]">
      <button
        onClick={() => setShowChart(!showChart)}
        className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-100 dark:border-blue-500/20 shadow-sm shadow-blue-500/10">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-left">
            <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Sales vs COGS
            </h3>
            <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 font-medium">Revenue vs cost equity analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${showChart ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                {showChart ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
        </div>
      </button>

      {showChart && (
        <div className="px-3 pb-4 sm:px-6 sm:pb-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="h-[280px] sm:h-[350px] lg:h-[400px] w-full mt-2">
            <Bar data={cogsVsSalesData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
}