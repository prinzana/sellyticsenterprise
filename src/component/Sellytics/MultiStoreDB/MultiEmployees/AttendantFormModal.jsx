import React, { useState, useEffect } from "react";

export default function AttendantFormModal({
  attendant = {},
  stores,
  branches = [],
  onClose,
  onSubmit,
}) {
  const [formState, setFormState] = useState(attendant);

  useEffect(() => {
    setFormState(attendant || {});
  }, [attendant]);

  const handleChange = (field, value) =>
    setFormState((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const { shop_name, ...payload } = formState; // ensure clean submit
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold mb-4">
          {attendant.id ? `Edit ${attendant.full_name}` : "Add New Attendant"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Full Name", field: "full_name", type: "text" },
            { label: "Phone", field: "phone_number", type: "tel" },
            { label: "Email", field: "email_address", type: "email" },
            { label: "Role", field: "role", type: "text" },
          ].map(({ label, field, type }) => (
            <div key={field}>
              <label className="block text-sm font-medium">{label}</label>
              <input
                type={type}
                value={formState[field] || ""}
                onChange={(e) => handleChange(field, e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
                required={field !== "role"}
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium">Store (Organization)</label>
            <select
              value={formState.store_id || ""}
              onChange={(e) =>
                handleChange("store_id", Number(e.target.value))
              }
              className="mt-1 block w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
              required
            >
              <option value="">Select an organization</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shop_name}
                </option>
              ))}
            </select>
          </div>

          {branches.length > 0 && (
            <div>
              <label className="block text-sm font-medium">Branch Assignment</label>
              <select
                value={formState.branch_id || ""}
                onChange={(e) =>
                  handleChange("branch_id", e.target.value ? Number(e.target.value) : null)
                }
                className="mt-1 block w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
              >
                <option value="">Select a branch (Optional)</option>
                {branches
                  .filter((b) => b.store_id === formState.store_id)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.branch_name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">
              {attendant.id ? "New Password (Leave blank to keep current)" : "Set Password *"}
            </label>
            <input
              type="password"
              placeholder={attendant.id ? "••••••••" : "Minimum 6 characters"}
              value={formState.password || ""}
              onChange={(e) => handleChange("password", e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
              required={!attendant.id}
              minLength={6}
            />
          </div>

          <div className="flex gap-2">
            <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded">
              {attendant.id ? "Update" : "Create"}
            </button>
            <button
              type="button"
              className="flex-1 px-4 py-2 bg-gray-300 rounded"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
