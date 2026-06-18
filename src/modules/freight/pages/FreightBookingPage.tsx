// src/modules/freight/pages/FreightBookingPage.tsx
// Step 3 — Booking
// Auto-fills from inquiry data (origin, destination, customer).
// Navigates to Shipment Creation (Step 4) on confirm booking.
//
// BE: POST /api/v1/freight/bookings

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useFreightStore } from "../store/freightStore";
import { ArrowRight } from "lucide-react";

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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </Label>
      {children}
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

export default function FreightBookingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const inquiryId = params.get("inquiryId") ?? "";

  const { inquiries, createBooking } = useFreightStore();
  const inquiry = inquiries.find((i) => i.id === inquiryId);

  const [form, setForm] = useState<FormData>({
    carrier: "",
    vesselFlight: "",
    voyageNumber: "",
    schedule: DEFAULT_BOOKING_SCHEDULE,
    bookingReference: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleConfirm = () => {
    if (!form.carrier || !form.bookingReference) {
      setError("Carrier and Booking Reference are required.");
      return;
    }
    setError(null);
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
            <Button onClick={handleConfirm} disabled={saving}>
              {saving ? "Confirming..." : "Confirm Booking"}{" "}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Inquiry summary */}
        {inquiry && (
          <div className="rounded-[12px] border border-emerald-100 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-700">
            <strong>{inquiry.customer}</strong> · {inquiry.commodity} ·{" "}
            {inquiry.origin} → {inquiry.destination} · {inquiry.mode}
          </div>
        )}

        {error && (
          <div className="rounded-[12px] border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
            {error}
          </div>
        )}

        <SectionCard title="Carrier & Vessel">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Carrier *">
              <Input
                value={form.carrier}
                onChange={(e) => set("carrier", e.target.value)}
                placeholder="MSC Lines"
                className="w-full"
              />
            </Field>
            <Field label="Booking Reference *">
              <Input
                value={form.bookingReference}
                onChange={(e) => set("bookingReference", e.target.value)}
                placeholder="MSC123456789"
                className="w-full"
              />
            </Field>
            <Field
              label={inquiry?.mode === "Air" ? "Flight No." : "Vessel Name"}
            >
              <Input
                value={form.vesselFlight}
                onChange={(e) => set("vesselFlight", e.target.value)}
                placeholder={inquiry?.mode === "Air" ? "PK-204" : "MSC Danit"}
                className="w-full"
              />
            </Field>
            <Field label="Voyage / Flight Number">
              <Input
                value={form.voyageNumber}
                onChange={(e) => set("voyageNumber", e.target.value)}
                placeholder="2025-WE-01"
                className="w-full"
              />
            </Field>
            <Field label="Scheduled Departure">
              <Input
                type="date"
                value={form.schedule}
                onChange={(e) => set("schedule", e.target.value)}
                className="w-full"
              />
            </Field>
          </div>
        </SectionCard>
      </div>
    </AppLayout>
  );
}
