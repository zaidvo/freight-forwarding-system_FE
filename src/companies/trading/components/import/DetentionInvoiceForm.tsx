import { useEffect, useState } from "react";
import { ArrowLeft, Clock, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { useImportStore } from "../../store/importStore";
import type { DetentionInvoice } from "../../types/importTypes";

const inputClasses =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-100";
const labelClasses =
  "block text-[12px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5";

export default function DetentionInvoiceForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getShipment, loadShipments, saveDetentionInvoice, isLoading } = useImportStore();
  const shipment = getShipment(id!);
  const existing = shipment?.detentionInvoice;
  const sourceDoc = shipment?.masterBL ?? shipment?.houseBL;

  const [form, setForm] = useState({
    invoiceNo: existing?.invoiceNo ?? "",
    detentionStart: existing?.detentionStart ?? new Date().toISOString().slice(0, 10),
    detentionEnd: existing?.detentionEnd ?? new Date().toISOString().slice(0, 10),
    freeDays: existing?.freeDays ?? 0,
    perDayAmount: existing?.perDayAmount ?? 0,
    securityDeposit: existing?.securityDeposit ?? 0,
    currency: existing?.currency ?? "PKR",
    manualFields: existing?.manualFields ?? {},
  });

  useEffect(() => {
    if (!shipment) void loadShipments();
  }, [shipment, loadShipments]);

  useEffect(() => {
    setForm({
      invoiceNo: existing?.invoiceNo ?? "",
      detentionStart: existing?.detentionStart ?? new Date().toISOString().slice(0, 10),
      detentionEnd: existing?.detentionEnd ?? new Date().toISOString().slice(0, 10),
      freeDays: existing?.freeDays ?? 0,
      perDayAmount: existing?.perDayAmount ?? 0,
      securityDeposit: existing?.securityDeposit ?? 0,
      currency: existing?.currency ?? "PKR",
      manualFields: existing?.manualFields ?? {},
    });
  }, [existing]);

  const set = (field: string, value: string | number) =>
    setForm((current) => ({ ...current, [field]: value }));

  const totalDays =
    form.detentionStart && form.detentionEnd
      ? Math.max(
          Math.floor((new Date(form.detentionEnd).getTime() - new Date(form.detentionStart).getTime()) / 86400000) + 1,
          0,
        )
      : 0;
  const chargeableDays = Math.max(totalDays - form.freeDays, 0);
  const detentionAmount = chargeableDays * form.perDayAmount;
  const refundAmount = form.securityDeposit - detentionAmount;

  const handleSave = async () => {
    await saveDetentionInvoice(
      id!,
      form as Omit<DetentionInvoice, "id" | "shipmentId" | "status" | "audit" | "chargeableDays" | "detentionAmount" | "refundAmount" | "renderData">,
    );
    navigate(`/trading/imports/${id}`);
  };

  if (!shipment) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center text-slate-500">
          {isLoading ? "Loading shipment..." : "Shipment not found"}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/trading/imports/${id}`)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <h1 className="text-[20px] font-bold tracking-tight text-slate-900">
                  Detention Invoice
                </h1>
              </div>
              <p className="text-[13px] text-slate-500 mt-0.5">
                {shipment.referenceNo} • {shipment.customer}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(245,158,11,0.3)] transition hover:bg-amber-600"
          >
            <Save className="h-4 w-4" />
            Save Detention
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <h3 className="mb-4 text-[14px] font-semibold text-slate-800">Detention Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Invoice No</label>
                  <input className={inputClasses} value={form.invoiceNo} onChange={(event) => set("invoiceNo", event.target.value)} />
                </div>
                <div>
                  <label className={labelClasses}>Currency</label>
                  <input className={inputClasses} value={form.currency} onChange={(event) => set("currency", event.target.value)} />
                </div>
                <div>
                  <label className={labelClasses}>Detention Start</label>
                  <input type="date" className={inputClasses} value={form.detentionStart} onChange={(event) => set("detentionStart", event.target.value)} />
                </div>
                <div>
                  <label className={labelClasses}>Detention End</label>
                  <input type="date" className={inputClasses} value={form.detentionEnd} onChange={(event) => set("detentionEnd", event.target.value)} />
                </div>
                <div>
                  <label className={labelClasses}>Free Days</label>
                  <input type="number" className={inputClasses} value={form.freeDays || ""} onChange={(event) => set("freeDays", Number(event.target.value) || 0)} />
                </div>
                <div>
                  <label className={labelClasses}>Per Day Amount</label>
                  <input type="number" className={inputClasses} value={form.perDayAmount || ""} onChange={(event) => set("perDayAmount", Number(event.target.value) || 0)} />
                </div>
                <div>
                  <label className={labelClasses}>Security Deposit</label>
                  <input type="number" className={inputClasses} value={form.securityDeposit || ""} onChange={(event) => set("securityDeposit", Number(event.target.value) || 0)} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)] opacity-80">
              <h3 className="mb-4 text-[14px] font-semibold text-slate-800">Shipment Reference Data</h3>
              <div className="grid grid-cols-2 gap-4 text-[13px]">
                <div><span className="text-slate-500">HBL:</span> {shipment.houseBL?.hblNumber || "—"}</div>
                <div><span className="text-slate-500">MBL:</span> {shipment.masterBL?.mblNumber || "—"}</div>
                <div><span className="text-slate-500">Container:</span> {sourceDoc?.containers?.[0]?.containerNo || "—"}</div>
                <div><span className="text-slate-500">Consignee:</span> {sourceDoc?.consignee || "—"}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
            <h4 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-slate-500">Calculated Preview</h4>
            <div className="space-y-3 text-[13px]">
              <div className="flex justify-between"><span className="text-slate-500">Total Days</span><span className="font-medium">{totalDays}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Chargeable Days</span><span className="font-medium">{chargeableDays}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Detention Amount</span><span className="font-medium">{detentionAmount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Refund</span><span className="font-bold text-slate-900">{refundAmount.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
