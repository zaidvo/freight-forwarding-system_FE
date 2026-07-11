import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { useImportStore } from "../store/importStore";
import NewImportDialog from "../components/import/NewImportDialog";
import type { ImportShipment } from "../types/importTypes";

export default function ImportListPage() {
  const navigate = useNavigate();
  const { shipments, createShipment, loadShipments, isLoading, error } = useImportStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    void loadShipments();
  }, [loadShipments]);

  const filtered = shipments.filter(
    (shipment) =>
      shipment.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.customer.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreate = async (data: {
    customer: string;
    salesperson: string;
    company: string;
    expectedArrivalDate: string;
    remarks: string;
  }) => {
    const shipment = await createShipment(data);
    setDialogOpen(false);
    navigate(`/trading/imports/${shipment.id}`);
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="flex flex-col gap-4 rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-500">
              Trading Imports
            </p>
            <h1 className="mt-2 text-[24px] font-bold tracking-[-0.04em] text-slate-950">
              Import Shipments
            </h1>
            <p className="mt-1 max-w-2xl text-[14px] leading-6 text-slate-500">
              Create an import record, complete BL documents, then generate invoice, receipt, and detention documents.
            </p>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.24)] transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 shrink-0" />
            New Import
          </button>
        </section>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">Shipment Records</h2>
              <p className="mt-1 text-[12px] text-slate-500">
                {isLoading ? "Loading records..." : `${filtered.length} record${filtered.length === 1 ? "" : "s"} shown`}
              </p>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search reference or customer"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-[13px] outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] uppercase tracking-[0.12em] text-slate-400">
                  <th className="px-5 py-3 font-semibold">Reference</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Created</th>
                  <th className="px-5 py-3 font-semibold">Expected Arrival</th>
                  <th className="px-5 py-3 font-semibold">Containers</th>
                  <th className="px-5 py-3 font-semibold">Current Stage</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((shipment) => (
                  <tr
                    key={shipment.id}
                    onClick={() => navigate(`/trading/imports/${shipment.id}`)}
                    className="cursor-pointer border-b border-slate-100 transition hover:bg-blue-50/40"
                  >
                    <td className="px-5 py-4 font-semibold text-blue-600">
                      {shipment.referenceNo}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {shipment.customer || "-"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(shipment.createdDate)}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {shipment.expectedArrivalDate ? formatDate(shipment.expectedArrivalDate) : "-"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {shipment.draftBL?.containers?.length || 0}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                        {formatStage(shipment.currentStage)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-semibold ${statusClass(shipment.status)}`}>
                        {formatStage(shipment.status)}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-[13px] text-slate-500">
                      {isLoading ? "Loading import shipments..." : "No import shipments found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <NewImportDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={handleCreate}
      />
    </AppLayout>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatStage(value: ImportShipment["currentStage"] | ImportShipment["status"]) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function statusClass(status: ImportShipment["status"]) {
  if (status === "completed") return "text-emerald-600";
  if (status === "in_progress") return "text-blue-600";
  return "text-amber-600";
}
