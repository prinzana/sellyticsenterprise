// components/AttendantsTable/index.jsx
import React, { useState } from 'react';
import useAttendants from './useAttendants';
import EmployeesCard from './EmployeesCard';
import ViewAttendantModal from './ViewAttendantModal';
import AttendantFormModal from './AttendantFormModal';

import { ToastContainer } from 'react-toastify';

export default function AttendantsTable({ setActiveTab }) {
  const ownerId = Number(localStorage.getItem('owner_id'));
  const { attendants, stores, branches, loading, error, createAttendant, updateAttendant, deleteAttendant } = useAttendants(ownerId);

  const [viewDetails, setViewDetails] = useState(null);
  const [editAttendant, setEditAttendant] = useState(null);
  const [newAttendant, setNewAttendant] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-4 dark:bg-gray-900 dark:text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Employees</h2>
        <div className="flex gap-2">
          {setActiveTab && (
            <button
              onClick={() => setActiveTab('Branches')}
              className="px-4 py-2 bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200 dark:border-slate-700 font-bold"
            >
              Manage Branches
            </button>
          )}
          <button
            onClick={() => setNewAttendant(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold shadow-lg"
          >
            Add New Employee
          </button>
        </div>
      </div>

      {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
      {loading && <div className="text-center text-gray-500">Loading...</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {attendants.map(a => (
          <EmployeesCard
            key={a.id}
            attendant={a}
            onView={() => setViewDetails(a)}
            onEdit={() => setEditAttendant(a)}
            onDelete={() => deleteAttendant(a.id)}
          />
        ))}
      </div>

      {/* Modals */}
      {viewDetails && <ViewAttendantModal attendant={viewDetails} onClose={() => setViewDetails(null)} />}
      {newAttendant && (
        <AttendantFormModal
          attendant={{}}
          stores={stores}
          branches={branches}
          onClose={() => setNewAttendant(false)}
          onSubmit={async (payload) => {
            await createAttendant(payload);
            setNewAttendant(false);
          }}
        />
      )}
      {editAttendant && (
        <AttendantFormModal
          attendant={editAttendant}
          stores={stores}
          branches={branches}
          onClose={() => setEditAttendant(null)}
          onSubmit={async (payload) => {
            await updateAttendant(payload);
            setEditAttendant(null);
          }}
        />
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
}
