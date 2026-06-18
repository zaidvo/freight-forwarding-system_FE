// src/modules/freight/pages/ShipmentDetailPage.tsx
//
// Unified shipment detail covering:
//   Step 5 — Documentation
//   Step 6 — Cargo Movement Tracking
//   Step 7 — Finance
//   Step 8 — Delivery
//   Step 9 — Shipment Closure
//
// BE integration:
//   GET  /api/v1/freight/shipments/:id     → load shipment
//   POST /api/v1/documents/upload          → file upload (MinIO)
//   PATCH /api/v1/freight/shipments/:id/status  → tracking update
//   POST /api/v1/freight/shipments/:id/invoice  → generate invoice
//   PATCH /api/v1/freight/shipments/:id/close   → close shipment

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Upload, CheckCircle, Lock, Clock } from "lucide-react";
import { useFreightStore } from "../store/freightStore";
import { FreightStatusBadge } from "../components/FreightStatusBadge";
import { TRACKING_SEQUENCE, FREIGHT_STATUS_LABELS } from "../data/seed";
import type { FreightStatus, FreightDocument } from "../types";

const TABS = ["tracking", "documents", "finance", "closure"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  tracking: "Tracking",
  documents: "Documents",
  finance: "Finance",
  closure: "Closure",
};

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
      <h3 className="mb-4 text-[13px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    shipments,
    updateTrackingStatus,
    uploadDocument,
    recordPayment,
    setFreightInvoice,
    closeShipment,
  } = useFreightStore();

  const shipment = shipments.find((s) => s.id === id);
  const [activeTab, setActiveTab] = useState<Tab>("tracking");
  const [trackingRemarks, setTrackingRemarks] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");

  if (!shipment) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
          Shipment not found.{" "}
          <button
            className="ml-2 text-blue-500 underline"
            onClick={() => navigate("/freight")}
          >
            Back
          </button>
        </div>
      </AppLayout>
    );
  }

  const isLocked = shipment.status === "completed";
  const currentTrackingIdx = TRACKING_SEQUENCE.indexOf(shipment.status);
  const nextStatus = TRACKING_SEQUENCE[currentTrackingIdx + 1] as
    | FreightStatus
    | undefined;

  // ── Tracking ──────────────────────────────────────────────────
  const handleTrackingUpdate = (status: FreightStatus) => {
    updateTrackingStatus(
      shipment.id,
      status,
      trackingRemarks || `Status updated to ${FREIGHT_STATUS_LABELS[status]}`
    );
    setTrackingRemarks("");
  };

  // ── Documents ────────────────────────────────────────────────
  const handleUpload = (doc: FreightDocument) => {
    // BE: POST /api/v1/documents/upload with FormData
    // For now simulate with a placeholder URL
    const fakeUrl = `#uploaded-${doc.type}-${doc.id}`;
    uploadDocument(shipment.id, doc.type, fakeUrl);
  };

  // ── Finance ──────────────────────────────────────────────────
  const outstanding =
    (shipment.freightInvoiceAmount ?? 0) - shipment.clientPayments;
  const profit = shipment.clientPayments - shipment.vendorCharges;

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <button
              onClick={() => navigate("/freight")}
              className="mb-1 text-[12px] text-slate-400 hover:text-slate-600"
            >
              ← Back to Freight
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-[26px] font-bold tracking-[-0.04em] text-slate-900">
                {shipment.id}
              </h1>
              <FreightStatusBadge status={shipment.status} />
              {isLocked && <Lock className="h-4 w-4 text-slate-400" />}
            </div>
            <p className="mt-1 text-[14px] text-slate-500">
              {shipment.customer} — {shipment.origin} → {shipment.destination}
            </p>
          </div>
        </div>

        {/* Shipment summary */}
        <div className="grid grid-cols-4 gap-3 rounded-[16px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(22,31,54,0.05)] text-[13px]">
          {[
            ["Carrier", shipment.carrier],
            ["Container", shipment.containerNumber || "—"],
            ["ETD", shipment.etd],
            ["ETA", shipment.eta],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                {label}
              </div>
              <div className="mt-0.5 font-semibold text-slate-800">{value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 rounded-[16px] border border-slate-200 bg-white p-2 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-[12px] px-4 py-2.5 text-[14px] font-semibold transition ${
                activeTab === tab
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* ── TRACKING TAB ──────────────────────────────────────── */}
        {activeTab === "tracking" && (
          <div className="space-y-4">
            {/* Timeline */}
            <SectionCard title="Shipment Timeline">
              <div className="space-y-3">
                {shipment.timeline.map((event, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-100">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      </div>
                      {i < shipment.timeline.length - 1 && (
                        <div className="mt-1 w-0.5 flex-1 bg-slate-200" />
                      )}
                    </div>
                    <div className="pb-3">
                      <div className="flex items-center gap-2">
                        <FreightStatusBadge status={event.status} />
                        <span className="text-[11px] text-slate-400">
                          {event.user}
                        </span>
                      </div>
                      <div className="mt-1 text-[13px] text-slate-600">
                        {event.remarks}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="h-3 w-3" />
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Update Status */}
            {!isLocked && nextStatus && (
              <SectionCard title="Update Status">
                <div className="space-y-3">
                  <div>
                    <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Remarks
                    </Label>
                    <Input
                      value={trackingRemarks}
                      onChange={(e) => setTrackingRemarks(e.target.value)}
                      placeholder="Add remarks for this status update..."
                      className="w-full"
                    />
                    {/* BE: Also captures user from JWT token server-side */}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TRACKING_SEQUENCE.slice(
                      currentTrackingIdx + 1,
                      currentTrackingIdx + 3
                    ).map((status) => (
                      <Button
                        key={status}
                        onClick={() =>
                          handleTrackingUpdate(status as FreightStatus)
                        }
                      >
                        Mark: {FREIGHT_STATUS_LABELS[status]}
                      </Button>
                    ))}
                  </div>
                </div>
              </SectionCard>
            )}
          </div>
        )}

        {/* ── DOCUMENTS TAB ─────────────────────────────────────── */}
        {activeTab === "documents" && (
          <SectionCard title="Shipment Documents">
            <div className="space-y-2">
              {/* Client Documents */}
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-blue-500">
                Client Documents
              </div>
              {shipment.documents
                .filter((d) =>
                  [
                    "commercial_invoice",
                    "packing_list",
                    "coo",
                    "insurance",
                  ].includes(d.type)
                )
                .map((doc) => (
                  <DocumentRow
                    key={doc.id}
                    doc={doc}
                    locked={isLocked}
                    onUpload={() => handleUpload(doc)}
                  />
                ))}

              {/* Forwarder Documents */}
              <div className="mb-3 mt-5 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-600">
                Forwarder Documents
              </div>
              {shipment.documents
                .filter(
                  (d) =>
                    ![
                      "commercial_invoice",
                      "packing_list",
                      "coo",
                      "insurance",
                    ].includes(d.type)
                )
                .map((doc) => (
                  <DocumentRow
                    key={doc.id}
                    doc={doc}
                    locked={isLocked}
                    onUpload={() => handleUpload(doc)}
                  />
                ))}
            </div>
          </SectionCard>
        )}

        {/* ── FINANCE TAB ───────────────────────────────────────── */}
        {activeTab === "finance" && (
          <div className="space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                {
                  label: "Freight Invoice",
                  value: shipment.freightInvoiceAmount ?? 0,
                  color: "text-blue-600",
                },
                {
                  label: "Client Payments",
                  value: shipment.clientPayments,
                  color: "text-emerald-600",
                },
                {
                  label: "Vendor Charges",
                  value: shipment.vendorCharges,
                  color: "text-rose-600",
                },
                {
                  label: "Profit",
                  value: profit,
                  color: profit >= 0 ? "text-emerald-600" : "text-rose-600",
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="rounded-[14px] border border-slate-200 bg-white p-4 shadow-[0_4px_14px_rgba(22,31,54,0.04)]"
                >
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    {label}
                  </div>
                  <div
                    className={`mt-2 text-[22px] font-bold tracking-[-0.03em] ${color}`}
                  >
                    USD {value.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {!isLocked && (
              <SectionCard title="Record Transactions">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <Label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Freight Invoice Amount (USD)
                      {/* BE: POST /api/v1/freight/shipments/:id/invoice */}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={invoiceAmount}
                        onChange={(e) => setInvoiceAmount(e.target.value)}
                        placeholder="0.00"
                        className="flex-1"
                      />
                      <Button
                        onClick={() => {
                          if (invoiceAmount)
                            setFreightInvoice(
                              shipment.id,
                              Number(invoiceAmount)
                            );
                        }}
                      >
                        Set Invoice
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Record Client Payment (USD)
                      {/* BE: POST /api/v1/freight/shipments/:id/payments */}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0.00"
                        className="flex-1"
                      />
                      <Button
                        variant="secondary"
                        onClick={() => {
                          if (paymentAmount) {
                            recordPayment(shipment.id, Number(paymentAmount));
                            setPaymentAmount("");
                          }
                        }}
                      >
                        Record
                      </Button>
                    </div>
                  </div>
                </div>
                {outstanding > 0 && (
                  <div className="mt-4 rounded-[12px] border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-700">
                    Outstanding: USD {outstanding.toLocaleString()} — awaiting
                    client payment.
                  </div>
                )}
              </SectionCard>
            )}
          </div>
        )}

        {/* ── CLOSURE TAB ───────────────────────────────────────── */}
        {activeTab === "closure" && (
          <SectionCard title="Shipment Closure">
            {isLocked ? (
              <div className="flex items-center gap-3 rounded-[12px] bg-emerald-50 p-4 text-emerald-700">
                <CheckCircle className="h-5 w-5" />
                <div>
                  <div className="font-semibold">Shipment Closed</div>
                  <div className="text-[13px]">
                    All records are locked and archived.
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-[14px] text-slate-600">
                  Closing this shipment will lock all records and archive
                  documents. This action cannot be undone.
                </p>
                <div className="rounded-[12px] bg-slate-50 p-4 text-[13px] text-slate-600 space-y-1">
                  <div>✓ Checklist before closing:</div>
                  <div
                    className={
                      shipment.status === "delivered"
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }
                  >
                    {shipment.status === "delivered" ? "✓" : "⚠"} Status:{" "}
                    {FREIGHT_STATUS_LABELS[shipment.status]}
                  </div>
                  <div
                    className={
                      shipment.documents.every((d) => d.fileUrl)
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }
                  >
                    {shipment.documents.every((d) => d.fileUrl) ? "✓" : "⚠"} All
                    documents uploaded
                  </div>
                  <div
                    className={
                      outstanding === 0 ? "text-emerald-600" : "text-amber-600"
                    }
                  >
                    {outstanding === 0 ? "✓" : "⚠"} Outstanding: USD{" "}
                    {outstanding.toLocaleString()}
                  </div>
                </div>
                {/* BE: PATCH /api/v1/freight/shipments/:id/close */}
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (
                      confirm(
                        "Close this shipment? This action cannot be undone."
                      )
                    ) {
                      closeShipment(shipment.id);
                    }
                  }}
                >
                  <Lock className="h-4 w-4" />
                  Close & Archive Shipment
                </Button>
              </div>
            )}
          </SectionCard>
        )}
      </div>
    </AppLayout>
  );
}

// ─── Document Row ────────────────────────────────────────────────
function DocumentRow({
  doc,
  locked,
  onUpload,
}: {
  doc: FreightDocument;
  locked: boolean;
  onUpload: () => void;
}) {
  const uploaded = !!doc.fileUrl;

  return (
    <div className="flex items-center justify-between rounded-[12px] border border-slate-100 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <div
          className={`grid h-8 w-8 place-items-center rounded-[8px] ${
            uploaded ? "bg-emerald-100" : "bg-slate-200"
          }`}
        >
          {uploaded ? (
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          ) : (
            <Upload className="h-4 w-4 text-slate-400" />
          )}
        </div>
        <div>
          <div className="text-[13px] font-semibold text-slate-900">
            {doc.label}
          </div>
          {uploaded && doc.uploadedAt && (
            <div className="text-[11px] text-slate-400">
              v{doc.version} · Uploaded{" "}
              {new Date(doc.uploadedAt).toLocaleDateString()} by{" "}
              {doc.uploadedBy}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {uploaded && (
          <a
            href={doc.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-[8px] border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
          >
            View
          </a>
        )}
        {!locked && (
          <button
            type="button"
            onClick={onUpload}
            className="rounded-[8px] border border-blue-200 bg-blue-50 px-3 py-1.5 text-[12px] font-medium text-blue-600 hover:bg-blue-100"
          >
            {/* BE: Opens file picker → POST /api/v1/documents/upload → MinIO */}
            {uploaded ? "Replace" : "Upload"}
          </button>
        )}
      </div>
    </div>
  );
}
