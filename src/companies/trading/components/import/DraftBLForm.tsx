// src/companies/trading/components/import/DraftBLForm.tsx

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Send, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { useImportStore, emptyContainer } from "../../store/importStore";
import ContainerTable from "./ContainerTable";
import PdfUploadSection from "./PdfUploadSection";
import DocumentStatusBadge from "./DocumentStatusBadge";
import type { ContainerRow, PdfAttachment, DraftBL } from "../../types/importTypes";
import { downloadImportPdf } from "../../services/tradingImportService";

const inputClasses =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100";
const labelClasses =
  "block text-[12px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5";

export default function DraftBLForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getShipment, saveDraftBL, uploadPdf, loadShipments, isLoading } =
    useImportStore();
  const shipment = getShipment(id!);

  const existing = shipment?.draftBL;

  const [form, setForm] = useState({
    draftBlNo: existing?.draftBlNo ?? "",
    bookingNo: existing?.bookingNo ?? "",
    vessel: existing?.vessel ?? "",
    voyage: existing?.voyage ?? "",
    pol: existing?.pol ?? "",
    pod: existing?.pod ?? "",
    placeOfDelivery: existing?.placeOfDelivery ?? "",
    shipper: existing?.shipper ?? "",
    consignee: existing?.consignee ?? shipment?.customer ?? "",
    notifyParty: existing?.notifyParty ?? "",
    cargoDescription: existing?.cargoDescription ?? "",
    hsCode: existing?.hsCode ?? "",
    packages: existing?.packages ?? 0,
    grossWeight: existing?.grossWeight ?? 0,
    netWeight: existing?.netWeight ?? 0,
    cbm: existing?.cbm ?? 0,
    freightTerms: existing?.freightTerms ?? "Prepaid",
    draftDate: existing?.draftDate ?? new Date().toISOString().slice(0, 10),
    onBoardDate: existing?.onBoardDate ?? "",
  });

  const [containers, setContainers] = useState<ContainerRow[]>(
    existing?.containers ?? [emptyContainer()]
  );

  const [pdf, setPdf] = useState<PdfAttachment | undefined>(existing?.pdf);

  const set = (field: string, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  useEffect(() => {
    if (!shipment) void loadShipments();
  }, [shipment, loadShipments]);

  useEffect(() => {
    if (!shipment) return;
    setForm({
      draftBlNo: existing?.draftBlNo ?? "",
      bookingNo: existing?.bookingNo ?? "",
      vessel: existing?.vessel ?? "",
      voyage: existing?.voyage ?? "",
      pol: existing?.pol ?? "",
      pod: existing?.pod ?? "",
      placeOfDelivery: existing?.placeOfDelivery ?? "",
      shipper: existing?.shipper ?? "",
      consignee: existing?.consignee ?? shipment.customer ?? "",
      notifyParty: existing?.notifyParty ?? "",
      cargoDescription: existing?.cargoDescription ?? "",
      hsCode: existing?.hsCode ?? "",
      packages: existing?.packages ?? 0,
      grossWeight: existing?.grossWeight ?? 0,
      netWeight: existing?.netWeight ?? 0,
      cbm: existing?.cbm ?? 0,
      freightTerms: existing?.freightTerms ?? "Prepaid",
      draftDate: existing?.draftDate ?? new Date().toISOString().slice(0, 10),
      onBoardDate: existing?.onBoardDate ?? "",
    });
    setContainers(existing?.containers?.length ? existing.containers : [emptyContainer()]);
    setPdf(existing?.pdf);
  }, [existing, shipment]);

  // Recalculate totals from containers
  useEffect(() => {
    const totalPackages = containers.reduce((s, c) => s + (c.packages || 0), 0);
    const totalGross = containers.reduce((s, c) => s + (c.grossWeight || 0), 0);
    const totalNet = containers.reduce((s, c) => s + (c.netWeight || 0), 0);
    const totalCbm = containers.reduce((s, c) => s + (c.cbm || 0), 0);
    setForm((f) => ({
      ...f,
      packages: totalPackages,
      grossWeight: totalGross,
      netWeight: totalNet,
      cbm: totalCbm,
    }));
  }, [containers]);

  const handleSave = async () => {
    await saveDraftBL(id!, { ...form, containers, pdf } as Omit<DraftBL, "id" | "shipmentId" | "status" | "audit">, false);
    navigate(`/trading/imports/${id}`);
  };

  const handleSubmit = async () => {
    await saveDraftBL(id!, { ...form, containers, pdf } as Omit<DraftBL, "id" | "shipmentId" | "status" | "audit">, true);
    navigate(`/trading/imports/${id}`);
  };

  const handlePdfUpload = async (file: File) => {
    const attachment = await uploadPdf(id!, "draftBL", file);
    setPdf(attachment);
  };

  const openPdf = async (download = false) => {
    if (!pdf) return;
    const blob = await downloadImportPdf(id!, "draftBL");
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
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-slate-500">
          {isLoading ? "Loading shipment..." : "Shipment not found"}
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
                <FileText className="h-5 w-5 text-blue-500" />
                <h1 className="text-[20px] font-bold tracking-tight text-slate-900">
                  Draft Bill of Lading
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
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] transition hover:bg-blue-600"
            >
              <Send className="h-4 w-4" />
              Submit
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main form - 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            {/* BL Details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <h3 className="text-[14px] font-semibold text-slate-800 mb-4">
                BL Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Draft BL No</label>
                  <input
                    className={inputClasses}
                    value={form.draftBlNo}
                    onChange={(e) => set("draftBlNo", e.target.value)}
                    placeholder="e.g. DBL-00001"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Booking No</label>
                  <input
                    className={inputClasses}
                    value={form.bookingNo}
                    onChange={(e) => set("bookingNo", e.target.value)}
                    placeholder="e.g. BKG-2026-001"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Vessel</label>
                  <input
                    className={inputClasses}
                    value={form.vessel}
                    onChange={(e) => set("vessel", e.target.value)}
                    placeholder="Vessel name"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Voyage</label>
                  <input
                    className={inputClasses}
                    value={form.voyage}
                    onChange={(e) => set("voyage", e.target.value)}
                    placeholder="Voyage number"
                  />
                </div>
              </div>
            </div>

            {/* Port Details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <h3 className="text-[14px] font-semibold text-slate-800 mb-4">
                Port Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Port of Loading (POL)</label>
                  <input
                    className={inputClasses}
                    value={form.pol}
                    onChange={(e) => set("pol", e.target.value)}
                    placeholder="e.g. Bangkok, Thailand"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Port of Discharge (POD)</label>
                  <input
                    className={inputClasses}
                    value={form.pod}
                    onChange={(e) => set("pod", e.target.value)}
                    placeholder="e.g. Karachi, Pakistan"
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelClasses}>Place of Delivery</label>
                  <input
                    className={inputClasses}
                    value={form.placeOfDelivery}
                    onChange={(e) => set("placeOfDelivery", e.target.value)}
                    placeholder="Final delivery location"
                  />
                </div>
              </div>
            </div>

            {/* Parties */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <h3 className="text-[14px] font-semibold text-slate-800 mb-4">
                Parties
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClasses}>Shipper</label>
                  <textarea
                    className={`${inputClasses} min-h-[56px] resize-none`}
                    value={form.shipper}
                    onChange={(e) => set("shipper", e.target.value)}
                    placeholder="Shipper name and address"
                    rows={2}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Consignee</label>
                  <textarea
                    className={`${inputClasses} min-h-[56px] resize-none`}
                    value={form.consignee}
                    onChange={(e) => set("consignee", e.target.value)}
                    placeholder="Consignee name and address"
                    rows={2}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Notify Party</label>
                  <textarea
                    className={`${inputClasses} min-h-[56px] resize-none`}
                    value={form.notifyParty}
                    onChange={(e) => set("notifyParty", e.target.value)}
                    placeholder="Notify party details"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Cargo */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <h3 className="text-[14px] font-semibold text-slate-800 mb-4">
                Cargo Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClasses}>Cargo Description</label>
                  <textarea
                    className={`${inputClasses} min-h-[56px] resize-none`}
                    value={form.cargoDescription}
                    onChange={(e) => set("cargoDescription", e.target.value)}
                    placeholder="Description of goods"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>HS Code</label>
                    <input
                      className={inputClasses}
                      value={form.hsCode}
                      onChange={(e) => set("hsCode", e.target.value)}
                      placeholder="e.g. 1006.30"
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Freight Terms</label>
                    <select
                      className={inputClasses}
                      value={form.freightTerms}
                      onChange={(e) => set("freightTerms", e.target.value)}
                    >
                      <option value="Prepaid">Prepaid</option>
                      <option value="Collect">Collect</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className={labelClasses}>Packages</label>
                    <input
                      type="number"
                      className={inputClasses}
                      value={form.packages || ""}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Gross Weight (kg)</label>
                    <input
                      type="number"
                      className={inputClasses}
                      value={form.grossWeight || ""}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Net Weight (kg)</label>
                    <input
                      type="number"
                      className={inputClasses}
                      value={form.netWeight || ""}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>CBM</label>
                    <input
                      type="number"
                      className={inputClasses}
                      value={form.cbm || ""}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Containers */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <ContainerTable
                containers={containers}
                onChange={setContainers}
              />
            </div>

            {/* Dates */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <h3 className="text-[14px] font-semibold text-slate-800 mb-4">
                Dates
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Draft Date</label>
                  <input
                    type="date"
                    className={inputClasses}
                    value={form.draftDate}
                    onChange={(e) => set("draftDate", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClasses}>On Board Date</label>
                  <input
                    type="date"
                    className={inputClasses}
                    value={form.onBoardDate}
                    onChange={(e) => set("onBoardDate", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - PDF Upload */}
          <div className="space-y-4">
            <PdfUploadSection
              pdf={pdf}
              onUpload={handlePdfUpload}
              onView={() => openPdf(false)}
              onDownload={() => openPdf(true)}
              label="Draft BL Reference PDF"
            />

            {/* Shipment Summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Shipment Info
              </h4>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Reference</span>
                  <span className="font-medium text-slate-800">
                    {shipment.referenceNo}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer</span>
                  <span className="font-medium text-slate-800">
                    {shipment.customer}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Salesperson</span>
                  <span className="font-medium text-slate-800">
                    {shipment.salesperson || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Expected Arrival</span>
                  <span className="font-medium text-slate-800">
                    {shipment.expectedArrivalDate
                      ? new Date(
                          shipment.expectedArrivalDate
                        ).toLocaleDateString()
                      : "—"}
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
