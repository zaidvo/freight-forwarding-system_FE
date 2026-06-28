// src/modules/freight/pages/FreightBookingPage.tsx
// Step 3 — Booking
//
// V2: Blocks confirmation if no freight quotation has been issued for this inquiry.
// V7: Field-level red highlighting on required fields.
//
// BE: POST /api/v1/freight/bookings

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useFreightStore } from "../store/freightStore";
import { validateBookingForm, type BookingFormErrors } from "../lib/validation";

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

type FormData = {
  carrier: string;
  vesselFlight: string;
  voyageNumber: string;
  schedule: string;
  bookingReference: string;
};

const DEFAULT_BOOKING_SCHEDULE = new Date(Date.now() + 7 * 86400000)
  .toISOString()
  .split("T")[0];

// ─── Page ─────────────────────────────────────────────────────────
export default function FreightBookingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const inquiryId = params.get("inquiryId") ?? "";

  const { inquiries, quotations, createBooking } = useFreightStore();
  const inquiry = inquiries.find((i) => i.id === inquiryId);

  // V2: check for an approved quotation for this inquiry
  const hasQuotation = quotations.some((q) => q.inquiryId === inquiryId);

  const [form, setForm] = useState<FormData>({
    carrier: "",
    vesselFlight: "",
    voyageNumber: "",
    schedule: DEFAULT_BOOKING_SCHEDULE,
    bookingReference: "",
  });
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as keyof BookingFormErrors]) {
      setErrors((e) => ({ ...e, [k]: undefined }));
    }
  };

  const handleConfirm = () => {
    const validationErrors = validateBookingForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSaving(true);
    try {
      createBooking({ inquiryId, ...form });
      navigate(`/freight/shipment/new?inquiryId=${inquiryId}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="rounded-[8px] bg-emerald-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-600">
              Freight · Step 3
            </span>
            <h1 className="mt-1.5 text-[26px] font-bold tracking-[-0.04em] text-slate-900">
              Booking
            </h1>
            {inquiryId && (
              <p className="mt-1 text-[13px] text-slate-500">
                For inquiry{" "}
                <span className="font-mono font-semibold text-emerald-600">
                  {inquiryId}
                </span>
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate("/freight")}>
              Back
            </Button>
            {/* V2: disabled when no quotation exists */}
            <Button
              onClick={handleConfirm}
              disabled={saving || !hasQuotation}
              title={
                !hasQuotation
                  ? "A freight quotation must be issued first."
                  : undefined
              }
            >
              {saving ? "Confirming..." : "Confirm Booking"}{" "}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* V2: Missing quotation warning */}
        {!hasQuotation && (
          <div className="flex items-start gap-3 rounded-[12px] border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <div>
              <span className="font-semibold">No quotation found.</span> A
              freight quotation must be issued for this inquiry before booking
              can be confirmed.{" "}
              <button
                type="button"
                onClick={() =>
                  navigate(`/freight/quotation/new?inquiryId=${inquiryId}`)
                }
                className="font-semibold text-amber-700 underline hover:text-amber-900"
              >
                Create quotation →
              </button>
            </div>
          </div>
        )}

        {/* Inquiry summary */}
        {inquiry && (
          <div className="rounded-[12px] border border-emerald-100 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-700">
            <strong>{inquiry.customer}</strong> · {inquiry.commodity} ·{" "}
            {inquiry.origin} → {inquiry.destination} · {inquiry.mode}
          </div>
        )}

        <SectionCard title="Carrier & Vessel">
          <div className="grid grid-cols-2 gap-4">
            <FieldWrapper label="Carrier *" error={errors.carrier}>
              <Input
                value={form.carrier}
                onChange={(e) => set("carrier", e.target.value)}
                placeholder="MSC Lines"
                className={`w-full ${errors.carrier ? "border-rose-400 ring-2 ring-rose-100 focus:border-rose-400 focus:ring-rose-100" : ""}`}
              />
            </FieldWrapper>

            <FieldWrapper
              label="Booking Reference *"
              error={errors.bookingReference}
            >
              <Input
                value={form.bookingReference}
                onChange={(e) => set("bookingReference", e.target.value)}
                placeholder="MSC123456789"
                className={`w-full ${errors.bookingReference ? "border-rose-400 ring-2 ring-rose-100 focus:border-rose-400 focus:ring-rose-100" : ""}`}
              />
            </FieldWrapper>

            <div>
              <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                {inquiry?.mode === "Air" ? "Flight No." : "Vessel Name"}
              </Label>
              <Input
                value={form.vesselFlight}
                onChange={(e) => set("vesselFlight", e.target.value)}
                placeholder={inquiry?.mode === "Air" ? "PK-204" : "MSC Danit"}
                className="w-full"
              />
            </div>

            <div>
              <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Voyage / Flight Number
              </Label>
              <Input
                value={form.voyageNumber}
                onChange={(e) => set("voyageNumber", e.target.value)}
                placeholder="2025-WE-01"
                className="w-full"
              />
            </div>

            <div>
              <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Scheduled Departure
              </Label>
              <Input
                type="date"
                value={form.schedule}
                onChange={(e) => set("schedule", e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </SectionCard>
      </div>
    </AppLayout>
  );
}
