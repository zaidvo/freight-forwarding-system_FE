// src/companies/trading/components/import/MasterBLForm.tsx
//
// Master BL form. Auto-fills matching fields from House BL.

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Send, FilePlus, Zap, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { useImportStore, emptyContainer } from "../../store/importStore";
import ContainerTable from "./ContainerTable";
import PdfUploadSection from "./PdfUploadSection";
import DocumentStatusBadge from "./DocumentStatusBadge";
import SaveFeedback from "@/shared/components/SaveFeedback";
import type { ContainerRow, PdfAttachment, MasterBL } from "../../types/importTypes";
import { downloadImportPdf } from "../../services/tradingImportService";

const inputClasses = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100";
const labelClasses = "block text-[12px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5";
const autoFillBadge = "ml-1.5 inline-flex items-center gap-0.5 rounded-md bg-indigo-50 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-500";

export default function MasterBLForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getShipment, saveMasterBL, uploadPdf, loadShipments, isLoading } = useImportStore();
  const shipment = getShipment(id!);
  const existing = shipment?.masterBL;
  const isComplete = existing?.status === "pending_approval" || existing?.status === "approved";
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savingMode, setSavingMode] = useState<"draft" | "complete" | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const set = (field: string, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  useEffect(() => {
    if (!shipment) void loadShipments();
  }, [shipment, loadShipments]);

  useEffect(() => {
    if (!shipment) return;
    setForm({
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
      consignee: existing?.consignee ?? hbl?.consignee ?? shipment.customer ?? "",
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
    setContainers(existing?.containers?.length ? existing.containers : hbl?.containers?.length ? hbl.containers : [emptyContainer()]);
    setPdf(existing?.pdf);
  }, [existing, hbl, shipment]);

  useEffect(() => {
    const totalPackages = containers.reduce((s, c) => s + (c.packages || 0), 0);
    const totalGross = containers.reduce((s, c) => s + (c.grossWeight || 0), 0);
    const totalCbm = containers.reduce((s, c) => s + (c.cbm || 0), 0);
    setForm((f) => ({ ...f, packages: totalPackages, grossWeight: totalGross, cbm: totalCbm }));
  }, [containers]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.shippingLine.trim()) newErrors.shippingLine = "Shipping Line is required";
    if (!form.mblNumber.trim()) newErrors.mblNumber = "MBL Number is required";
    if (!form.bookingNumber.trim()) newErrors.bookingNumber = "Booking Number is required";
    if (!form.placeOfReceipt.trim()) newErrors.placeOfReceipt = "Place of Receipt is required";
    if (!form.pol.trim()) newErrors.pol = "Port of Loading (POL) is required";
    if (!form.pod.trim()) newErrors.pod = "Port of Discharge (POD) is required";
    if (!form.placeOfDelivery.trim()) newErrors.placeOfDelivery = "Place of Delivery is required";
    if (!form.vessel.trim()) newErrors.vessel = "Vessel is required";
    if (!form.voyage.trim()) newErrors.voyage = "Voyage is required";
    if (!form.shipper.trim()) newErrors.shipper = "Shipper details are required";
    if (!form.consignee.trim()) newErrors.consignee = "Consignee details are required";
    if (!form.notifyParty.trim()) newErrors.notifyParty = "Notify Party details are required";
    if (!form.cargoDescription.trim()) newErrors.cargoDescription = "Cargo Description is required";
    if (!form.freightTerms.trim()) newErrors.freightTerms = "Freight Terms is required";
    if (!form.onBoardDate.trim()) newErrors.onBoardDate = "On Board Date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (savingMode) return;
    setFeedback(null);
    setSavingMode("draft");
    try {
      await saveMasterBL(id!, { ...form, containers, pdf } as Omit<MasterBL, "id" | "shipmentId" | "status" | "audit">, isComplete);
      setFeedback({ type: "success", message: "Master BL saved successfully." });
      window.setTimeout(() => navigate(`/trading/imports/${id}`), 500);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Could not save the Master BL.",
      });
    } finally {
      setSavingMode(null);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setFeedback({ type: "error", message: "Complete the mandatory fields before marking this document complete." });
      return;
    }
    if (savingMode) return;
    setFeedback(null);
    setSavingMode("complete");
    try {
      await saveMasterBL(id!, { ...form, containers, pdf } as Omit<MasterBL, "id" | "shipmentId" | "status" | "audit">, true);
      setFeedback({ type: "success", message: "Master BL marked complete." });
      window.setTimeout(() => navigate(`/trading/imports/${id}`), 500);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Could not complete the Master BL.",
      });
    } finally {
      setSavingMode(null);
    }
  };

  const handlePdfUpload = async (file: File) => {
    const attachment = await uploadPdf(id!, "masterBL", file);
    setPdf(attachment);
  };

  const openPdf = async (download = false) => {
    if (!pdf) return;
    const blob = await downloadImportPdf(id!, "masterBL");
    const url = URL.createObjectURL(blob);
    if (download) {
      const link = document.createElement("a");
      link.href = url;
      link.download = pdf.fileName;
      link.click();
    } else {
      window.open(url, "_blank");
    }
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  if (!shipment) {
    return <AppLayout><div className="flex items-center justify-center h-64 text-slate-500">{isLoading ? "Loading shipment..." : "Shipment not found"}</div></AppLayout>;
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
                <FilePlus className="h-5 w-5 text-indigo-500" />
                <h1 className="text-[20px] font-bold tracking-tight text-slate-900">
                  Master Bill of Lading
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
              onClick={handleSave}
              disabled={savingMode !== null}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingMode === "draft" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {savingMode === "draft" ? "Saving..." : isComplete ? "Save Changes" : "Save Draft"}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={savingMode !== null}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingMode === "complete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {savingMode === "complete" ? "Marking Complete..." : "Mark Complete"}
            </button>
          </div>
        </div>

        {feedback && <SaveFeedback type={feedback.type} message={feedback.message} />}

        {/* Auto-fill notice */}
        {hbl && !existing && (
          <div className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
            <Zap className="h-4 w-4 text-indigo-500 shrink-0" />
            <p className="text-[13px] text-indigo-700">
              <span className="font-semibold">Auto-filled from House BL.</span> Common fields have been pre-populated. Review and adjust as needed.
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* MBL Details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <h3 className="text-[14px] font-semibold text-slate-800 mb-4">MBL Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Shipping Line</label>
                  <input
                    className={`${inputClasses} ${errors.shippingLine ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.shippingLine}
                    onChange={(e) => {
                      set("shippingLine", e.target.value);
                      if (errors.shippingLine) setErrors(prev => ({ ...prev, shippingLine: "" }));
                    }}
                    placeholder="Shipping Line name"
                  />
                  {errors.shippingLine && <p className="text-red-500 text-[11px] mt-1">{errors.shippingLine}</p>}
                </div>
                <div>
                  <label className={labelClasses}>MBL Number</label>
                  <input
                    className={`${inputClasses} ${errors.mblNumber ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.mblNumber}
                    onChange={(e) => {
                      set("mblNumber", e.target.value);
                      if (errors.mblNumber) setErrors(prev => ({ ...prev, mblNumber: "" }));
                    }}
                    placeholder="e.g. MBL-00001"
                  />
                  {errors.mblNumber && <p className="text-red-500 text-[11px] mt-1">{errors.mblNumber}</p>}
                </div>
                <div>
                  <label className={labelClasses}>Booking Number <span className={autoFillBadge}>Auto</span></label>
                  <input
                    className={`${inputClasses} ${errors.bookingNumber ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.bookingNumber}
                    onChange={(e) => {
                      set("bookingNumber", e.target.value);
                      if (errors.bookingNumber) setErrors(prev => ({ ...prev, bookingNumber: "" }));
                    }}
                  />
                  {errors.bookingNumber && <p className="text-red-500 text-[11px] mt-1">{errors.bookingNumber}</p>}
                </div>
                <div>
                  <label className={labelClasses}>Forwarder Reference</label>
                  <input className={inputClasses} value={form.forwarderReference} onChange={(e) => set("forwarderReference", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Port Details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <h3 className="text-[14px] font-semibold text-slate-800 mb-4">Port Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Place of Receipt <span className={autoFillBadge}>Auto</span></label>
                  <input
                    className={`${inputClasses} ${errors.placeOfReceipt ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.placeOfReceipt}
                    onChange={(e) => {
                      set("placeOfReceipt", e.target.value);
                      if (errors.placeOfReceipt) setErrors(prev => ({ ...prev, placeOfReceipt: "" }));
                    }}
                  />
                  {errors.placeOfReceipt && <p className="text-red-500 text-[11px] mt-1">{errors.placeOfReceipt}</p>}
                </div>
                <div>
                  <label className={labelClasses}>POL <span className={autoFillBadge}>Auto</span></label>
                  <input
                    className={`${inputClasses} ${errors.pol ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.pol}
                    onChange={(e) => {
                      set("pol", e.target.value);
                      if (errors.pol) setErrors(prev => ({ ...prev, pol: "" }));
                    }}
                  />
                  {errors.pol && <p className="text-red-500 text-[11px] mt-1">{errors.pol}</p>}
                </div>
                <div>
                  <label className={labelClasses}>POD <span className={autoFillBadge}>Auto</span></label>
                  <input
                    className={`${inputClasses} ${errors.pod ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.pod}
                    onChange={(e) => {
                      set("pod", e.target.value);
                      if (errors.pod) setErrors(prev => ({ ...prev, pod: "" }));
                    }}
                  />
                  {errors.pod && <p className="text-red-500 text-[11px] mt-1">{errors.pod}</p>}
                </div>
                <div>
                  <label className={labelClasses}>Place of Delivery <span className={autoFillBadge}>Auto</span></label>
                  <input
                    className={`${inputClasses} ${errors.placeOfDelivery ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.placeOfDelivery}
                    onChange={(e) => {
                      set("placeOfDelivery", e.target.value);
                      if (errors.placeOfDelivery) setErrors(prev => ({ ...prev, placeOfDelivery: "" }));
                    }}
                  />
                  {errors.placeOfDelivery && <p className="text-red-500 text-[11px] mt-1">{errors.placeOfDelivery}</p>}
                </div>
              </div>
            </div>

            {/* Vessel */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <h3 className="text-[14px] font-semibold text-slate-800 mb-4">Vessel</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Vessel <span className={autoFillBadge}>Auto</span></label>
                  <input
                    className={`${inputClasses} ${errors.vessel ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.vessel}
                    onChange={(e) => {
                      set("vessel", e.target.value);
                      if (errors.vessel) setErrors(prev => ({ ...prev, vessel: "" }));
                    }}
                  />
                  {errors.vessel && <p className="text-red-500 text-[11px] mt-1">{errors.vessel}</p>}
                </div>
                <div>
                  <label className={labelClasses}>Voyage <span className={autoFillBadge}>Auto</span></label>
                  <input
                    className={`${inputClasses} ${errors.voyage ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.voyage}
                    onChange={(e) => {
                      set("voyage", e.target.value);
                      if (errors.voyage) setErrors(prev => ({ ...prev, voyage: "" }));
                    }}
                  />
                  {errors.voyage && <p className="text-red-500 text-[11px] mt-1">{errors.voyage}</p>}
                </div>
              </div>
            </div>

            {/* Parties */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <h3 className="text-[14px] font-semibold text-slate-800 mb-4">Parties</h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClasses}>Shipper <span className={autoFillBadge}>Auto</span></label>
                  <textarea
                    className={`${inputClasses} min-h-[56px] resize-none ${errors.shipper ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.shipper}
                    onChange={(e) => {
                      set("shipper", e.target.value);
                      if (errors.shipper) setErrors(prev => ({ ...prev, shipper: "" }));
                    }}
                    rows={2}
                  />
                  {errors.shipper && <p className="text-red-500 text-[11px] mt-1">{errors.shipper}</p>}
                </div>
                <div>
                  <label className={labelClasses}>Consignee <span className={autoFillBadge}>Auto</span></label>
                  <textarea
                    className={`${inputClasses} min-h-[56px] resize-none ${errors.consignee ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.consignee}
                    onChange={(e) => {
                      set("consignee", e.target.value);
                      if (errors.consignee) setErrors(prev => ({ ...prev, consignee: "" }));
                    }}
                    rows={2}
                  />
                  {errors.consignee && <p className="text-red-500 text-[11px] mt-1">{errors.consignee}</p>}
                </div>
                <div>
                  <label className={labelClasses}>Notify Party <span className={autoFillBadge}>Auto</span></label>
                  <textarea
                    className={`${inputClasses} min-h-[56px] resize-none ${errors.notifyParty ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.notifyParty}
                    onChange={(e) => {
                      set("notifyParty", e.target.value);
                      if (errors.notifyParty) setErrors(prev => ({ ...prev, notifyParty: "" }));
                    }}
                    rows={2}
                  />
                  {errors.notifyParty && <p className="text-red-500 text-[11px] mt-1">{errors.notifyParty}</p>}
                </div>
              </div>
            </div>

            {/* Cargo */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <h3 className="text-[14px] font-semibold text-slate-800 mb-4">Cargo Details</h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClasses}>Cargo Description <span className={autoFillBadge}>Auto</span></label>
                  <textarea
                    className={`${inputClasses} min-h-[56px] resize-none ${errors.cargoDescription ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.cargoDescription}
                    onChange={(e) => {
                      set("cargoDescription", e.target.value);
                      if (errors.cargoDescription) setErrors(prev => ({ ...prev, cargoDescription: "" }));
                    }}
                    rows={2}
                  />
                  {errors.cargoDescription && <p className="text-red-500 text-[11px] mt-1">{errors.cargoDescription}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>Freight Terms <span className={autoFillBadge}>Auto</span></label>
                    <select className={inputClasses} value={form.freightTerms} onChange={(e) => set("freightTerms", e.target.value)}>
                      <option value="Prepaid">Prepaid</option>
                      <option value="Collect">Collect</option>
                    </select>
                  </div>
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
                <div>
                  <label className={labelClasses}>On Board Date <span className={autoFillBadge}>Auto</span></label>
                  <input
                    type="date"
                    className={`${inputClasses} ${errors.onBoardDate ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.onBoardDate}
                    onChange={(e) => {
                      set("onBoardDate", e.target.value);
                      if (errors.onBoardDate) setErrors(prev => ({ ...prev, onBoardDate: "" }));
                    }}
                  />
                  {errors.onBoardDate && <p className="text-red-500 text-[11px] mt-1">{errors.onBoardDate}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <PdfUploadSection pdf={pdf} onUpload={handlePdfUpload} onView={() => openPdf(false)} onDownload={() => openPdf(true)} onDownloadBlob={() => downloadImportPdf(id!, "masterBL")} label="Master BL Reference PDF" />
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



