// src/modules/freight/pages/ShipmentDetailPage.tsx
//
// Tabs: Logistics · Tracking · Documents · Finance · Closure
//
// Validation implemented:
//   V4 — Document gate before advancing to out_for_delivery / delivered
//   V5 — Hard block on closure when outstanding payments exist
//   V6 — Full read-only lock when status === "completed"
//   Action #1  — Logistics tab (editable shipment fields)
//   Action #5  — Smart trading deal back-link banner
//   Action #12 — Vendor charge recording input in Finance tab
//
// BE integration:
//   GET  /api/v1/freight/shipments/:id
//   PATCH /api/v1/freight/shipments/:id          → saveLogistics
//   POST /api/v1/documents/upload                → uploadDocument (MinIO)
//   PATCH /api/v1/freight/shipments/:id/status   → updateTrackingStatus
//   POST /api/v1/freight/shipments/:id/invoice   → setFreightInvoice
//   PATCH /api/v1/freight/shipments/:id/close    → closeShipment

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Label } from "@/shared/components/ui/Label";
import {
  Upload,
  CheckCircle,
  Lock,
  Clock,
  AlertTriangle,
  ExternalLink,
  Ship,
} from "lucide-react";
import { useFreightStore } from "../store/freightStore";
import { FreightStatusBadge } from "../components/FreightStatusBadge";
import { TRACKING_SEQUENCE, FREIGHT_STATUS_LABELS } from "../data/seed";
import type { FreightStatus, FreightDocument } from "../types";
import {
  canAdvanceToDelivery,
  canCloseShipment,
  DELIVERY_GATED_STATUSES,
} from "../lib/validation";

// ─── Tab config ──────────────────────────────────────────────────
const TABS = [
  "logistics",
  "tracking",
  "documents",
  "finance",
  "closure",
] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  logistics: "Logistics",
  tracking: "Tracking",
  documents: "Documents",
  finance: "Finance",
  closure: "Closure",
};

// ─── Shared section card ──────────────────────────────────────────
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

// ─── Readonly display field (used in locked state) ────────────────
function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </div>
      <div className="rounded-[10px] border border-slate-100 bg-slate-50 px-3 py-2 text-[13px] font-medium text-slate-700">
        {value || "—"}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────
