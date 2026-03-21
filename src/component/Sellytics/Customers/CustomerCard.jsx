// src/components/Customers/CustomerCard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, User, Phone, Mail, MapPin, Calendar, Edit, Trash2 } from 'lucide-react';

function CustomerActions({ onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMenu && menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" />
      </button>

      {showMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(false);
              onEdit();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-left transition"
          >
            <Edit className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(false);
              onDelete();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-left transition"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default function CustomerCard({ customer, onEdit, onDelete }) {
  const birthday = customer.birthday ? new Date(customer.birthday).toLocaleDateString() : 'N/A';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative p-3.5 sm:p-5 bg-white dark:bg-slate-800 rounded-none sm:rounded-2xl border-b border-x-0 sm:border border-slate-100 dark:border-slate-700 sm:border-slate-200 w-full hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-300"
    >
      <div className="flex items-center gap-3 sm:gap-4 w-full pr-1 sm:pr-2">
        {/* Left: Icon */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
        </div>

        {/* Middle: Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5 sm:gap-1.5">
          <div className="flex items-center justify-between gap-2 w-full">
            <h3 className="font-bold text-[14px] sm:text-lg text-slate-900 dark:text-white truncate">
              {customer.fullname}
            </h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] sm:text-sm text-slate-500 dark:text-slate-400">
            {customer.phone_number && (
              <div className="flex items-center gap-1.5 min-w-0">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{customer.phone_number}</span>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate max-w-[120px] sm:max-w-none">{customer.address}</span>
              </div>
            )}
            {customer.birthday && (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">DOB: {birthday}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="shrink-0 flex items-center justify-center -mr-2">
          <CustomerActions onEdit={() => onEdit(customer)} onDelete={() => onDelete(customer.id)} />
        </div>
      </div>
    </motion.div>
  );
}