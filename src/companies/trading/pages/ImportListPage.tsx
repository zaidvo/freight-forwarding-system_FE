// src/companies/trading/pages/ImportListPage.tsx

import { useState } from "react";
import { Plus, Search, Ship, FileText, CheckCircle, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { useImportStore } from "../store/importStore";
import NewImportDialog from "../components/import/NewImportDialog";

export default function ImportListPage() {
  const navigate = useNavigate();
  const { shipments, createShipment } = useImportStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filter shipments
  const filtered = shipments.filter(
    (s) =>
      s.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dashboard Stats
  const totalImports = shipments.length;
  const draftBlPending = shipments.filter((s) => !s.draftBL || s.draftBL.status !== "approved").length;
  const hblPending = shipments.filter((s) => !s.houseBL || s.houseBL.status !== "approved").length;
  const completed = shipments.filter((s) => s.status === "completed").length;

  const handleCreate = (data: {
    customer: string;
    salesperson: string;
    company: string;
    expectedArrivalDate: string;
    remarks: string;
  }) => {
    const shipment = createShipment(data);
    setDialogOpen(false);
    navigate(`/trading/imports/${shipment.id}`);
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="rounded-[8px] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] bg-blue-50 text-blue-600">
              Trading Imports
            </span>
            <h1 className="mt-1.5 text-[26px] font-bold tracking-[-0.04em] text-slate-900">
              Import Shipments
            </h1>
            <p className="mt-1 text-[14px] text-slate-500">
              Manage the complete import lifecycle and document flow.
            </p>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] transition hover:bg-blue-600 hover:shadow-[0_6px_16px_rgba(59,130,246,0.35)]"
          >
            <Plus className="h-4 w-4 shrink-0" />
            New Import
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
            <div className="flex items-center gap-3 mb-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-500">
                <Ship className="h-4 w-4" />
              </div>
              <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                Total Imports
              </span>
            </div>
            <div className="text-[24px] font-bold text-slate-900">{totalImports}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
            <div className="flex items-center gap-3 mb-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-500">
                <FileText className="h-4 w-4" />
              </div>
              <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                Draft BL Pending
              </span>
            </div>
            <div className="text-[24px] font-bold text-slate-900">{draftBlPending}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
            <div className="flex items-center gap-3 mb-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-violet-50 text-violet-500">
                <Package className="h-4 w-4" />
              </div>
              <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                HBL Pending
              </span>
            </div>
            <div className="text-[24px] font-bold text-slate-900">{hblPending}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
            <div className="flex items-center gap-3 mb-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-500">
                <CheckCircle className="h-4 w-4" />
              </div>
              <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                Completed
              </span>
            </div>
            <div className="text-[24px] font-bold text-slate-900">{completed}</div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(22,31,54,0.04)]">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search shipments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-[13px] outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Reference No</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Created Date</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Expected Arrival</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Containers</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Current Stage</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((shipment) => (
                  <tr
                    key={shipment.id}
                    onClick={() => navigate(`/trading/imports/${shipment.id}`)}
                    className="cursor-pointer border-b border-slate-50 transition-colors hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-medium text-blue-600">
                      {shipment.referenceNo}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {new Date(shipment.createdDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {shipment.expectedArrivalDate ? new Date(shipment.expectedArrivalDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-800">
                      {shipment.customer}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {shipment.draftBL?.containers?.length || 0}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                        {shipment.currentStage}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {shipment.status === "new" && (
                        <span className="text-amber-500 font-medium">New</span>
                      )}
                      {shipment.status === "in_progress" && (
                        <span className="text-blue-500 font-medium">In Progress</span>
                      )}
                      {shipment.status === "completed" && (
                        <span className="text-emerald-500 font-medium">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-[13px] text-slate-500">
                      No shipments found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <NewImportDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={handleCreate}
      />
    </AppLayout>
  );
}
