// src/modules/trading/pages/QuotationPage.tsx
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Label } from "@/shared/components/ui/Label";
import { WorkflowStepper } from "../components/WorkflowStepper";
import { useTradingStore } from "../store/tradingStore";
import type { Quotation } from "../types";
import { ArrowRight, Printer, Edit2 } from "lucide-react";

const INCOTERMS = [
  "EXW",
  "FCA",
  "CPT",
  "CIP",
  "DAP",
  "DPU",
  "DDP",
  "FAS",
  "FOB",
  "CFR",
  "CIF",
];
const PAYMENT_TERMS = [
  "100% advance",
  "50% advance, 50% against B/L copy",
  "30% advance, 70% against documents",
  "Letter of Credit (L/C)",
  "Documents against Payment (D/P)",
  "Net 30 days",
];

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full"
      />
    </div>
  );
}

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

export default function QuotationPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const inquiryId = params.get("inquiryId") ?? "";

  const { inquiries, quotations, createQuotation } = useTradingStore();
  const inquiry = inquiries.find((i) => i.id === inquiryId);
  const existing = quotations.find((q) => q.inquiryId === inquiryId);

  // If a quotation already exists, start in view mode; otherwise edit mode.
  const [isEditing, setIsEditing] = useState(!existing);

  const [form, setForm] = useState<
    Omit<Quotation, "id" | "status" | "auditTrail" | "createdAt">
  >({
    inquiryId,
    customer: existing?.customer ?? inquiry?.buyer ?? "",
    product: existing?.product ?? inquiry?.product ?? "",
    quantity: existing?.quantity ?? inquiry?.quantity ?? 0,
    unitPrice: existing?.unitPrice ?? 0,
    currency: existing?.currency ?? "USD",
    incoterms: existing?.incoterms ?? "FOB",
    paymentTerms: existing?.paymentTerms ?? "50% advance, 50% against B/L copy",
    validUntil: existing?.validUntil ?? "",
    remarks: existing?.remarks ?? "",
  });
  const [saving, setSaving] = useState(false);

  const set = (key: string, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const total = form.quantity * form.unitPrice;

  const handleGenerate = () => {
    setSaving(true);
    // BE: POST /api/v1/trading/quotations
    try {
      createQuotation({
        ...form,
        quantity: Number(form.quantity),
        unitPrice: Number(form.unitPrice),
      });
      navigate(`/trading/pi/new?inquiryId=${inquiryId}`);
    } finally {
      setSaving(false);
    }
  };

  // ── Read-only view ─────────────────────────────────────────────
  if (existing && !isEditing) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-4xl space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="rounded-[8px] bg-sky-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-sky-600">
                Trading · Step 2
              </span>
              <h1 className="mt-1.5 text-[26px] font-bold tracking-[-0.04em] text-slate-900">
                Quotation
              </h1>
              <p className="mt-1 text-[13px] text-slate-500">
                <span className="font-mono font-semibold text-blue-600">
                  {existing.id}
                </span>{" "}
                · Issued for inquiry{" "}
                <span className="font-mono font-semibold text-blue-600">
                  {inquiryId}
                </span>
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => navigate("/trading")}>
                Back
              </Button>
              <Button variant="ghost" onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print
              </Button>
              <Button variant="ghost" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4" /> Edit
              </Button>
              <Button
                onClick={() =>
                  navigate(`/trading/pi/new?inquiryId=${inquiryId}`)
                }
              >
                Issue PI <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <WorkflowStepper currentStatus="inquiry_received" />

          {/* Read-only quotation card */}
          <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
            <div className="mb-4 text-[13px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Quotation Details
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
              {(
                [
                  ["Customer", existing.customer],
                  ["Product", existing.product],
                  ["Quantity", existing.quantity.toLocaleString()],
                  [
                    "Unit Price",
                    `${existing.currency} ${existing.unitPrice.toLocaleString()}`,
                  ],
                  [
                    "Total Value",
                    `${existing.currency} ${(existing.quantity * existing.unitPrice).toLocaleString()}`,
                  ],
                  ["Incoterms", existing.incoterms],
                  ["Payment Terms", existing.paymentTerms],
                  ["Valid Until", existing.validUntil || "—"],
                ] as [string, string][]
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between border-b border-slate-100 py-2 last:border-0"
                >
                  <span className="text-slate-500">{label}</span>
                  <span className="font-semibold text-slate-900">{value}</span>
                </div>
              ))}
            </div>
            {existing.remarks && (
              <div className="mt-4 rounded-[10px] bg-slate-50 px-3 py-2.5 text-[13px] text-slate-600">
                {existing.remarks}
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

  // ── Edit / Create form ─────────────────────────────────────────
  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="rounded-[8px] bg-sky-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-sky-600">
              Trading · Step 2
            </span>
            <h1 className="mt-1.5 text-[26px] font-bold tracking-[-0.04em] text-slate-900">
              Quotation
            </h1>
            {inquiryId && (
              <p className="mt-1 text-[13px] text-slate-500">
                For inquiry{" "}
                <span className="font-mono font-semibold text-blue-600">
                  {inquiryId}
                </span>
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate("/trading")}>
              Back
            </Button>
            <Button variant="ghost" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print
            </Button>
            {existing && (
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel Edit
              </Button>
            )}
            <Button onClick={handleGenerate} disabled={saving}>
              {saving ? "Generating..." : "Generate & Issue PI"}{" "}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <WorkflowStepper currentStatus="inquiry_received" />

        {/* Inquiry ref */}
        {inquiry && (
          <div className="rounded-[12px] border border-blue-100 bg-blue-50 px-4 py-3 text-[13px] text-blue-700">
            Sourced from inquiry <strong>{inquiry.id}</strong> — {inquiry.buyer}{" "}
            · {inquiry.product}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard title="Customer & Product">
            <div className="space-y-4">
              <Field
                label="Customer"
                value={form.customer}
                onChange={(v) => set("customer", v)}
              />
              <Field
                label="Product"
                value={form.product}
                onChange={(v) => set("product", v)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Quantity"
                  value={String(form.quantity)}
                  onChange={(v) => set("quantity", v)}
                  type="number"
                />
                <div>
                  <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Currency
                  </Label>
                  <select
                    value={form.currency}
                    onChange={(e) => set("currency", e.target.value)}
                    className="h-10 w-full rounded-[12px] border border-slate-200 bg-white px-3 text-[14px] text-slate-900 shadow-[0_4px_14px_rgba(22,31,54,0.03)] focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  >
                    {["USD", "PKR", "EUR", "GBP"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Field
                label="Unit Price"
                value={String(form.unitPrice)}
                onChange={(v) => set("unitPrice", v)}
                type="number"
                placeholder="0.00"
              />
            </div>
          </SectionCard>

          <SectionCard title="Terms">
            <div className="space-y-4">
              <div>
                <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Incoterms
                </Label>
                <select
                  value={form.incoterms}
                  onChange={(e) => set("incoterms", e.target.value)}
                  className="h-10 w-full rounded-[12px] border border-slate-200 bg-white px-3 text-[14px] text-slate-900 shadow-[0_4px_14px_rgba(22,31,54,0.03)] focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  {INCOTERMS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Payment Terms
                </Label>
                <select
                  value={form.paymentTerms}
                  onChange={(e) => set("paymentTerms", e.target.value)}
                  className="h-10 w-full rounded-[12px] border border-slate-200 bg-white px-3 text-[14px] text-slate-900 shadow-[0_4px_14px_rgba(22,31,54,0.03)] focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  {PAYMENT_TERMS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <Field
                label="Valid Until"
                value={form.validUntil}
                onChange={(v) => set("validUntil", v)}
                type="date"
              />
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Remarks">
          <textarea
            value={form.remarks}
            onChange={(e) => set("remarks", e.target.value)}
            rows={3}
            placeholder="Any additional remarks..."
            className="w-full rounded-[12px] border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-slate-900 shadow-[0_4px_14px_rgba(22,31,54,0.03)] placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
        </SectionCard>

        {/* Total */}
        {total > 0 && (
          <div className="flex justify-end">
            <div className="rounded-[16px] border border-slate-200 bg-white px-6 py-4 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
              <div className="text-[12px] text-slate-400">Total Value</div>
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
