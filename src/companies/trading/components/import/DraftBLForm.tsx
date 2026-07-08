// src/companies/trading/components/import/DraftBLForm.tsx

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Send, FileText, Sparkles } from "lucide-react";
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

const parsePartyText = (text: string) => {
  if (!text) return { name: "", address: "", phone: "", email: "" };
  const lines = text.split("\n").map(l => l.trim());
  let name = "";
  let phone = "";
  let email = "";
  const addressLines: string[] = [];

  lines.forEach((line, index) => {
    if (!line) return;
    const lower = line.toLowerCase();
    if (lower.startsWith("phone:") || lower.includes("phone: ")) {
      phone = line.replace(/^[Pp]hone:\s*/i, "").trim();
    } else if (lower.startsWith("email:") || lower.includes("email: ") || lower.includes("@")) {
      email = line.replace(/^[Ee]mail:\s*/i, "").trim();
    } else if (index === 0) {
      name = line;
    } else {
      addressLines.push(line);
    }
  });

  return {
    name,
    address: addressLines.join("\n"),
    phone,
    email,
  };
};

const compilePartyText = (name: string, address: string, phone: string, email: string) => {
  const parts = [];
  if (name.trim()) parts.push(name.trim());
  if (address.trim()) parts.push(address.trim());
  if (phone.trim()) parts.push(`Phone: ${phone.trim()}`);
  if (email.trim()) parts.push(`Email: ${email.trim()}`);
  return parts.join("\n");
};

const parsePartiesFromText = (text: string) => {
  const result = {
    shipperName: "",
    shipperAddress: "",
    shipperPhone: "",
    shipperEmail: "",
    consigneeName: "",
    consigneeAddress: "",
    consigneePhone: "",
    consigneeEmail: "",
    notifyPartyName: "",
    notifyPartyAddress: "",
    notifyPartyPhone: "",
    notifyPartyEmail: "",
  };

  if (!text) return result;

  const lines = text.split("\n").map(l => l.trim());

  let currentSection: "shipper" | "consignee" | "notify" | null = null;
  const shipperLines: string[] = [];
  const consigneeLines: string[] = [];
  const notifyLines: string[] = [];

  const shipperKeywords = ["shipper (exporter):", "shipper:", "exporter:"];
  const consigneeKeywords = ["consignee (importer):", "consignee:", "importer:"];
  const notifyKeywords = ["notify party:", "notify:"];

  for (const line of lines) {
    if (!line) continue;
    const lowerLine = line.toLowerCase();
    
    if (shipperKeywords.some(k => lowerLine.startsWith(k) || lowerLine === "shipper" || lowerLine === "exporter")) {
      currentSection = "shipper";
      continue;
    } else if (consigneeKeywords.some(k => lowerLine.startsWith(k) || lowerLine === "consignee" || lowerLine === "importer")) {
      currentSection = "consignee";
      continue;
    } else if (notifyKeywords.some(k => lowerLine.startsWith(k) || lowerLine === "notify party" || lowerLine === "notify")) {
      currentSection = "notify";
      continue;
    }

    if (currentSection === "shipper") {
      shipperLines.push(line);
    } else if (currentSection === "consignee") {
      consigneeLines.push(line);
    } else if (currentSection === "notify") {
      notifyLines.push(line);
    }
  }

  const shipperData = parsePartyText(shipperLines.join("\n"));
  result.shipperName = shipperData.name;
  result.shipperAddress = shipperData.address;
  result.shipperPhone = shipperData.phone;
  result.shipperEmail = shipperData.email;

  const consigneeData = parsePartyText(consigneeLines.join("\n"));
  result.consigneeName = consigneeData.name;
  result.consigneeAddress = consigneeData.address;
  result.consigneePhone = consigneeData.phone;
  result.consigneeEmail = consigneeData.email;

  const notifyData = parsePartyText(notifyLines.join("\n"));
  result.notifyPartyName = notifyData.name;
  result.notifyPartyAddress = notifyData.address;
  result.notifyPartyPhone = notifyData.phone;
  result.notifyPartyEmail = notifyData.email;

  return result;
};

