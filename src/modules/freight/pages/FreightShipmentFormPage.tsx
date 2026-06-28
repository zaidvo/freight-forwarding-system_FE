// src/modules/freight/pages/FreightShipmentFormPage.tsx
// Step 4 — Create Shipment Record
//
// V3: Fields pre-filled from a Path 1 (trading deal) inquiry are read-only.
// V7: Field-level red highlighting on submit with empty required fields.
//
// BE: POST /api/v1/freight/shipments

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Lock } from "lucide-react";
import { useFreightStore } from "../store/freightStore";
import {
  validateShipmentForm,
  type ShipmentFormErrors,
} from "../lib/validation";

// ─── Types ────────────────────────────────────────────────────────
type FormData = {
  inquiryId: string;
  containerNumber: string;
  etd: string;
  eta: string;
  origin: string;
  destination: string;
  carrier: string;
  customer: string;
};

// ─── Sub-components ───────────────────────────────────────────────
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

function FieldWrapper({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </Label>
      {children}
      {error && (
        <p className="mt-1 text-[11px] font-medium text-rose-500">{error}</p>
      )}
    </div>
  );
}

/** Read-only display used for Path 1 locked fields (V3). */
function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
        <Lock className="h-3 w-3 text-slate-300" />
      </Label>
      <div className="flex h-10 items-center rounded-[12px] border border-slate-200 bg-slate-50 px-3 text-[14px] text-slate-600 select-none cursor-not-allowed">
        {value || <span className="text-slate-400">—</span>}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function FreightShipmentFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createShipment, inquiries } = useFreightStore();

  const prefillInquiryId = searchParams.get("inquiryId") ?? "";
  const prefillInquiry = inquiries.find((i) => i.id === prefillInquiryId);

  // V3: is this shipment originating from a confirmed trading deal?
  const isFromTradingDeal = !!prefillInquiry?.fromTradingDealId;

  const [form, setForm] = useState<FormData>({
    inquiryId: prefillInquiryId,
    containerNumber: "",
    etd: new Date().toISOString().split("T")[0],
    eta: "",
    origin: prefillInquiry?.origin ?? "",
    destination: prefillInquiry?.destination ?? "",
    carrier: "",
    customer: prefillInquiry?.customer ?? "",
  });
  const [errors, setErrors] = useState<ShipmentFormErrors>({});

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    // Clear error on change
    if (errors[k as keyof ShipmentFormErrors]) {
      setErrors((e) => ({ ...e, [k]: undefined }));
    }
  };

  const handleCreate = () => {
    const validationErrors = validateShipmentForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const shipment = createShipment(form);
    navigate(`/freight/shipment/${shipment.id}`);
  };

  // For the inquiry selector — when inquiry changes, update origin/destination/customer
  // but only if NOT from a trading deal (trading deal fields are locked).
  const handleInquiryChange = (inquiryId: string) => {
    const inq = inquiries.find((i) => i.id === inquiryId);
    setForm((f) => ({
      ...f,
      inquiryId,
      customer: inq?.customer ?? f.customer,
      origin: inq?.origin ?? f.origin,
      destination: inq?.destination ?? f.destination,
    }));
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <span className="rounded-[8px] bg-emerald-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-600">
              Freight — Step 4
            </span>
            <h1 className="mt-1.5 text-[26px] font-bold tracking-[-0.04em] text-slate-900">
              Create Shipment
            </h1>
            <p className="mt-1 text-[14px] text-slate-500">
              Create the shipment record to begin cargo movement tracking.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate("/freight")}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Shipment</Button>
          </div>
        </div>

        {/* V3: Path 1 notice */}
        {isFromTradingDeal && (
          <div className="flex items-center gap-3 rounded-[12px] border border-sky-200 bg-sky-50 px-4 py-3 text-[13px] text-sky-700">
            <Lock className="h-4 w-4 shrink-0 text-sky-500" />
            <span>
              This shipment was created from Trading Deal{" "}
              <strong>{prefillInquiry?.fromTradingDealId}</strong>. Client,
              origin, and destination are pre-filled and locked.
            </span>
          </div>
        )}

        {/* Linked Inquiry */}
        <SectionCard title="Linked Inquiry">
          <FieldWrapper label="Freight Inquiry ID">
            <select
              value={form.inquiryId}
              onChange={(e) => handleInquiryChange(e.target.value)}
              disabled={isFromTradingDeal}
              className="h-10 w-full rounded-[12px] border border-slate-200 bg-white px-3 text-[14px] text-slate-900 shadow-[0_4px_14px_rgba(22,31,54,0.03)] focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
            >
              <option value="">— Select inquiry —</option>
              {inquiries
                .filter((i) =>
                  ["booked", "quoted", "inquiry"].includes(i.status),
                )
                .map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.id} — {i.customer}
                    {i.fromTradingDealId
                      ? ` (Deal ${i.fromTradingDealId})`
                      : ""}
                  </option>
                ))}
            </select>
          </FieldWrapper>
        </SectionCard>

        {/* Shipment Details */}
        <SectionCard title="Shipment Details">
          <div className="grid grid-cols-2 gap-4">
            {/* V3: Customer locked for Path 1 */}
            {isFromTradingDeal ? (
              <ReadonlyField label="Customer" value={form.customer} />
            ) : (
              <FieldWrapper label="Customer" error={errors.customer}>
                <Input
                  value={form.customer}
                  onChange={(e) => set("customer", e.target.value)}
                  className={`w-full ${errors.customer ? "border-rose-400 ring-2 ring-rose-100 focus:border-rose-400 focus:ring-rose-100" : ""}`}
                />
              </FieldWrapper>
            )}
            <FieldWrapper label="Carrier *" error={errors.carrier}>
              <Input
                value={form.carrier}
                onChange={(e) => set("carrier", e.target.value)}
                placeholder="MSC Lines"
                className={`w-full ${errors.carrier ? "border-rose-400 ring-2 ring-rose-100 focus:border-rose-400 focus:ring-rose-100" : ""}`}
              />
            </FieldWrapper>
            <FieldWrapper
              label="Container Number *"
              error={errors.containerNumber}
            >
              <Input
                value={form.containerNumber}
                onChange={(e) => set("containerNumber", e.target.value)}
                placeholder="MSCU1234567"
                className={`w-full ${errors.containerNumber ? "border-rose-400 ring-2 ring-rose-100 focus:border-rose-400 focus:ring-rose-100" : ""}`}
              />
            </FieldWrapper>
            <div /> {/* spacer */}
            {/* V3: Origin locked for Path 1 */}
            {isFromTradingDeal ? (
              <ReadonlyField label="Origin" value={form.origin} />
            ) : (
              <FieldWrapper label="Origin *" error={errors.origin}>
                <Input
                  value={form.origin}
                  onChange={(e) => set("origin", e.target.value)}
                  placeholder="Port Qasim, Pakistan"
                  className={`w-full ${errors.origin ? "border-rose-400 ring-2 ring-rose-100 focus:border-rose-400 focus:ring-rose-100" : ""}`}
                />
              </FieldWrapper>
            )}
            {/* V3: Destination locked for Path 1 */}
            {isFromTradingDeal ? (
              <ReadonlyField label="Destination" value={form.destination} />
            ) : (
              <FieldWrapper label="Destination *" error={errors.destination}>
                <Input
                  value={form.destination}
                  onChange={(e) => set("destination", e.target.value)}
                  placeholder="Jebel Ali, UAE"
                  className={`w-full ${errors.destination ? "border-rose-400 ring-2 ring-rose-100 focus:border-rose-400 focus:ring-rose-100" : ""}`}
                />
              </FieldWrapper>
            )}
            <FieldWrapper
              label="ETD (Estimated Departure) *"
              error={errors.etd}
            >
              <Input
                type="date"
                value={form.etd}
                onChange={(e) => set("etd", e.target.value)}
                className={`w-full ${errors.etd ? "border-rose-400 ring-2 ring-rose-100 focus:border-rose-400 focus:ring-rose-100" : ""}`}
              />
            </FieldWrapper>
            <FieldWrapper label="ETA (Estimated Arrival) *" error={errors.eta}>
              <Input
                type="date"
                value={form.eta}
                onChange={(e) => set("eta", e.target.value)}
                className={`w-full ${errors.eta ? "border-rose-400 ring-2 ring-rose-100 focus:border-rose-400 focus:ring-rose-100" : ""}`}
              />
            </FieldWrapper>
          </div>
        </SectionCard>
      </div>
    </AppLayout>
  );
}
