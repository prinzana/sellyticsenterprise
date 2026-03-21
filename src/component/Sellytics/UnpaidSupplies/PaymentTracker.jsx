// src/components/Sellytics/UnpaidSupplies/PaymentTracker.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Plus, Calendar, CreditCard, CheckCircle } from 'lucide-react';

const PaymentTracker = ({ entry, payments = [], onAddPayment, isEdit, onOwedChange }) => {
    const [showAddPayment, setShowAddPayment] = useState(false);
    const [newPayment, setNewPayment] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paid_to: ''
    });

    const owed = Number(entry?.owed || 0);
    const deposited = Number(entry?.deposited || 0);
    const remaining = owed - deposited;
    const progress = owed > 0 ? Math.min((deposited / owed) * 100, 100) : 0;

    const handleOwedChange = (val) => {
        const num = Number(val);
        if (!isNaN(num) && num >= 0) {
            onOwedChange(num);
        }
    };

    const handleAddPayment = () => {
        if (!newPayment.amount || Number(newPayment.amount) <= 0) return;

        onAddPayment({
            payment_amount: Number(newPayment.amount),
            payment_date: newPayment.date,
            paid_to: newPayment.paid_to
        });

        setNewPayment({
            amount: '',
            date: new Date().toISOString().split('T')[0],
            paid_to: ''
        });
        setShowAddPayment(false);
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border mt-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-2">

                <h3 className="flex items-center gap-1.5 font-semibold text-sm text-gray-900 dark:text-white truncate">
                    <DollarSign className="w-4 h-4 shrink-0 text-gray-500" />
                    <span className="truncate">Payment Tracker</span>
                </h3>

                {isEdit && (
                    <button
                        type="button"
                        onClick={() => setShowAddPayment(true)}
                        className="
                                flex items-center gap-1
                                px-2.5 py-1.5
                                text-xs font-semibold
                                bg-indigo-600 text-white
                                rounded-md
                                hover:bg-indigo-700
                                transition
                                whitespace-nowrap
                            "
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Add Payment</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                )}

            </div>


            {/* Owed / Deposited / Remaining */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">

                <Stat
                    label="Owed"
                    value={owed}
                    compact
                />

                <Stat
                    label="Paid"
                    value={deposited}
                    success
                    compact
                />

                <Stat
                    label="Left"
                    value={remaining}
                    danger={remaining > 0}
                    compact
                />

            </div>


            {/* Progress Bar */}
            <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                    <span>Payment Progress</span>
                    <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded h-2">
                    <motion.div
                        className="bg-indigo-600 h-2 rounded"
                        animate={{ width: `${progress}%` }}
                    />
                </div>
                {remaining <= 0 && (
                    <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Fully Paid
                    </p>
                )}
            </div>

            {/* Editable Owed */}
            {isEdit && (
                <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Owed Amount</label>
                    <input
                        type="number"
                        className="w-full p-2 border rounded"
                        value={owed}
                        onChange={(e) => handleOwedChange(e.target.value)}
                        min={0}
                    />
                </div>
            )}

            {/* Add Payment Form */}
            <AnimatePresence>
                {showAddPayment && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-white dark:bg-slate-800 p-3 rounded mb-3"
                    >
                        <input
                            type="number"
                            placeholder="Payment amount"
                            value={newPayment.amount}
                            onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                            className="w-full mb-2 p-2 border rounded"
                        />
                        <input
                            type="date"
                            value={newPayment.date}
                            onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
                            className="w-full mb-2 p-2 border rounded"
                        />
                        <input
                            type="text"
                            placeholder="Paid via (optional)"
                            value={newPayment.paid_to}
                            onChange={(e) => setNewPayment({ ...newPayment, paid_to: e.target.value })}
                            className="w-full mb-2 p-2 border rounded"
                        />
                        <button
                            onClick={handleAddPayment}
                            className="w-full bg-indigo-600 text-white py-2 rounded"
                        >
                            Save Payment
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Payment History */}
            <div className="mt-3">
                <h4 className="text-sm font-semibold mb-2">Payment History</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {/* Untracked amount (Initial deposit) */}
                    {(() => {
                        const trackedTotal = payments.reduce((sum, p) => sum + Number(p.payment_amount || 0), 0);
                        const untracked = deposited - trackedTotal;
                        if (untracked > 0.01) {
                            return (
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded flex justify-between border-l-4 border-indigo-500">
                                    <div>
                                        <p className="font-bold text-indigo-700 dark:text-indigo-300">{untracked.toFixed(2)}</p>
                                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">Initial / Manual Deposit</p>
                                    </div>
                                    <DollarSign className="w-4 h-4 text-indigo-400" />
                                </div>
                            );
                        }
                        return null;
                    })()}

                    {payments.length > 0 ? (
                        payments.map((p, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-800 p-2 rounded flex justify-between border-l border-slate-200 dark:border-slate-700">
                                <div>
                                    <p className="font-bold">{Number(p.payment_amount).toFixed(2)}</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> {p.payment_date}
                                        {p.paid_to && ` • ${p.paid_to}`}
                                    </p>
                                </div>
                                <CreditCard className="w-4 h-4 text-slate-400" />
                            </div>
                        ))
                    ) : (
                        deposited <= 0.01 && <p className="text-xs text-slate-500 text-center py-2">No payments recorded</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Stat card helper
const Stat = ({ label, value, success, danger }) => (
    <div className="bg-white dark:bg-slate-800 p-3 rounded border">
        <p className="text-[10px] text-slate-500 mb-1">{label}</p>
        <p
            className={`font-bold text-lg ${success ? 'text-green-600' : danger ? 'text-red-600' : 'text-slate-900 dark:text-white'
                }`}
        >
            {Number(value).toFixed(2)}
        </p>
    </div>
);

export default PaymentTracker;