export default function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    shipments,
    inquiries,
    updateTrackingStatus,
    uploadDocument,
    recordPayment,
    recordVendorCharge,
    setFreightInvoice,
    closeShipment,
    updateShipmentLogistics,
  } = useFreightStore();

  const shipment = shipments.find((s) => s.id === id);
  const [activeTab, setActiveTab] = useState<Tab>("logistics");

  // Finance inputs
  const [paymentAmount, setPaymentAmount] = useState("");
  const [vendorAmount, setVendorAmount] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");

  // Tracking
  const [trackingRemarks, setTrackingRemarks] = useState("");
  const [trackingError, setTrackingError] = useState<string | null>(null);

  // Logistics edit state
  const [logistics, setLogistics] = useState(() =>
    shipment
      ? {
          containerNumber: shipment.containerNumber,
          carrier: shipment.carrier,
          etd: shipment.etd,
          eta: shipment.eta,
          origin: shipment.origin,
          destination: shipment.destination,
        }
      : {},
  );
  const [logisticsSaved, setLogisticsSaved] = useState(false);

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

  // V4: check doc gate for delivery-gated statuses
  const handleTrackingUpdate = (status: FreightStatus) => {
    if (DELIVERY_GATED_STATUSES.has(status)) {
      const { ok, missing } = canAdvanceToDelivery(shipment);
      if (!ok) {
        setTrackingError(
          `Cannot advance to "${FREIGHT_STATUS_LABELS[status]}". Missing required documents: ${missing.join(", ")}.`,
        );
        return;
      }
    }
    setTrackingError(null);
    updateTrackingStatus(
      shipment.id,
      status,
      trackingRemarks || `Status updated to ${FREIGHT_STATUS_LABELS[status]}`,
    );
    setTrackingRemarks("");
  };

  const handleUpload = (doc: FreightDocument) => {
    // Trigger a hidden file input for this document type
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      // BE: POST /api/v1/documents/upload with FormData → returns MinIO URL
      // For now, use a local object URL so the "View" link is functional
      const localUrl = URL.createObjectURL(file);
      uploadDocument(shipment.id, doc.type, localUrl);
    };
    input.click();
  };

  // V5: closure validation
  const closureCheck = canCloseShipment(shipment);

  // Finance derived
  const outstanding =
    (shipment.freightInvoiceAmount ?? 0) - shipment.clientPayments;
  const profit = shipment.clientPayments - shipment.vendorCharges;

  // Action #5: find linked trading inquiry for back-link
  const linkedInquiry = inquiries.find((i) => i.id === shipment.inquiryId);
  const tradingDealId = linkedInquiry?.fromTradingDealId;

  const handleSaveLogistics = () => {
    // BE: PATCH /api/v1/freight/shipments/:id
    updateShipmentLogistics(
      shipment.id,
      logistics as Parameters<typeof updateShipmentLogistics>[1],
    );
    setLogisticsSaved(true);
    setTimeout(() => setLogisticsSaved(false), 2000);
  };

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

        {/* Action #5: smart back-link to trading deal */}
        {tradingDealId && (
          <div className="flex items-center gap-3 rounded-[12px] border border-sky-200 bg-sky-50 px-4 py-3 text-[13px] text-sky-700">
            <Ship className="h-4 w-4 shrink-0 text-sky-500" />
            <span>
              This shipment was created from{" "}
              <strong>Trading Deal {tradingDealId}</strong>.
            </span>
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/trading/deal/new?inquiryId=${linkedInquiry?.id ?? ""}`,
                )
              }
              className="ml-auto flex items-center gap-1 rounded-[8px] border border-sky-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-sky-700 transition hover:bg-sky-100"
            >
              View Deal <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Quick summary bar */}
        <div className="grid grid-cols-4 gap-3 rounded-[16px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(22,31,54,0.05)] text-[13px]">
          {(
            [
              ["Carrier", shipment.carrier],
              ["Container", shipment.containerNumber || "—"],
              ["ETD", shipment.etd],
              ["ETA", shipment.eta],
            ] as [string, string][]
          ).map(([label, value]) => (
            <div key={label}>
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                {label}
              </div>
              <div className="mt-0.5 font-semibold text-slate-800">{value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto rounded-[16px] border border-slate-200 bg-white p-2 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 rounded-[12px] px-4 py-2.5 text-[14px] font-semibold transition ${
                activeTab === tab
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* ── LOGISTICS TAB (Action #1) ────────────────────────── */}
        {activeTab === "logistics" && (
          <SectionCard title="Shipment Details">
            {isLocked ? (
              <div className="grid grid-cols-2 gap-4">
                <ReadonlyField
                  label="Container Number"
                  value={shipment.containerNumber}
                />
                <ReadonlyField label="Carrier" value={shipment.carrier} />
                <ReadonlyField label="Origin" value={shipment.origin} />
                <ReadonlyField
                  label="Destination"
                  value={shipment.destination}
                />
                <ReadonlyField label="ETD" value={shipment.etd} />
                <ReadonlyField label="ETA" value={shipment.eta} />
              </div>
            ) : (
              <>
                {/* V3 notice if from trading deal */}
                {tradingDealId && (
                  <div className="mb-4 flex items-center gap-2 rounded-[10px] border border-sky-100 bg-sky-50 px-3 py-2 text-[12px] text-sky-600">
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                    Customer, origin and destination are locked — sourced from
                    trading deal.
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "containerNumber", label: "Container Number" },
                    { key: "carrier", label: "Carrier" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        {label}
                      </Label>
                      <Input
                        value={(logistics as Record<string, string>)[key] ?? ""}
                        onChange={(e) =>
                          setLogistics((l) => ({ ...l, [key]: e.target.value }))
                        }
                        className="w-full"
                      />
                    </div>
                  ))}
                  {/* V3: origin/destination read-only when from trading deal */}
                  {tradingDealId ? (
                    <>
                      <ReadonlyField
                        label="Origin"
                        value={
                          (logistics as Record<string, string>).origin ?? ""
                        }
                      />
                      <ReadonlyField
                        label="Destination"
                        value={
                          (logistics as Record<string, string>).destination ??
                          ""
                        }
                      />
                    </>
                  ) : (
                    <>
                      {["origin", "destination"].map((key) => (
                        <div key={key}>
                          <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 capitalize">
                            {key}
                          </Label>
                          <Input
                            value={
                              (logistics as Record<string, string>)[key] ?? ""
                            }
                            onChange={(e) =>
                              setLogistics((l) => ({
                                ...l,
                                [key]: e.target.value,
                              }))
                            }
                            className="w-full"
                          />
                        </div>
                      ))}
                    </>
                  )}
                  {[
                    {
                      key: "etd",
                      label: "ETD (Estimated Departure)",
                      type: "date",
                    },
                    {
                      key: "eta",
                      label: "ETA (Estimated Arrival)",
                      type: "date",
                    },
                  ].map(({ key, label, type }) => (
                    <div key={key}>
                      <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        {label}
                      </Label>
                      <Input
                        type={type}
                        value={(logistics as Record<string, string>)[key] ?? ""}
                        onChange={(e) =>
                          setLogistics((l) => ({ ...l, [key]: e.target.value }))
                        }
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <Button onClick={handleSaveLogistics}>Save Changes</Button>
                  {logisticsSaved && (
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600">
                      <CheckCircle className="h-3.5 w-3.5" /> Saved
                    </span>
                  )}
                </div>
              </>
            )}
          </SectionCard>
        )}

        {/* ── TRACKING TAB ────────────────────────────────────── */}
        {activeTab === "tracking" && (
          <div className="space-y-4">
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

            {/* Update Status — hidden when locked */}
            {!isLocked && currentTrackingIdx < TRACKING_SEQUENCE.length - 1 && (
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
                  </div>
                  {/* V4: show doc gate error */}
                  {trackingError && (
                    <div className="flex items-start gap-2 rounded-[10px] border border-rose-200 bg-rose-50 px-3 py-2.5 text-[12px] text-rose-700">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                      {trackingError}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {TRACKING_SEQUENCE.slice(
                      currentTrackingIdx + 1,
                      currentTrackingIdx + 3,
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

        {/* ── DOCUMENTS TAB ────────────────────────────────────── */}
        {activeTab === "documents" && (
          <SectionCard title="Shipment Documents">
            <div className="space-y-2">
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
                  ].includes(d.type),
                )
                .map((doc) => (
                  <DocumentRow
                    key={doc.id}
                    doc={doc}
                    locked={isLocked}
                    onUpload={() => handleUpload(doc)}
                  />
                ))}

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
                    ].includes(d.type),
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

        {/* ── FINANCE TAB ──────────────────────────────────────── */}
        {activeTab === "finance" && (
          <div className="space-y-4">
            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {(
                [
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
                ] as { label: string; value: number; color: string }[]
              ).map(({ label, value, color }) => (
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
                <div className="grid grid-cols-3 gap-5">
                  {/* Set invoice */}
                  <div className="space-y-2">
                    <Label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Freight Invoice (USD)
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
                              Number(invoiceAmount),
                            );
                        }}
                      >
                        Set
                      </Button>
                    </div>
                  </div>
                  {/* Record client payment */}
                  <div className="space-y-2">
                    <Label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Client Payment (USD)
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
                  {/* Action #12: vendor charge input */}
                  <div className="space-y-2">
                    <Label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Vendor Charge (USD)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={vendorAmount}
                        onChange={(e) => setVendorAmount(e.target.value)}
                        placeholder="0.00"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        onClick={() => {
                          if (vendorAmount) {
                            recordVendorCharge(
                              shipment.id,
                              Number(vendorAmount),
                            );
                            setVendorAmount("");
                          }
                        }}
                      >
                        Add
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

        {/* ── CLOSURE TAB ──────────────────────────────────────── */}
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
                  Closing this shipment will lock all records. This action
                  cannot be undone.
                </p>

                {/* Pre-closure checklist */}
                <div className="rounded-[12px] bg-slate-50 p-4 text-[13px] space-y-2">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Pre-Closure Checklist
                  </div>
                  {/* Status check */}
                  <div
                    className={
                      shipment.status === "delivered"
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }
                  >
                    {shipment.status === "delivered" ? "✓" : "⚠"} Status:{" "}
                    {FREIGHT_STATUS_LABELS[shipment.status]}
                    {shipment.status !== "delivered" && " — must be Delivered"}
                  </div>
                  {/* Payments check */}
                  <div
                    className={
                      outstanding === 0 ? "text-emerald-600" : "text-rose-600"
                    }
                  >
                    {outstanding === 0 ? "✓" : "✗"} Payments:{" "}
                    {outstanding === 0
                      ? "Fully cleared"
                      : `USD ${outstanding.toLocaleString()} outstanding`}
                  </div>
                  {/* Documents check */}
                  {(() => {
                    const { reasons } = canCloseShipment(shipment);
                    const docReason = reasons.find((r) =>
                      r.startsWith("Missing doc"),
                    );
                    return (
                      <div
                        className={
                          !docReason ? "text-emerald-600" : "text-amber-600"
                        }
                      >
                        {!docReason ? "✓" : "⚠"} Documents:{" "}
                        {docReason ?? "All required documents uploaded"}
                      </div>
                    );
                  })()}
                </div>

                {/* V5: show all blocking reasons */}
                {!closureCheck.ok && (
                  <div className="space-y-1.5 rounded-[12px] border border-rose-200 bg-rose-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-rose-600">
                      <AlertTriangle className="h-4 w-4" />
                      Cannot close shipment:
                    </div>
                    {closureCheck.reasons.map((r, i) => (
                      <div key={i} className="pl-6 text-[12px] text-rose-700">
                        • {r}
                      </div>
                    ))}
                  </div>
                )}

                {/* V5: button disabled when blockers exist */}
                <Button
                  variant="secondary"
                  disabled={!closureCheck.ok}
                  onClick={() => {
                    if (
                      confirm(
                        "Close this shipment? This action cannot be undone.",
                      )
                    ) {
                      closeShipment(shipment.id);
                    }
                  }}
                  title={
                    !closureCheck.ok
                      ? "Resolve all checklist items before closing."
                      : undefined
                  }
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

// ─── Document Row ─────────────────────────────────────────────────
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
          className={`grid h-8 w-8 place-items-center rounded-[8px] ${uploaded ? "bg-emerald-100" : "bg-slate-200"}`}
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
            {uploaded ? "Replace" : "Upload"}
          </button>
        )}
      </div>
    </div>
  );
}
