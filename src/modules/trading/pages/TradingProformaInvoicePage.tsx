// src/modules/trading/pages/TradingProformaInvoicePage.tsx
//
// Step 3 of the Trading workflow.
// Reuses ProformaInvoiceFormPanel and ProformaInvoicePreview
// from src/modules/sales/components/ — no duplication.
//
// BE integration:
//   POST /api/v1/trading/proforma-invoices
//   Body: { inquiryId, quotationId, ...ProformaInvoiceForm }
//   On success: updates inquiry status to "pi_issued"

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Eye, FileText, Download, ArrowRight } from "lucide-react";
import { WorkflowStepper } from "../components/WorkflowStepper";
import { useTradingStore } from "../store/tradingStore";

// Reuse existing sales components
import { ProformaInvoiceFormPanel } from "@/modules/sales/components/ProformaInvoiceForm";
import { ProformaInvoicePreview } from "@/modules/sales/components/ProformaInvoicePreview";
import type { ProformaInvoiceForm } from "@/modules/sales/types";
import { EMPTY_PROFORMA } from "@/modules/sales/data/seed";

export default function TradingProformaInvoicePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const inquiryId = params.get("inquiryId") ?? "";

  const { inquiries, quotations, issuePIForInquiry } = useTradingStore();
  const inquiry = inquiries.find((i) => i.id === inquiryId);
  const quotation = quotations.find((q) => q.inquiryId === inquiryId);

  // Pre-fill form from inquiry + quotation data
  const [form, setForm] = useState<ProformaInvoiceForm>({
    ...EMPTY_PROFORMA,
    piNumber: `PI-${new Date().getFullYear()}-${String(
      Math.floor(Math.random() * 900) + 100
    )}`,
    buyerName: inquiry?.buyer ?? "",
    buyerAddress: "",
    buyerContact: inquiry?.email ?? "",
    sellerName: "FreightOS Trading Division",
    sellerAddress: "",
    sellerContact: "",
    portOfDischarge: inquiry?.destinationCountry ?? "",
    incoterms: quotation?.incoterms ?? "FOB",
    paymentTerms:
      quotation?.paymentTerms ?? "50% advance, 50% against B/L copy",
    currency: quotation?.currency ?? "USD",
    items: [
      {
        id: crypto.randomUUID(),
        description: inquiry?.product ?? "",
        quantity: String(inquiry?.quantity ?? 1),
        unit: inquiry?.unit ?? "MT",
        unitPrice: String(quotation?.unitPrice ?? ""),
      },
    ],
    notes: `Reference: ${inquiryId}`,
  });

  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");
  const [saving, setSaving] = useState(false);

  const handleIssue = () => {
    setSaving(true);
    // BE: POST /api/v1/trading/proforma-invoices
    // { inquiryId, quotationId: quotation?.id, ...form }
    try {
      issuePIForInquiry(inquiryId);
      navigate(`/trading/po/new?inquiryId=${inquiryId}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="rounded-[8px] bg-sky-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-sky-600">
              Trading · Step 3
            </span>
            <h1 className="mt-1.5 text-[26px] font-bold tracking-[-0.04em] text-slate-900">
              Proforma Invoice
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
              <Download className="h-4 w-4" /> Export PDF
            </Button>
            <Button onClick={handleIssue} disabled={saving}>
              {saving ? "Issuing..." : "Issue PI & Continue"}{" "}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <WorkflowStepper currentStatus="quoted" />

        {/* Mobile tab switcher */}
        <div className="flex gap-2 rounded-[16px] border border-slate-200 bg-white p-2 shadow-[0_8px_24px_rgba(22,31,54,0.05)] lg:hidden">
          {(
            [
              ["form", "Form", FileText],
              ["preview", "Preview", Eye],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setMobileTab(key as "form" | "preview")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-[12px] px-4 py-2.5 text-[14px] font-semibold transition ${
                mobileTab === key
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Split: form + preview */}
        <div className="grid gap-5 lg:grid-cols-2">
          <div className={mobileTab === "preview" ? "hidden lg:block" : ""}>
            <ProformaInvoiceFormPanel form={form} onChange={setForm} />
          </div>
          <div className={mobileTab === "form" ? "hidden lg:block" : ""}>
            <div className="lg:sticky lg:top-6">
              <div className="mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4 text-slate-400" />
                <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                  Live Preview
                </span>
              </div>
              <ProformaInvoicePreview form={form} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
