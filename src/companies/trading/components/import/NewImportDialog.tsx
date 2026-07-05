// src/companies/trading/components/import/NewImportDialog.tsx

import { useState } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (data: {
    customer: string;
    salesperson: string;
    company: string;
    expectedArrivalDate: string;
    remarks: string;
  }) => void;
};

export default function NewImportDialog({ open, onClose, onCreate }: Props) {
  const [form, setForm] = useState({
    customer: "",
    salesperson: "",
    company: "",
    expectedArrivalDate: "",
    remarks: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer.trim() || !form.expectedArrivalDate) return;
    onCreate(form);
    setForm({
      customer: "",
      salesperson: "",
      company: "",
      expectedArrivalDate: "",
      remarks: "",
    });
  };

  if (!open) return null;

  const inputClasses =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100";
  const labelClasses =
    "block text-[12px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(22,31,54,0.18)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-[17px] font-bold text-slate-900">
              New Import Shipment
            </h2>
            <p className="text-[13px] text-slate-500 mt-0.5">
              Create a new shipment record to begin the import workflow
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className={labelClasses}>Customer *</label>
            <input
              className={inputClasses}
              value={form.customer}
              onChange={(e) =>
                setForm((f) => ({ ...f, customer: e.target.value }))
              }
              placeholder="e.g. ABC Traders"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Salesperson</label>
              <input
                className={inputClasses}
                value={form.salesperson}
                onChange={(e) =>
                  setForm((f) => ({ ...f, salesperson: e.target.value }))
                }
                placeholder="e.g. Ali Hassan"
              />
            </div>
            <div>
              <label className={labelClasses}>Company</label>
              <input
                className={inputClasses}
                value={form.company}
                onChange={(e) =>
                  setForm((f) => ({ ...f, company: e.target.value }))
                }
                placeholder="e.g. Global Imports Ltd"
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Expected Arrival Date *</label>
            <input
              type="date"
              className={inputClasses}
              value={form.expectedArrivalDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, expectedArrivalDate: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className={labelClasses}>Remarks</label>
            <textarea
              className={`${inputClasses} min-h-[72px] resize-none`}
              value={form.remarks}
              onChange={(e) =>
                setForm((f) => ({ ...f, remarks: e.target.value }))
              }
              placeholder="Any additional notes about this shipment..."
              rows={3}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-500 px-5 py-2 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] transition hover:bg-blue-600 hover:shadow-[0_6px_16px_rgba(59,130,246,0.35)]"
            >
              Create Shipment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
