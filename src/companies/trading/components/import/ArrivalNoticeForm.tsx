// src/companies/trading/components/import/ArrivalNoticeForm.tsx

import { useState } from "react";
import { ArrowLeft, Save, Send, Bell, Zap, FileDown } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { useImportStore } from "../../store/importStore";
import DocumentStatusBadge from "./DocumentStatusBadge";
import type { ArrivalNotice } from "../../types/importTypes";

const inputClasses =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-100";
const labelClasses =
  "block text-[12px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5";
const autoFillBadge =
  "ml-1.5 inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-600";

export default function ArrivalNoticeForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getShipment, saveArrivalNotice, updateDocumentStatus } =
    useImportStore();
  const shipment = getShipment(id!);
  const existing = shipment?.arrivalNotice;
  
  // Prefer MBL data, fallback to HBL
  const sourceDoc = shipment?.masterBL || shipment?.houseBL;
  
  const [form, setForm] = useState({
    noticeNo: existing?.noticeNo ?? "",
    noticeDate: existing?.noticeDate ?? new Date().toISOString().slice(0, 10),
    eta: existing?.eta ?? "",
    arrivalDate: existing?.arrivalDate ?? "",
    storageCharges: existing?.storageCharges ?? 0,
    demurrage: existing?.demurrage ?? 0,
    otherCharges: existing?.otherCharges ?? 0,
    remarks: existing?.remarks ?? "",

    // Auto-filled read-only fields
    hblNo: existing?.hblNo ?? shipment?.houseBL?.hblNumber ?? "",
    mblNo: existing?.mblNo ?? shipment?.masterBL?.mblNumber ?? "",
    bookingNo: existing?.bookingNo ?? sourceDoc?.bookingNumber ?? "",
    vessel: existing?.vessel ?? sourceDoc?.vessel ?? "",
    voyage: existing?.voyage ?? sourceDoc?.voyage ?? "",
    shippingLine: existing?.shippingLine ?? shipment?.masterBL?.shippingLine ?? "",
    cargoDescription: existing?.cargoDescription ?? sourceDoc?.cargoDescription ?? "",
    packages: existing?.packages ?? sourceDoc?.packages ?? 0,
    grossWeight: existing?.grossWeight ?? sourceDoc?.grossWeight ?? 0,
    pol: existing?.pol ?? sourceDoc?.pol ?? "",
    pod: existing?.pod ?? sourceDoc?.pod ?? "",
    destination: existing?.destination ?? sourceDoc?.placeOfDelivery ?? "",
    consignee: existing?.consignee ?? sourceDoc?.consignee ?? "",
  });

  const set = (field: string, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSave = () => {
    saveArrivalNotice(id!, {
      ...form,
      containers: existing?.containers ?? sourceDoc?.containers ?? [],
    } as Omit<ArrivalNotice, "id" | "shipmentId" | "status" | "audit">);
    navigate(`/trading/imports/${id}`);
  };

  const handleSubmit = () => {
    saveArrivalNotice(id!, {
      ...form,
      containers: existing?.containers ?? sourceDoc?.containers ?? [],
    } as Omit<ArrivalNotice, "id" | "shipmentId" | "status" | "audit">);
    updateDocumentStatus(id!, "arrivalNotice", "pending_approval");
    navigate(`/trading/imports/${id}`);
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
                <Bell className="h-5 w-5 text-amber-500" />
                <h1 className="text-[20px] font-bold tracking-tight text-slate-900">
                  Arrival Notice
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
            {existing && (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <FileDown className="h-4 w-4" />
                Generate PDF
              </button>
            )}
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
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(245,158,11,0.3)] transition hover:bg-amber-600"
            >
              <Send className="h-4 w-4" />
              Submit
            </button>
          </div>
        </div>

        {sourceDoc && !existing && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <Zap className="h-4 w-4 text-amber-500 shrink-0" />
            <p className="text-[13px] text-amber-700">
              <span className="font-semibold">Auto-filled from previous documents.</span>{" "}
              Common fields have been pre-populated.
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Notice Details - Manual Input */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <h3 className="text-[14px] font-semibold text-slate-800 mb-4">
                Arrival Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Notice Number</label>
                  <input
                    className={inputClasses}
                    value={form.noticeNo}
                    onChange={(e) => set("noticeNo", e.target.value)}
                    placeholder="e.g. AN-001"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Notice Date</label>
                  <input
                    type="date"
                    className={inputClasses}
                    value={form.noticeDate}
                    onChange={(e) => set("noticeDate", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClasses}>ETA (Expected Arrival)</label>
                  <input
                    type="date"
                    className={inputClasses}
                    value={form.eta}
                    onChange={(e) => set("eta", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Actual Arrival Date</label>
                  <input
                    type="date"
                    className={inputClasses}
                    value={form.arrivalDate}
                    onChange={(e) => set("arrivalDate", e.target.value)}
                  />
                </div>
              </div>

              <h3 className="text-[14px] font-semibold text-slate-800 mt-6 mb-4">
                Charges & Remarks
              </h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className={labelClasses}>Storage Charges</label>
                  <input
                    type="number"
                    className={inputClasses}
                    value={form.storageCharges || ""}
                    onChange={(e) =>
                      set("storageCharges", parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <div>
                  <label className={labelClasses}>Demurrage</label>
                  <input
                    type="number"
                    className={inputClasses}
                    value={form.demurrage || ""}
                    onChange={(e) =>
                      set("demurrage", parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <div>
                  <label className={labelClasses}>Other Charges</label>
                  <input
                    type="number"
                    className={inputClasses}
                    value={form.otherCharges || ""}
                    onChange={(e) =>
                      set("otherCharges", parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
              <div>
                <label className={labelClasses}>Remarks</label>
                <textarea
                  className={`${inputClasses} min-h-[56px] resize-none`}
                  value={form.remarks}
                  onChange={(e) => set("remarks", e.target.value)}
                  rows={2}
                />
              </div>
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
                  <input className={inputClasses} value={form.hblNo} readOnly />
                </div>
                <div>
                  <label className={labelClasses}>MBL No</label>
                  <input className={inputClasses} value={form.mblNo} readOnly />
                </div>
                <div>
                  <label className={labelClasses}>Vessel</label>
                  <input className={inputClasses} value={form.vessel} readOnly />
                </div>
                <div>
                  <label className={labelClasses}>Voyage</label>
                  <input className={inputClasses} value={form.voyage} readOnly />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClasses}>Consignee</label>
                  <textarea className={`${inputClasses} min-h-[56px]`} value={form.consignee} readOnly />
                </div>
                <div>
                  <label className={labelClasses}>Cargo Description</label>
                  <textarea className={`${inputClasses} min-h-[56px]`} value={form.cargoDescription} readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Shipment Info
              </h4>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Reference</span>
                  <span className="font-medium text-slate-800">{shipment.referenceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer</span>
                  <span className="font-medium text-slate-800">{shipment.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Stage</span>
                  <span className="font-medium text-slate-800">{shipment.currentStage}</span>
                </div>
              </div>
            </div>
            
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-[12px] text-blue-800">
                The Arrival Notice is generated internally and sent to the consignee to notify them of the vessel's arrival and outstanding charges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
