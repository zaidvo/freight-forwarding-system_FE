import { useEffect, useState } from "react";
import { ArrowLeft, CreditCard, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { useImportStore } from "../../store/importStore";
import type { ImportPaymentReceipt } from "../../types/importTypes";

const inputClasses =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100";
const labelClasses =
  "block text-[12px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5";

export default function PaymentReceiptForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getShipment, loadShipments, savePaymentReceipt, isLoading } = useImportStore();
  const shipment = getShipment(id!);
  const existing = shipment?.paymentReceipt;
  const invoice = shipment?.clearingInvoice;

  const [form, setForm] = useState({
    receiptNo: existing?.receiptNo ?? "",
    tid: existing?.tid ?? "",
    amount: existing?.amount ?? invoice?.grandTotal ?? 0,
    currency: existing?.currency ?? "PKR",
    paymentDate: existing?.paymentDate ?? new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (!shipment) void loadShipments();
  }, [shipment, loadShipments]);

  useEffect(() => {
    setForm({
      receiptNo: existing?.receiptNo ?? "",
      tid: existing?.tid ?? "",
      amount: existing?.amount ?? invoice?.grandTotal ?? 0,
      currency: existing?.currency ?? "PKR",
      paymentDate: existing?.paymentDate ?? new Date().toISOString().slice(0, 10),
    });
  }, [existing, invoice]);

  const set = (field: string, value: string | number) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSave = async () => {
    await savePaymentReceipt(id!, form as Omit<ImportPaymentReceipt, "id" | "shipmentId" | "status" | "audit">);
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
      <div className="mx-auto max-w-4xl space-y-6">
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
                <CreditCard className="h-5 w-5 text-emerald-500" />
                <h1 className="text-[20px] font-bold tracking-tight text-slate-900">
                  Import Payment Receipt
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
            disabled={!invoice}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Save className="h-4 w-4" />
            Save Receipt
          </button>
        </div>

        {!invoice && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-700">
            Create the Freight Invoice first before recording payment.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
            <h3 className="mb-4 text-[14px] font-semibold text-slate-800">Payment Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Receipt No</label>
                <input className={inputClasses} value={form.receiptNo} onChange={(event) => set("receiptNo", event.target.value)} />
              </div>
              <div>
                <label className={labelClasses}>TID</label>
                <input className={inputClasses} value={form.tid} onChange={(event) => set("tid", event.target.value)} />
              </div>
              <div>
                <label className={labelClasses}>Amount</label>
                <input
                  type="number"
                  className={inputClasses}
                  value={form.amount || ""}
                  onChange={(event) => set("amount", Number(event.target.value) || 0)}
                />
              </div>
              <div>
                <label className={labelClasses}>Currency</label>
                <input className={inputClasses} value={form.currency} onChange={(event) => set("currency", event.target.value)} />
              </div>
              <div>
                <label className={labelClasses}>Payment Date</label>
                <input type="date" className={inputClasses} value={form.paymentDate} onChange={(event) => set("paymentDate", event.target.value)} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
            <h4 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-slate-500">
              Invoice Summary
            </h4>
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice</span>
                <span className="font-medium text-slate-800">{invoice?.invoiceNumber || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total</span>
                <span className="font-medium text-slate-800">{invoice?.grandTotal?.toLocaleString() ?? "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
