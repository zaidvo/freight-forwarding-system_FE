// src/companies/trading/components/import/MasterBLForm.tsx
//
// Master BL form. Auto-fills matching fields from House BL.

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Send, FilePlus, Zap } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { useImportStore, emptyContainer } from "../../store/importStore";
import ContainerTable from "./ContainerTable";
import PdfUploadSection from "./PdfUploadSection";
import DocumentStatusBadge from "./DocumentStatusBadge";
import type { ContainerRow, PdfAttachment, MasterBL } from "../../types/importTypes";

const inputClasses = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100";
const labelClasses = "block text-[12px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5";
const autoFillBadge = "ml-1.5 inline-flex items-center gap-0.5 rounded-md bg-indigo-50 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-500";

export default function MasterBLForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getShipment, saveMasterBL, attachPdf, updateDocumentStatus } = useImportStore();
  const shipment = getShipment(id!);
  const existing = shipment?.masterBL;
  const hbl = shipment?.houseBL;

  const [form, setForm] = useState({
    shippingLine: existing?.shippingLine ?? "",
    mblNumber: existing?.mblNumber ?? "",
    bookingNumber: existing?.bookingNumber ?? hbl?.bookingNumber ?? "",
    placeOfReceipt: existing?.placeOfReceipt ?? hbl?.placeOfReceipt ?? "",
    pol: existing?.pol ?? hbl?.pol ?? "",
    pod: existing?.pod ?? hbl?.pod ?? "",
    placeOfDelivery: existing?.placeOfDelivery ?? hbl?.placeOfDelivery ?? "",
    vessel: existing?.vessel ?? hbl?.vessel ?? "",
    voyage: existing?.voyage ?? hbl?.voyage ?? "",
    shipper: existing?.shipper ?? hbl?.shipper ?? "",
    consignee: existing?.consignee ?? hbl?.consignee ?? "",
    notifyParty: existing?.notifyParty ?? hbl?.notifyParty ?? "",
    forwarderReference: existing?.forwarderReference ?? "",
    cargoDescription: existing?.cargoDescription ?? hbl?.cargoDescription ?? "",
    packages: existing?.packages ?? hbl?.packages ?? 0,
    grossWeight: existing?.grossWeight ?? hbl?.grossWeight ?? 0,
    cbm: existing?.cbm ?? hbl?.cbm ?? 0,
    freightTerms: existing?.freightTerms ?? hbl?.freightTerms ?? "Prepaid",
    freightCharges: existing?.freightCharges ?? "",
    countryOfOrigin: existing?.countryOfOrigin ?? "",
    placeOfIssue: existing?.placeOfIssue ?? "",
    issueDate: existing?.issueDate ?? new Date().toISOString().slice(0, 10),
    onBoardDate: existing?.onBoardDate ?? hbl?.onBoardDate ?? "",
  });

  const [containers, setContainers] = useState<ContainerRow[]>(
    existing?.containers ?? hbl?.containers ?? [emptyContainer()]
  );
  const [pdf, setPdf] = useState<PdfAttachment | undefined>(existing?.pdf);

  const set = (field: string, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  useEffect(() => {
    const totalPackages = containers.reduce((s, c) => s + (c.packages || 0), 0);
    const totalGross = containers.reduce((s, c) => s + (c.grossWeight || 0), 0);
    const totalCbm = containers.reduce((s, c) => s + (c.cbm || 0), 0);
    setForm((f) => ({ ...f, packages: totalPackages, grossWeight: totalGross, cbm: totalCbm }));
  }, [containers]);

  const handleSave = () => {
    saveMasterBL(id!, { ...form, containers, pdf } as Omit<MasterBL, "id" | "shipmentId" | "status" | "audit">);
    navigate(`/trading/imports/${id}`);
  };

  const handleSubmit = () => {
    saveMasterBL(id!, { ...form, containers, pdf } as Omit<MasterBL, "id" | "shipmentId" | "status" | "audit">);
    updateDocumentStatus(id!, "masterBL", "pending_approval");
    navigate(`/trading/imports/${id}`);
  };

  const handlePdfUpload = (file: File) => {
    const attachment: PdfAttachment = {
      fileName: file.name, fileSize: file.size,
      blobUrl: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(), uploadedBy: "Current User",
    };
    setPdf(attachment);
    if (existing) attachPdf(id!, "masterBL", attachment);
  };

  if (!shipment) {
    return <AppLayout><div className="flex items-center justify-center h-64 text-slate-500">Shipment not found</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate(`/trading/imports/${id}`)} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <FilePlus className="h-5 w-5 text-indigo-500" />
                <h1 className="text-[20px] font-bold tracking-tight text-slate-900">Master Bill of Lading</h1>
                {existing && <DocumentStatusBadge status={existing.status} size="md" />}
              </div>
              <p className="text-[13px] text-slate-500 mt-0.5">{shipment.referenceNo} • {shipment.customer}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleSave} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50">
              <Save className="h-4 w-4" /> Save Draft
            </button>
            <button type="button" onClick={handleSubmit} className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)] transition hover:bg-indigo-600">
              <Send className="h-4 w-4" /> Submit
            </button>
          </div>
        </div>

        {hbl && !existing && (
          <div className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
            <Zap className="h-4 w-4 text-indigo-500 shrink-0" />
            <p className="text-[13px] text-indigo-700"><span className="font-semibold">Auto-filled from House BL.</span> Common fields have been pre-populated.</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* MBL Details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <h3 className="text-[14px] font-semibold text-slate-800 mb-4">MBL Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClasses}>Shipping Line</label><input className={inputClasses} value={form.shippingLine} onChange={(e) => set("shippingLine", e.target.value)} placeholder="e.g. Maersk, MSC" /></div>
                <div><label className={labelClasses}>MBL Number</label><input className={inputClasses} value={form.mblNumber} onChange={(e) => set("mblNumber", e.target.value)} /></div>
                <div><label className={labelClasses}>Booking Number <span className={autoFillBadge}><Zap className="h-2 w-2" />Auto</span></label><input className={inputClasses} value={form.bookingNumber} onChange={(e) => set("bookingNumber", e.target.value)} /></div>
                <div><label className={labelClasses}>Forwarder Reference</label><input className={inputClasses} value={form.forwarderReference} onChange={(e) => set("forwarderReference", e.target.value)} /></div>
              </div>
            </div>

            {/* Port Details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <h3 className="text-[14px] font-semibold text-slate-800 mb-4">Port Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClasses}>Place of Receipt <span className={autoFillBadge}><Zap className="h-2 w-2" />Auto</span></label><input className={inputClasses} value={form.placeOfReceipt} onChange={(e) => set("placeOfReceipt", e.target.value)} /></div>
                <div><label className={labelClasses}>POL <span className={autoFillBadge}><Zap className="h-2 w-2" />Auto</span></label><input className={inputClasses} value={form.pol} onChange={(e) => set("pol", e.target.value)} /></div>
                <div><label className={labelClasses}>POD <span className={autoFillBadge}><Zap className="h-2 w-2" />Auto</span></label><input className={inputClasses} value={form.pod} onChange={(e) => set("pod", e.target.value)} /></div>
                <div><label className={labelClasses}>Place of Delivery <span className={autoFillBadge}><Zap className="h-2 w-2" />Auto</span></label><input className={inputClasses} value={form.placeOfDelivery} onChange={(e) => set("placeOfDelivery", e.target.value)} /></div>
              </div>
            </div>

            {/* Vessel */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <h3 className="text-[14px] font-semibold text-slate-800 mb-4">Vessel</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClasses}>Vessel <span className={autoFillBadge}><Zap className="h-2 w-2" />Auto</span></label><input className={inputClasses} value={form.vessel} onChange={(e) => set("vessel", e.target.value)} /></div>
                <div><label className={labelClasses}>Voyage <span className={autoFillBadge}><Zap className="h-2 w-2" />Auto</span></label><input className={inputClasses} value={form.voyage} onChange={(e) => set("voyage", e.target.value)} /></div>
              </div>
            </div>

            {/* Parties */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <h3 className="text-[14px] font-semibold text-slate-800 mb-4">Parties</h3>
              <div className="space-y-4">
                <div><label className={labelClasses}>Shipper <span className={autoFillBadge}><Zap className="h-2 w-2" />Auto</span></label><textarea className={`${inputClasses} min-h-[56px] resize-none`} value={form.shipper} onChange={(e) => set("shipper", e.target.value)} rows={2} /></div>
                <div><label className={labelClasses}>Consignee <span className={autoFillBadge}><Zap className="h-2 w-2" />Auto</span></label><textarea className={`${inputClasses} min-h-[56px] resize-none`} value={form.consignee} onChange={(e) => set("consignee", e.target.value)} rows={2} /></div>
                <div><label className={labelClasses}>Notify Party <span className={autoFillBadge}><Zap className="h-2 w-2" />Auto</span></label><textarea className={`${inputClasses} min-h-[56px] resize-none`} value={form.notifyParty} onChange={(e) => set("notifyParty", e.target.value)} rows={2} /></div>
              </div>
            </div>

            {/* Cargo */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <h3 className="text-[14px] font-semibold text-slate-800 mb-4">Cargo Details</h3>
              <div className="space-y-4">
                <div><label className={labelClasses}>Cargo Description <span className={autoFillBadge}><Zap className="h-2 w-2" />Auto</span></label><textarea className={`${inputClasses} min-h-[56px] resize-none`} value={form.cargoDescription} onChange={(e) => set("cargoDescription", e.target.value)} rows={2} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelClasses}>Freight Terms <span className={autoFillBadge}><Zap className="h-2 w-2" />Auto</span></label><select className={inputClasses} value={form.freightTerms} onChange={(e) => set("freightTerms", e.target.value)}><option value="Prepaid">Prepaid</option><option value="Collect">Collect</option></select></div>
                  <div><label className={labelClasses}>Freight Charges</label><input className={inputClasses} value={form.freightCharges} onChange={(e) => set("freightCharges", e.target.value)} placeholder="e.g. As Arranged" /></div>
                </div>
                <div><label className={labelClasses}>Country of Origin</label><input className={inputClasses} value={form.countryOfOrigin} onChange={(e) => set("countryOfOrigin", e.target.value)} placeholder="e.g. Thailand" /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className={labelClasses}>Packages</label><input type="number" className={inputClasses} value={form.packages || ""} readOnly /></div>
                  <div><label className={labelClasses}>Gross Weight</label><input type="number" className={inputClasses} value={form.grossWeight || ""} readOnly /></div>
                  <div><label className={labelClasses}>CBM</label><input type="number" className={inputClasses} value={form.cbm || ""} readOnly /></div>
                </div>
              </div>
            </div>

            {/* Containers */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <ContainerTable containers={containers} onChange={setContainers} />
            </div>

            {/* Issue Details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <h3 className="text-[14px] font-semibold text-slate-800 mb-4">Issue Details</h3>
              <div className="grid grid-cols-3 gap-4">
                <div><label className={labelClasses}>Place of Issue</label><input className={inputClasses} value={form.placeOfIssue} onChange={(e) => set("placeOfIssue", e.target.value)} /></div>
                <div><label className={labelClasses}>Issue Date</label><input type="date" className={inputClasses} value={form.issueDate} onChange={(e) => set("issueDate", e.target.value)} /></div>
                <div><label className={labelClasses}>On Board Date <span className={autoFillBadge}><Zap className="h-2 w-2" />Auto</span></label><input type="date" className={inputClasses} value={form.onBoardDate} onChange={(e) => set("onBoardDate", e.target.value)} /></div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <PdfUploadSection pdf={pdf} onUpload={handlePdfUpload} label="Master BL Reference PDF" />
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 mb-3">Shipment Info</h4>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between"><span className="text-slate-500">Reference</span><span className="font-medium text-slate-800">{shipment.referenceNo}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Customer</span><span className="font-medium text-slate-800">{shipment.customer}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Stage</span><span className="font-medium text-slate-800">{shipment.currentStage}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
