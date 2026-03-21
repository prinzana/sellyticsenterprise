import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { ChevronDown, ChevronUp, PieChart } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpenseBreakdownChart({ expensePieData, hasData }) {
  const { formatPrice } = useCurrency();
  const [showChart, setShowChart] = useState(true);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
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
          label: function(context) {
            return `${context.label}: ${formatPrice(context.parsed)}`;
          }
        }
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
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-100 dark:border-purple-500/20 shadow-sm shadow-purple-500/10">
            <PieChart className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-left">
            <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Expense Breakdown
            </h3>
            <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 font-medium">Spending by category allocation</p>
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
          {hasData ? (
            <div className="h-[280px] sm:h-[350px] lg:h-[400px] w-full mt-2">
              <Pie data={expensePieData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-[280px] sm:h-[350px] lg:h-[400px] flex items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
              <p className="text-slate-500 dark:text-slate-400 font-medium">No expense data available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}