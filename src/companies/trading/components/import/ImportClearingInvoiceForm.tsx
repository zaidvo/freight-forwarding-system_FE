// src/companies/trading/components/import/ImportClearingInvoiceForm.tsx

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Send, Receipt, Zap, FileDown } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { useImportStore, defaultChargeLines, numberToWords } from "../../store/importStore";
import ChargesTable from "./ChargesTable";
import DocumentStatusBadge from "./DocumentStatusBadge";
import type { ImportClearingInvoice, ChargeLine } from "../../types/importTypes";
import { generateInvoicePdf } from "../../utils/pdfGenerator";

const inputClasses =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:ring-2 focus:ring-rose-100";
const labelClasses =
  "block text-[12px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5";
const autoFillBadge =
  "ml-1.5 inline-flex items-center gap-0.5 rounded-md bg-rose-50 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-600";

export default function ImportClearingInvoiceForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getShipment, saveClearingInvoice } =
    useImportStore();
  const shipment = getShipment(id!);
  const existing = shipment?.clearingInvoice;
  
  const sourceDoc = shipment?.masterBL || shipment?.houseBL;
  
  const [form, setForm] = useState({
    invoiceNumber: existing?.invoiceNumber ?? "",
    invoiceDate: existing?.invoiceDate ?? new Date().toISOString().slice(0, 10),
    customer: existing?.customer ?? shipment?.customer ?? "",
    ntn: existing?.ntn ?? "",
    clearingAgent: existing?.clearingAgent ?? "",
    exchangeRate: existing?.exchangeRate ?? 1,

    // Auto-filled read-only fields
    hblNumber: existing?.hblNumber ?? shipment?.houseBL?.hblNumber ?? "",
    mblNumber: existing?.mblNumber ?? shipment?.masterBL?.mblNumber ?? "",
    containerNumber: existing?.containerNumber ?? sourceDoc?.containers?.[0]?.containerNo ?? "",
    containerType: existing?.containerType ?? sourceDoc?.containers?.[0]?.size ?? "",
    shippingLine: existing?.shippingLine ?? shipment?.masterBL?.shippingLine ?? "",
    vessel: existing?.vessel ?? sourceDoc?.vessel ?? "",
    voyage: existing?.voyage ?? sourceDoc?.voyage ?? "",
    shipper: existing?.shipper ?? sourceDoc?.shipper ?? "",
    consignee: existing?.consignee ?? sourceDoc?.consignee ?? "",
    cargoDescription: existing?.cargoDescription ?? sourceDoc?.cargoDescription ?? "",
    grossWeight: existing?.grossWeight ?? sourceDoc?.grossWeight ?? 0,
    netWeight: existing?.netWeight ?? ("netWeight" in (sourceDoc || {}) ? (sourceDoc as any).netWeight : 0),
    pol: existing?.pol ?? sourceDoc?.pol ?? "",
    pod: existing?.pod ?? sourceDoc?.pod ?? "",
    destination: existing?.destination ?? sourceDoc?.placeOfDelivery ?? "",
  });

  const [charges, setCharges] = useState<ChargeLine[]>(
    existing?.charges ?? defaultChargeLines()
  );

  const [totals, setTotals] = useState({
    subtotal: existing?.subtotal ?? 0,
    totalAmount: existing?.totalAmount ?? 0,
    grandTotal: existing?.grandTotal ?? 0,
    amountInWords: existing?.amountInWords ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const subtotal = charges.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    setTotals({
      subtotal,
      totalAmount: subtotal,
      grandTotal: subtotal,
      amountInWords: numberToWords(subtotal),
    });
  }, [charges]);

  const set = (field: string, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.invoiceNumber.trim()) newErrors.invoiceNumber = "Invoice Number is required";
    if (!form.invoiceDate.trim()) newErrors.invoiceDate = "Invoice Date is required";
    if (!form.customer.trim()) newErrors.customer = "Customer is required";
    if (!form.ntn.trim()) newErrors.ntn = "NTN Number is required";
    if (!form.clearingAgent.trim()) newErrors.clearingAgent = "Clearing Agent is required";
    if (form.exchangeRate <= 0) newErrors.exchangeRate = "Exchange Rate must be greater than 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    await saveClearingInvoice(id!, {
      ...form,
      charges,
      ...totals
    } as Omit<ImportClearingInvoice, "id" | "shipmentId" | "status" | "audit">);
    navigate(`/trading/imports/${id}`);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert("Please fill in all mandatory fields before submitting.");
      return;
    }
    await saveClearingInvoice(id!, {
      ...form,
      charges,
      ...totals
    } as Omit<ImportClearingInvoice, "id" | "shipmentId" | "status" | "audit">);
    navigate(`/trading/imports/${id}`);
  };

  const handleGeneratePdf = () => {
    if (!shipment) return;
    const currentInvoiceData: ImportClearingInvoice = {
      id: existing?.id ?? "temp",
      shipmentId: id!,
      status: existing?.status ?? "draft",
      audit: existing?.audit ?? { createdBy: "User", createdDate: "" },
      ...form,
      charges,
      ...totals,
    };
    const blob = generateInvoicePdf(currentInvoiceData, shipment);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Freight_Invoice_${form.invoiceNumber || shipment.referenceNo}.pdf`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  if (!shipment) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-slate-500">
          Shipment not found
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
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
                <Receipt className="h-5 w-5 text-rose-500" />
                <h1 className="text-[20px] font-bold tracking-tight text-slate-900">
                  Freight Invoice
                </h1>
                {existing && (
                  <DocumentStatusBadge status={existing.status} size="md" />
                )}
              </div>
              <p className="text-[13px] text-slate-500 mt-0.5">
                {shipment.referenceNo} • {shipment.customer}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGeneratePdf}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <FileDown className="h-4 w-4" />
              Generate PDF
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(244,63,94,0.3)] transition hover:bg-rose-600"
            >
              <Send className="h-4 w-4" />
              Submit
            </button>
          </div>
        </div>

        {sourceDoc && !existing && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <Zap className="h-4 w-4 text-rose-500 shrink-0" />
            <p className="text-[13px] text-rose-700">
              <span className="font-semibold">Auto-filled from previous documents.</span>{" "}
              Common fields have been pre-populated.
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Details - Manual Input */}
            <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <h3 className="text-[14px] font-semibold text-slate-800 mb-4">
                Freight Invoice Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Invoice Number</label>
                  <input
                    className={`${inputClasses} ${errors.invoiceNumber ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.invoiceNumber}
                    onChange={(e) => {
                      set("invoiceNumber", e.target.value);
                      if (errors.invoiceNumber) setErrors(prev => ({ ...prev, invoiceNumber: "" }));
                    }}
                    placeholder="e.g. INV-001"
                  />
                  {errors.invoiceNumber && <p className="text-red-500 text-[11px] mt-1">{errors.invoiceNumber}</p>}
                </div>
                <div>
                  <label className={labelClasses}>Invoice Date</label>
                  <input
                    type="date"
                    className={`${inputClasses} ${errors.invoiceDate ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.invoiceDate}
                    onChange={(e) => {
                      set("invoiceDate", e.target.value);
                      if (errors.invoiceDate) setErrors(prev => ({ ...prev, invoiceDate: "" }));
                    }}
                  />
                  {errors.invoiceDate && <p className="text-red-500 text-[11px] mt-1">{errors.invoiceDate}</p>}
                </div>
                <div>
                  <label className={labelClasses}>Customer</label>
                  <input
                    className={`${inputClasses} ${errors.customer ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.customer}
                    onChange={(e) => {
                      set("customer", e.target.value);
                      if (errors.customer) setErrors(prev => ({ ...prev, customer: "" }));
                    }}
                  />
                  {errors.customer && <p className="text-red-500 text-[11px] mt-1">{errors.customer}</p>}
                </div>
                <div>
                  <label className={labelClasses}>NTN Number</label>
                  <input
                    className={`${inputClasses} ${errors.ntn ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.ntn}
                    onChange={(e) => {
                      set("ntn", e.target.value);
                      if (errors.ntn) setErrors(prev => ({ ...prev, ntn: "" }));
                    }}
                  />
                  {errors.ntn && <p className="text-red-500 text-[11px] mt-1">{errors.ntn}</p>}
                </div>
                <div>
                  <label className={labelClasses}>Clearing Agent</label>
                  <input
                    className={`${inputClasses} ${errors.clearingAgent ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.clearingAgent}
                    onChange={(e) => {
                      set("clearingAgent", e.target.value);
                      if (errors.clearingAgent) setErrors(prev => ({ ...prev, clearingAgent: "" }));
                    }}
                  />
                  {errors.clearingAgent && <p className="text-red-500 text-[11px] mt-1">{errors.clearingAgent}</p>}
                </div>
                <div>
                  <label className={labelClasses}>Exchange Rate</label>
                  <input
                    type="number"
                    className={`${inputClasses} ${errors.exchangeRate ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.exchangeRate || ""}
                    onChange={(e) => {
                      set("exchangeRate", parseFloat(e.target.value) || 0);
                      if (errors.exchangeRate) setErrors(prev => ({ ...prev, exchangeRate: "" }));
                    }}
                  />
                  {errors.exchangeRate && <p className="text-red-500 text-[11px] mt-1">{errors.exchangeRate}</p>}
                </div>
              </div>
            </div>

            {/* Charges Table */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <ChargesTable charges={charges} onChange={setCharges} />
            </div>

            {/* Read-only reference data */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)] opacity-80 pointer-events-none">
              <h3 className="text-[14px] font-semibold text-slate-800 mb-4 flex items-center gap-2">
                Shipment Reference Data
                <span className={autoFillBadge}>Read Only</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelClasses}>HBL No</label>
                  <input className={inputClasses} value={form.hblNumber} readOnly />
                </div>
                <div>
                  <label className={labelClasses}>MBL No</label>
                  <input className={inputClasses} value={form.mblNumber} readOnly />
                </div>
                <div>
                  <label className={labelClasses}>Vessel & Voyage</label>
                  <input className={inputClasses} value={`${form.vessel} ${form.voyage}`} readOnly />
                </div>
                <div>
                  <label className={labelClasses}>Shipping Line</label>
                  <input className={inputClasses} value={form.shippingLine} readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Invoice Summary
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between text-[13px]">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium text-slate-800">
                    {totals.subtotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between text-[14px]">
                  <span className="font-semibold text-slate-700">Grand Total</span>
                  <span className="font-bold text-slate-900">
                    {totals.grandTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
