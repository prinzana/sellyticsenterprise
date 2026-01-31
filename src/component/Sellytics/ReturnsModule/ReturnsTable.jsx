/**
 * Returns Table Component
 */
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Edit, Trash2, CheckSquare, Square } from 'lucide-react';
import { useCurrency } from '../../context/currencyContext';

export default function ReturnsTable({
  returns,
  onEdit,
  onDelete,
  selectedIds,
  onToggleSelect,
}) {
  const { formatPrice } = useCurrency();
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        openMenuId &&
        menuRefs.current[openMenuId] &&
        !menuRefs.current[openMenuId].contains(e.target)
      ) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const statusColors = {
    Pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    Approved:
      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    Rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    Refunded:
      'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
  };

  const allSelected =
    returns.length > 0 && selectedIds.length === returns.length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-100 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => {
                    if (allSelected) {
                      selectedIds.forEach((id) => onToggleSelect(id));
                    } else {
                      returns.forEach((r) => {
                        if (!selectedIds.includes(r.id)) {
                          onToggleSelect(r.id);
                        }
                      });
                    }
                  }}
                >
                  {allSelected ? (
                    <CheckSquare className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Product
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Product ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Qty</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Receipt
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {returns.map((ret) => (
              <motion.tr
                key={ret.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`border-b border-slate-200 dark:border-slate-700 ${selectedIds.includes(ret.id)
                  ? 'bg-indigo-50 dark:bg-indigo-900/20'
                  : ''
                  }`}
              >
                <td className="px-4 py-3">
                  <button onClick={() => onToggleSelect(ret.id)}>
                    {selectedIds.includes(ret.id) ? (
                      <CheckSquare className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                </td>

                <td className="px-4 py-3 text-sm font-medium">
                  {ret.product_name}
                </td>

                <td className="px-4 py-3 text-sm">
                  {ret.device_id || (
                    <span className="text-slate-400">N/A</span>
                  )}
                </td>

                <td className="px-4 py-3 text-sm">
                  {ret.customer_address || (
                    <span className="text-slate-400">N/A</span>
                  )}
                </td>

                <td className="px-4 py-3 text-sm">{ret.qty}</td>

                {/* ✅ FIXED AMOUNT */}
                <td className="px-4 py-3 text-sm font-semibold max-w-[150px]">
                  <span className="truncate block" title={formatPrice(ret.amount || 0)}>
                    {formatPrice(ret.amount || 0)}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusColors[ret.status] || statusColors.Pending
                      }`}
                  >
                    {ret.status}
                  </span>
                </td>

                <td className="px-4 py-3 text-sm">
                  {new Date(ret.returned_date).toLocaleDateString()}
                </td>

                <td className="px-4 py-3 text-sm">
                  {ret.receipt_code}
                </td>

                <td className="px-4 py-3">
                  <div
                    className="flex justify-center relative"
                    ref={(el) => (menuRefs.current[ret.id] = el)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(
                          openMenuId === ret.id ? null : ret.id
                        );
                      }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {openMenuId === ret.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border py-2 z-[60]">
                        <button
                          onClick={() => {
                            onEdit(ret);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Delete return for "${ret.product_name}"?`
                              )
                            ) {
                              onDelete(ret.id);
                            }
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {returns.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No returns found
        </div>
      )}
    </div>
  );
}