export default function DraftBLForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getShipment, saveDraftBL, uploadPdf, loadShipments, isLoading } =
    useImportStore();
  const shipment = getShipment(id!);

  const existing = shipment?.draftBL;

  // Split initialization
  const sParsed = parsePartyText(existing?.shipper ?? "");
  const cParsed = parsePartyText(existing?.consignee ?? shipment?.customer ?? "");
  const nParsed = parsePartyText(existing?.notifyParty ?? "");

  const [form, setForm] = useState({
    draftBlNo: existing?.draftBlNo ?? "",
    bookingNo: existing?.bookingNo ?? "",
    vessel: existing?.vessel ?? "",
    voyage: existing?.voyage ?? "",
    pol: existing?.pol ?? "",
    pod: existing?.pod ?? "",
    placeOfDelivery: existing?.placeOfDelivery ?? "",
    
    // Separate fields
    shipperName: (existing as any)?.shipperName ?? sParsed.name,
    shipperAddress: (existing as any)?.shipperAddress ?? sParsed.address,
    shipperPhone: (existing as any)?.shipperPhone ?? sParsed.phone,
    shipperEmail: (existing as any)?.shipperEmail ?? sParsed.email,

    consigneeName: (existing as any)?.consigneeName ?? cParsed.name,
    consigneeAddress: (existing as any)?.consigneeAddress ?? cParsed.address,
    consigneePhone: (existing as any)?.consigneePhone ?? cParsed.phone,
    consigneeEmail: (existing as any)?.consigneeEmail ?? cParsed.email,

    notifyPartyName: (existing as any)?.notifyPartyName ?? nParsed.name,
    notifyPartyAddress: (existing as any)?.notifyPartyAddress ?? nParsed.address,
    notifyPartyPhone: (existing as any)?.notifyPartyPhone ?? nParsed.phone,
    notifyPartyEmail: (existing as any)?.notifyPartyEmail ?? nParsed.email,

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
  const [extractedPdfText, setExtractedPdfText] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  useEffect(() => {
    if (!shipment) void loadShipments();
  }, [shipment, loadShipments]);

  useEffect(() => {
    if (!shipment) return;
    const sP = parsePartyText(existing?.shipper ?? "");
    const cP = parsePartyText(existing?.consignee ?? shipment.customer ?? "");
    const nP = parsePartyText(existing?.notifyParty ?? "");

    setForm({
      draftBlNo: existing?.draftBlNo ?? "",
      bookingNo: existing?.bookingNo ?? "",
      vessel: existing?.vessel ?? "",
      voyage: existing?.voyage ?? "",
      pol: existing?.pol ?? "",
      pod: existing?.pod ?? "",
      placeOfDelivery: existing?.placeOfDelivery ?? "",
      
      // Separate fields
      shipperName: (existing as any)?.shipperName ?? sP.name,
      shipperAddress: (existing as any)?.shipperAddress ?? sP.address,
      shipperPhone: (existing as any)?.shipperPhone ?? sP.phone,
      shipperEmail: (existing as any)?.shipperEmail ?? sP.email,

      consigneeName: (existing as any)?.consigneeName ?? cP.name,
      consigneeAddress: (existing as any)?.consigneeAddress ?? cP.address,
      consigneePhone: (existing as any)?.consigneePhone ?? cP.phone,
      consigneeEmail: (existing as any)?.consigneeEmail ?? cP.email,

      notifyPartyName: (existing as any)?.notifyPartyName ?? nP.name,
      notifyPartyAddress: (existing as any)?.notifyPartyAddress ?? nP.address,
      notifyPartyPhone: (existing as any)?.notifyPartyPhone ?? nP.phone,
      notifyPartyEmail: (existing as any)?.notifyPartyEmail ?? nP.email,

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.draftBlNo.trim()) newErrors.draftBlNo = "Draft BL No is required";
    if (!form.bookingNo.trim()) newErrors.bookingNo = "Booking No is required";
    if (!form.vessel.trim()) newErrors.vessel = "Vessel is required";
    if (!form.voyage.trim()) newErrors.voyage = "Voyage is required";
    if (!form.pol.trim()) newErrors.pol = "Port of Loading is required";
    if (!form.pod.trim()) newErrors.pod = "Port of Discharge is required";
    if (!form.placeOfDelivery.trim()) newErrors.placeOfDelivery = "Place of Delivery is required";
    
    // Shipper
    if (!form.shipperName.trim()) newErrors.shipperName = "Shipper Name is required";
    if (!form.shipperAddress.trim()) newErrors.shipperAddress = "Shipper Address is required";
    if (!form.shipperPhone.trim()) newErrors.shipperPhone = "Shipper Phone is required";
    if (!form.shipperEmail.trim()) newErrors.shipperEmail = "Shipper Email is required";

    // Consignee
    if (!form.consigneeName.trim()) newErrors.consigneeName = "Consignee Name is required";
    if (!form.consigneeAddress.trim()) newErrors.consigneeAddress = "Consignee Address is required";
    if (!form.consigneePhone.trim()) newErrors.consigneePhone = "Consignee Phone is required";
    if (!form.consigneeEmail.trim()) newErrors.consigneeEmail = "Consignee Email is required";

    // Notify Party
    if (!form.notifyPartyName.trim()) newErrors.notifyPartyName = "Notify Party Name is required";
    if (!form.notifyPartyAddress.trim()) newErrors.notifyPartyAddress = "Notify Party Address is required";

    if (!form.cargoDescription.trim()) newErrors.cargoDescription = "Cargo Description is required";
    if (!form.hsCode.trim()) newErrors.hsCode = "HS Code is required";
    if (!form.draftDate.trim()) newErrors.draftDate = "Draft Date is required";
    if (!form.onBoardDate.trim()) newErrors.onBoardDate = "On Board Date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPayload = () => {
    const compiledShipper = compilePartyText(form.shipperName, form.shipperAddress, form.shipperPhone, form.shipperEmail);
    const compiledConsignee = compilePartyText(form.consigneeName, form.consigneeAddress, form.consigneePhone, form.consigneeEmail);
    const compiledNotifyParty = compilePartyText(form.notifyPartyName, form.notifyPartyAddress, form.notifyPartyPhone, form.notifyPartyEmail);

    return {
      ...form,
      shipper: compiledShipper,
      consignee: compiledConsignee,
      notifyParty: compiledNotifyParty,
    };
  };

  const handleSave = async () => {
    const payload = getPayload();
    await saveDraftBL(id!, { ...payload, containers, pdf } as Omit<DraftBL, "id" | "shipmentId" | "status" | "audit">, false);
    navigate(`/trading/imports/${id}`);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert("Please fill in all mandatory fields before submitting.");
      return;
    }
    const payload = getPayload();
    await saveDraftBL(id!, { ...payload, containers, pdf } as Omit<DraftBL, "id" | "shipmentId" | "status" | "audit">, true);
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

  const handleAutoFillParties = () => {
    if (!extractedPdfText) return;
    const parsed = parsePartiesFromText(extractedPdfText);
    setForm((f) => ({ ...f, ...parsed }));
    // Clear validation errors for these fields
    setErrors((prev) => {
      const updated = { ...prev };
      Object.keys(parsed).forEach((k) => delete updated[k]);
      return updated;
    });
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
                    className={`${inputClasses} ${errors.draftBlNo ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.draftBlNo}
                    onChange={(e) => {
                      set("draftBlNo", e.target.value);
                      if (errors.draftBlNo) setErrors(prev => ({ ...prev, draftBlNo: "" }));
                    }}
                    placeholder="e.g. DBL-00001"
                  />
                  {errors.draftBlNo && <p className="text-red-500 text-[11px] mt-1">{errors.draftBlNo}</p>}
                </div>
                <div>
                  <label className={labelClasses}>Booking No</label>
                  <input
                    className={`${inputClasses} ${errors.bookingNo ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.bookingNo}
                    onChange={(e) => {
                      set("bookingNo", e.target.value);
                      if (errors.bookingNo) setErrors(prev => ({ ...prev, bookingNo: "" }));
                    }}
                    placeholder="e.g. BKG-2026-001"
                  />
                  {errors.bookingNo && <p className="text-red-500 text-[11px] mt-1">{errors.bookingNo}</p>}
                </div>
                <div>
                  <label className={labelClasses}>Vessel</label>
                  <input
                    className={`${inputClasses} ${errors.vessel ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.vessel}
                    onChange={(e) => {
                      set("vessel", e.target.value);
                      if (errors.vessel) setErrors(prev => ({ ...prev, vessel: "" }));
                    }}
                    placeholder="Vessel name"
                  />
                  {errors.vessel && <p className="text-red-500 text-[11px] mt-1">{errors.vessel}</p>}
                </div>
                <div>
                  <label className={labelClasses}>Voyage</label>
                  <input
                    className={`${inputClasses} ${errors.voyage ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.voyage}
                    onChange={(e) => {
                      set("voyage", e.target.value);
                      if (errors.voyage) setErrors(prev => ({ ...prev, voyage: "" }));
                    }}
                    placeholder="Voyage number"
                  />
                  {errors.voyage && <p className="text-red-500 text-[11px] mt-1">{errors.voyage}</p>}
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
                    className={`${inputClasses} ${errors.pol ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.pol}
                    onChange={(e) => {
                      set("pol", e.target.value);
                      if (errors.pol) setErrors(prev => ({ ...prev, pol: "" }));
                    }}
                    placeholder="e.g. Bangkok, Thailand"
                  />
                  {errors.pol && <p className="text-red-500 text-[11px] mt-1">{errors.pol}</p>}
                </div>
                <div>
                  <label className={labelClasses}>Port of Discharge (POD)</label>
                  <input
                    className={`${inputClasses} ${errors.pod ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.pod}
                    onChange={(e) => {
                      set("pod", e.target.value);
                      if (errors.pod) setErrors(prev => ({ ...prev, pod: "" }));
                    }}
                    placeholder="e.g. Karachi, Pakistan"
                  />
                  {errors.pod && <p className="text-red-500 text-[11px] mt-1">{errors.pod}</p>}
                </div>
                <div className="col-span-2">
                  <label className={labelClasses}>Place of Delivery</label>
                  <input
                    className={`${inputClasses} ${errors.placeOfDelivery ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.placeOfDelivery}
                    onChange={(e) => {
                      set("placeOfDelivery", e.target.value);
                      if (errors.placeOfDelivery) setErrors(prev => ({ ...prev, placeOfDelivery: "" }));
                    }}
                    placeholder="Final delivery location"
                  />
                  {errors.placeOfDelivery && <p className="text-red-500 text-[11px] mt-1">{errors.placeOfDelivery}</p>}
                </div>
              </div>
            </div>

            {/* Parties Details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(22,31,54,0.04)] space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-[14px] font-semibold text-slate-800">
                  Parties Details
                </h3>
                {extractedPdfText && (
                  <button
                    type="button"
                    onClick={handleAutoFillParties}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Auto-Fill from PDF Text
                  </button>
                )}
              </div>

              {/* Shipper Section */}
              <div className="space-y-3">
                <h4 className="text-[12px] font-bold text-slate-700 uppercase tracking-wider border-l-2 border-blue-500 pl-2">
                  Shipper / Exporter
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className={labelClasses}>Company Name</label>
                    <input
                      className={`${inputClasses} ${errors.shipperName ? "border-red-500 focus:ring-red-100" : ""}`}
                      value={form.shipperName}
                      onChange={(e) => {
                        set("shipperName", e.target.value);
                        if (errors.shipperName) setErrors(prev => ({ ...prev, shipperName: "" }));
                      }}
                      placeholder="e.g. ABC Textile Industries Pvt. Ltd."
                    />
                    {errors.shipperName && <p className="text-red-500 text-[11px] mt-1">{errors.shipperName}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClasses}>Address</label>
                    <textarea
                      className={`${inputClasses} min-h-[60px] resize-y ${errors.shipperAddress ? "border-red-500 focus:ring-red-100" : ""}`}
                      value={form.shipperAddress}
                      onChange={(e) => {
                        set("shipperAddress", e.target.value);
                        if (errors.shipperAddress) setErrors(prev => ({ ...prev, shipperAddress: "" }));
                      }}
                      placeholder="Plot, Street, City, Country"
                      rows={2}
                    />
                    {errors.shipperAddress && <p className="text-red-500 text-[11px] mt-1">{errors.shipperAddress}</p>}
                  </div>
                  <div>
                    <label className={labelClasses}>Phone</label>
                    <input
                      className={`${inputClasses} ${errors.shipperPhone ? "border-red-500 focus:ring-red-100" : ""}`}
                      value={form.shipperPhone}
                      onChange={(e) => {
                        set("shipperPhone", e.target.value);
                        if (errors.shipperPhone) setErrors(prev => ({ ...prev, shipperPhone: "" }));
                      }}
                      placeholder="e.g. +92 21 34567890"
                    />
                    {errors.shipperPhone && <p className="text-red-500 text-[11px] mt-1">{errors.shipperPhone}</p>}
                  </div>
                  <div>
                    <label className={labelClasses}>Email</label>
                    <input
                      type="email"
                      className={`${inputClasses} ${errors.shipperEmail ? "border-red-500 focus:ring-red-100" : ""}`}
                      value={form.shipperEmail}
                      onChange={(e) => {
                        set("shipperEmail", e.target.value);
                        if (errors.shipperEmail) setErrors(prev => ({ ...prev, shipperEmail: "" }));
                      }}
                      placeholder="e.g. exports@abctextile.com"
                    />
                    {errors.shipperEmail && <p className="text-red-500 text-[11px] mt-1">{errors.shipperEmail}</p>}
                  </div>
                </div>
              </div>

              {/* Consignee Section */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-[12px] font-bold text-slate-700 uppercase tracking-wider border-l-2 border-blue-500 pl-2">
                  Consignee / Importer
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className={labelClasses}>Company Name</label>
                    <input
                      className={`${inputClasses} ${errors.consigneeName ? "border-red-500 focus:ring-red-100" : ""}`}
                      value={form.consigneeName}
                      onChange={(e) => {
                        set("consigneeName", e.target.value);
                        if (errors.consigneeName) setErrors(prev => ({ ...prev, consigneeName: "" }));
                      }}
                      placeholder="e.g. XYZ Fashion Trading LLC"
                    />
                    {errors.consigneeName && <p className="text-red-500 text-[11px] mt-1">{errors.consigneeName}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClasses}>Address</label>
                    <textarea
                      className={`${inputClasses} min-h-[60px] resize-y ${errors.consigneeAddress ? "border-red-500 focus:ring-red-100" : ""}`}
                      value={form.consigneeAddress}
                      onChange={(e) => {
                        set("consigneeAddress", e.target.value);
                        if (errors.consigneeAddress) setErrors(prev => ({ ...prev, consigneeAddress: "" }));
                      }}
                      placeholder="Warehouse, Area, City, Country"
                      rows={2}
                    />
                    {errors.consigneeAddress && <p className="text-red-500 text-[11px] mt-1">{errors.consigneeAddress}</p>}
                  </div>
                  <div>
                    <label className={labelClasses}>Phone</label>
                    <input
                      className={`${inputClasses} ${errors.consigneePhone ? "border-red-500 focus:ring-red-100" : ""}`}
                      value={form.consigneePhone}
                      onChange={(e) => {
                        set("consigneePhone", e.target.value);
                        if (errors.consigneePhone) setErrors(prev => ({ ...prev, consigneePhone: "" }));
                      }}
                      placeholder="e.g. +971 4 1234567"
                    />
                    {errors.consigneePhone && <p className="text-red-500 text-[11px] mt-1">{errors.consigneePhone}</p>}
                  </div>
                  <div>
                    <label className={labelClasses}>Email</label>
                    <input
                      type="email"
                      className={`${inputClasses} ${errors.consigneeEmail ? "border-red-500 focus:ring-red-100" : ""}`}
                      value={form.consigneeEmail}
                      onChange={(e) => {
                        set("consigneeEmail", e.target.value);
                        if (errors.consigneeEmail) setErrors(prev => ({ ...prev, consigneeEmail: "" }));
                      }}
                      placeholder="e.g. imports@xyzfashion.ae"
                    />
                    {errors.consigneeEmail && <p className="text-red-500 text-[11px] mt-1">{errors.consigneeEmail}</p>}
                  </div>
                </div>
              </div>

              {/* Notify Party Section */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-[12px] font-bold text-slate-700 uppercase tracking-wider border-l-2 border-blue-500 pl-2">
                  Notify Party
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className={labelClasses}>Company Name</label>
                    <input
                      className={`${inputClasses} ${errors.notifyPartyName ? "border-red-500 focus:ring-red-100" : ""}`}
                      value={form.notifyPartyName}
                      onChange={(e) => {
                        set("notifyPartyName", e.target.value);
                        if (errors.notifyPartyName) setErrors(prev => ({ ...prev, notifyPartyName: "" }));
                      }}
                      placeholder="e.g. XYZ Fashion Trading LLC"
                    />
                    {errors.notifyPartyName && <p className="text-red-500 text-[11px] mt-1">{errors.notifyPartyName}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClasses}>Address</label>
                    <textarea
                      className={`${inputClasses} min-h-[60px] resize-y ${errors.notifyPartyAddress ? "border-red-500 focus:ring-red-100" : ""}`}
                      value={form.notifyPartyAddress}
                      onChange={(e) => {
                        set("notifyPartyAddress", e.target.value);
                        if (errors.notifyPartyAddress) setErrors(prev => ({ ...prev, notifyPartyAddress: "" }));
                      }}
                      placeholder="Warehouse, Area, City, Country"
                      rows={2}
                    />
                    {errors.notifyPartyAddress && <p className="text-red-500 text-[11px] mt-1">{errors.notifyPartyAddress}</p>}
                  </div>
                  <div>
                    <label className={labelClasses}>Phone (Optional)</label>
                    <input
                      className={inputClasses}
                      value={form.notifyPartyPhone}
                      onChange={(e) => set("notifyPartyPhone", e.target.value)}
                      placeholder="e.g. +971 4 1234567"
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Email (Optional)</label>
                    <input
                      type="email"
                      className={inputClasses}
                      value={form.notifyPartyEmail}
                      onChange={(e) => set("notifyPartyEmail", e.target.value)}
                      placeholder="e.g. imports@xyzfashion.ae"
                    />
                  </div>
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
                    className={`${inputClasses} min-h-[56px] resize-none ${errors.cargoDescription ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.cargoDescription}
                    onChange={(e) => {
                      set("cargoDescription", e.target.value);
                      if (errors.cargoDescription) setErrors(prev => ({ ...prev, cargoDescription: "" }));
                    }}
                    placeholder="Description of goods"
                    rows={2}
                  />
                  {errors.cargoDescription && <p className="text-red-500 text-[11px] mt-1">{errors.cargoDescription}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>HS Code</label>
                    <input
                      className={`${inputClasses} ${errors.hsCode ? "border-red-500 focus:ring-red-100" : ""}`}
                      value={form.hsCode}
                      onChange={(e) => {
                        set("hsCode", e.target.value);
                        if (errors.hsCode) setErrors(prev => ({ ...prev, hsCode: "" }));
                      }}
                      placeholder="e.g. 1006.30"
                    />
                    {errors.hsCode && <p className="text-red-500 text-[11px] mt-1">{errors.hsCode}</p>}
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
                    className={`${inputClasses} ${errors.draftDate ? "border-red-500 focus:ring-red-100" : ""}`}
                    value={form.draftDate}
                    onChange={(e) => {
                      set("draftDate", e.target.value);
                      if (errors.draftDate) setErrors(prev => ({ ...prev, draftDate: "" }));
                    }}
                  />
                  {errors.draftDate && <p className="text-red-500 text-[11px] mt-1">{errors.draftDate}</p>}
                </div>
                <div>
                  <label className={labelClasses}>On Board Date</label>
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

          {/* Sidebar - PDF Upload */}
          <div className="space-y-4">
            <PdfUploadSection
              pdf={pdf}
              onUpload={handlePdfUpload}
              onView={() => openPdf(false)}
              onDownload={() => openPdf(true)}
              onDownloadBlob={() => downloadImportPdf(id!, "draftBL")}
              label="Draft BL Reference PDF"
              onTextExtracted={setExtractedPdfText}
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
