// src/modules/freight/pages/FreightQuotationPage.tsx
// Step 2 — Freight Quotation
// Auto-fills carrier/charges from inquiry data.
// Navigates to Booking (Step 3) on save.
//
// BE: POST /api/v1/freight/quotations

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
  carrierRates: string;
  localCharges: string;
  handlingCharges: string;
  customsCharges: string;
  margin: string;
  currency: "USD" | "PKR" | "EUR";
};

export default function FreightQuotationPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const inquiryId = params.get("inquiryId") ?? "";

  const { inquiries, createQuotation } = useFreightStore();
  const inquiry = inquiries.find((i) => i.id === inquiryId);

  const [form, setForm] = useState<FormData>({
    carrierRates: "",
    localCharges: "",
    handlingCharges: "",
    customsCharges: "",
    margin: "",
    currency: "USD",
  });
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const n = (v: string) => parseFloat(v) || 0;
  const total =
    n(form.carrierRates) +
    n(form.localCharges) +
    n(form.handlingCharges) +
    n(form.customsCharges) +
    n(form.margin);

  const handleSave = () => {
    if (!inquiryId) return;
    setSaving(true);
    try {
      createQuotation({
        inquiryId,
        carrierRates: n(form.carrierRates),
        localCharges: n(form.localCharges),
        handlingCharges: n(form.handlingCharges),
        customsCharges: n(form.customsCharges),
        margin: n(form.margin),
        totalPrice: total,
        currency: form.currency,
      });
      navigate(`/freight/booking/new?inquiryId=${inquiryId}`);
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
              Freight · Step 2
            </span>
            <h1 className="mt-1.5 text-[26px] font-bold tracking-[-0.04em] text-slate-900">
              Freight Quotation
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
            <Button onClick={handleSave} disabled={saving || !inquiryId}>
              {saving ? "Saving..." : "Send Quotation"}{" "}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Inquiry summary */}
        {inquiry && (
          <div className="rounded-[12px] border border-emerald-100 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-700">
            <strong>{inquiry.customer}</strong> · {inquiry.commodity} ·{" "}
            {inquiry.origin} → {inquiry.destination} · {inquiry.mode} ·{" "}
            {inquiry.weight} kg / {inquiry.volume} CBM
          </div>
        )}

        <SectionCard title="Charges Breakdown">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Carrier Rates (USD)">
              <Input
                type="number"
                min="0"
                value={form.carrierRates}
                onChange={(e) => set("carrierRates", e.target.value)}
                placeholder="0.00"
                className="w-full"
              />
            </Field>
            <Field label="Local Charges (USD)">
              <Input
                type="number"
                min="0"
                value={form.localCharges}
                onChange={(e) => set("localCharges", e.target.value)}
                placeholder="0.00"
                className="w-full"
              />
            </Field>
            <Field label="Handling Charges (USD)">
              <Input
                type="number"
                min="0"
                value={form.handlingCharges}
                onChange={(e) => set("handlingCharges", e.target.value)}
                placeholder="0.00"
                className="w-full"
              />
            </Field>
            <Field label="Customs Charges (USD)">
              <Input
                type="number"
                min="0"
                value={form.customsCharges}
                onChange={(e) => set("customsCharges", e.target.value)}
                placeholder="0.00"
                className="w-full"
              />
            </Field>
            <Field label="Margin / Profit (USD)">
              <Input
                type="number"
                min="0"
                value={form.margin}
                onChange={(e) => set("margin", e.target.value)}
                placeholder="0.00"
                className="w-full"
              />
            </Field>
            <Field label="Currency">
              <select
                value={form.currency}
                onChange={(e) =>
                  set("currency", e.target.value as FormData["currency"])
                }
                className="h-10 w-full rounded-[12px] border border-slate-200 bg-white px-3 text-[14px] text-slate-900 shadow-[0_4px_14px_rgba(22,31,54,0.03)] focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                <option>USD</option>
                <option>PKR</option>
                <option>EUR</option>
              </select>
            </Field>
          </div>
        </SectionCard>

        {/* Total */}
        {total > 0 && (
          <div className="flex justify-end">
            <div className="rounded-[16px] border border-slate-200 bg-white px-6 py-4 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
              <div className="text-[12px] text-slate-400">
                Total Quotation Price
              </div>
              <div className="text-[28px] font-bold tracking-[-0.04em] text-slate-900">
                {form.currency}{" "}
                {total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
