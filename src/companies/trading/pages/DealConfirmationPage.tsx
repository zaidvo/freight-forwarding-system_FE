// src/modules/trading/pages/DealConfirmationPage.tsx
// Step 5: Verify PO → Approve/Reject Deal
// Step 6: Freight decision (delegated to ShipmentDecisionDialog)
//
// BE integration:
//   POST /api/v1/trading/deals          (confirm)
//   PATCH /api/v1/trading/deals/:id/reject
//   PATCH /api/v1/trading/deals/:id/freight-decision

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { Button } from "@/shared/components/ui/Button";
import { WorkflowStepper } from "../components/WorkflowStepper";
import { StatusBadge } from "../components/StatusBadge";
import { ShipmentDecisionDialog } from "../components/ShipmentDecisionDialog";
import { useTradingStore } from "../store/tradingStore";
import { useFreightStore } from "@/companies/freight/store/freightStore";
import { CheckCircle, XCircle, AlertTriangle, Clock, Ship } from "lucide-react";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-2.5 text-[13px] last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

export default function DealConfirmationPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const inquiryId = params.get("inquiryId") ?? "";

  const {
    inquiries,
    quotations,
    purchaseOrders,
    deals,
    confirmDeal,
    rejectDeal,
    handleFreightDecision,
  } = useTradingStore();

  const inquiry = inquiries.find((i) => i.id === inquiryId);
  const quotation = quotations.find((q) => q.inquiryId === inquiryId);
  const po = purchaseOrders.find((p) => p.inquiryId === inquiryId);
  const deal = deals.find((d) => d.inquiryId === inquiryId);

  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [showDecision, setShowDecision] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleConfirm = () => {
    if (!po) return;
    setSaving(true);
    // BE: POST /api/v1/trading/deals
    try {
      confirmDeal(po.id, inquiryId);
      setShowDecision(true);
    } finally {
      setSaving(false);
    }
  };

  const handleReject = () => {
    if (!po || !rejectReason) return;
    // BE: PATCH /api/v1/trading/deals/:id/reject
    rejectDeal(po.id, rejectReason);
    setShowReject(false);
    navigate("/trading");
  };

  const handleFreightDecide = (freightByUs: boolean) => {
    if (!deal) return;
    // BE: PATCH /api/v1/trading/deals/:id/freight-decision
    handleFreightDecision(deal.id, freightByUs);
    setShowDecision(false);
    if (freightByUs) {
      // Auto-create freight inquiry from deal with full pre-filled data,
      // then skip directly to shipment creation (quotation/booking not
      // required when the trade deal already has pricing).
      const { createInquiryFromDeal } = useFreightStore.getState();
      const freightInquiry = createInquiryFromDeal({
        customer: deal.customer,
        product: deal.product,
        quantity: deal.quantity,
        origin: "Pakistan", // default origin — editable in shipment form
        destination: inquiry?.destinationCountry ?? "",
        tradingDealId: deal.id,
      });
      // Navigate to shipment form pre-filled from this inquiry.
      // Path 1 fields (customer, origin, destination) will be read-only there.
      navigate(`/freight/shipment/new?inquiryId=${freightInquiry.id}`);
    } else {
      navigate("/trading");
    }
  };

  const confirmedDeal = deal ?? deals.find((d) => d.inquiryId === inquiryId);

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="rounded-[8px] bg-sky-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-sky-600">
              Trading · Step 5
            </span>
            <h1 className="mt-1.5 text-[26px] font-bold tracking-[-0.04em] text-slate-900">
              Deal Confirmation
            </h1>
            {inquiryId && (
              <p className="mt-1 text-[13px] text-slate-500">
                Inquiry{" "}
                <span className="font-mono font-semibold text-blue-600">
                  {inquiryId}
                </span>
              </p>
            )}
          </div>
          <Button variant="secondary" onClick={() => navigate("/trading")}>
            Back
          </Button>
        </div>

        <WorkflowStepper
          currentStatus={confirmedDeal?.status ?? "po_received"}
        />

        {/* Summary card */}
        <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
          <h3 className="mb-4 text-[13px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Deal Summary
          </h3>
          {inquiry && (
            <div>
              <InfoRow label="Buyer" value={inquiry.buyer} />
              <InfoRow
                label="Product"
                value={`${
                  inquiry.product
                } — ${inquiry.quantity.toLocaleString()} ${inquiry.unit}`}
              />
              <InfoRow label="Destination" value={inquiry.destinationCountry} />
              {quotation && (
                <>
                  <InfoRow
                    label="Unit Price"
                    value={`${
                      quotation.currency
                    } ${quotation.unitPrice.toLocaleString()}`}
                  />
                  <InfoRow
                    label="Total Value"
                    value={`${quotation.currency} ${(
                      quotation.unitPrice * inquiry.quantity
                    ).toLocaleString()}`}
                  />
                  <InfoRow label="Incoterms" value={quotation.incoterms} />
                  <InfoRow
                    label="Payment Terms"
                    value={quotation.paymentTerms}
                  />
                </>
              )}
              {po && (
                <>
                  <InfoRow label="PO Number" value={po.poNumber} />
                  <InfoRow label="PO Date" value={po.poDate} />
                </>
              )}
            </div>
          )}
        </div>

        {/* Status / Actions */}
        {!confirmedDeal && (
          <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
            <h3 className="mb-4 text-[13px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Management Review
            </h3>

            {!showReject ? (
              <div className="flex gap-3">
                <Button onClick={handleConfirm} disabled={saving || !po}>
                  <CheckCircle className="h-4 w-4" />
                  {saving ? "Confirming..." : "Approve Deal"}
                </Button>
                <Button variant="ghost" onClick={() => setShowReject(true)}>
                  <XCircle className="h-4 w-4" />
                  Reject Deal
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[13px] text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  Provide a reason for rejection
                </div>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="Reason for rejection..."
                  className="w-full rounded-[12px] border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-slate-900 shadow-[0_4px_14px_rgba(22,31,54,0.03)] placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
                />
                <div className="flex gap-3">
                  <Button
                    variant="danger"
                    onClick={handleReject}
                    disabled={!rejectReason}
                  >
                    Confirm Rejection
                  </Button>
                  <Button variant="ghost" onClick={() => setShowReject(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Deal confirmed state */}
        {confirmedDeal && (
          <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="h-6 w-6 text-emerald-500" />
              <div>
                <div className="font-bold text-emerald-800">Deal Confirmed</div>
                <div className="text-[12px] text-emerald-600">
                  Deal ID:{" "}
                  <span className="font-mono font-bold">
                    {confirmedDeal.id}
                  </span>
                </div>
              </div>
              <StatusBadge status={confirmedDeal.status} />
            </div>

            {confirmedDeal.status === "deal_confirmed" &&
              !confirmedDeal.freightHandledByUs && (
                <Button onClick={() => setShowDecision(true)}>
                  <Ship className="h-4 w-4" /> Proceed to Freight Decision
                </Button>
              )}

            {confirmedDeal.status === "shipment_created" && (
              <Button onClick={() => navigate("/freight")}>
                View Freight Shipment
              </Button>
            )}

            {confirmedDeal.status === "trading_completed" && (
              <div className="text-[13px] text-emerald-700 font-semibold">
                Trading completed — external freight.
              </div>
            )}
          </div>
        )}

        {/* Audit trail */}
        {inquiry && inquiry.auditTrail.length > 0 && (
          <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
            <h3 className="mb-4 text-[13px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Activity Log
            </h3>
            <div className="space-y-3">
              {inquiry.auditTrail.map((entry, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100">
                    <Clock className="h-3 w-3 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-slate-800">
                      {entry.action}
                    </div>
                    <div className="text-[12px] text-slate-400">
                      {entry.user} ·{" "}
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step 6 Decision */}
      <ShipmentDecisionDialog
        open={showDecision}
        deal={confirmedDeal ?? null}
        onClose={() => setShowDecision(false)}
        onDecide={handleFreightDecide}
      />
    </AppLayout>
  );
}
