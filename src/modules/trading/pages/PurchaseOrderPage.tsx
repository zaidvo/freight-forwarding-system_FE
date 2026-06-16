// src/modules/trading/pages/PurchaseOrderPage.tsx
// Step 4 — Customer submits Purchase Order
//
// BE integration:
//   POST /api/v1/trading/purchase-orders
//   File upload: POST /api/v1/uploads (returns URL) — currently placeholder

import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { WorkflowStepper } from "../components/WorkflowStepper";
import { useTradingStore } from "../store/tradingStore";
import { Upload, ArrowRight, FileCheck } from "lucide-react";

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

export default function PurchaseOrderPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const inquiryId = params.get("inquiryId") ?? "";

  const { inquiries, recordPO } = useTradingStore();
  const inquiry = inquiries.find((i) => i.id === inquiryId);

  const [poNumber, setPoNumber] = useState("");
  const [poDate, setPoDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
    // BE: Upload file to POST /api/v1/uploads, get back URL
    // For now just store filename as placeholder
  };

  const handleRecord = () => {
    if (!poNumber) {
      setError("PO Number is required.");
      return;
    }
    setError(null);
    setSaving(true);
    // BE: POST /api/v1/trading/purchase-orders
    try {
      recordPO({
        piId: "", // BE will resolve from inquiryId
        inquiryId,
        poNumber,
        poDate,
        attachmentUrl: fileName ?? undefined, // BE: replace with actual upload URL
        customerNotes: notes,
      });
      navigate(`/trading/deal/new?inquiryId=${inquiryId}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="rounded-[8px] bg-sky-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-sky-600">
              Trading · Step 4
            </span>
            <h1 className="mt-1.5 text-[26px] font-bold tracking-[-0.04em] text-slate-900">
              Purchase Order
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
            <Button onClick={handleRecord} disabled={saving}>
              {saving ? "Recording..." : "Record PO"}{" "}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <WorkflowStepper currentStatus="pi_issued" />

        {/* Inquiry ref */}
        {inquiry && (
          <div className="rounded-[12px] border border-blue-100 bg-blue-50 px-4 py-3 text-[13px] text-blue-700">
            <strong>{inquiry.buyer}</strong> · {inquiry.product} ·{" "}
            {inquiry.quantity.toLocaleString()} {inquiry.unit}
          </div>
        )}

        {error && (
          <div className="rounded-[12px] border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
            {error}
          </div>
        )}

        <SectionCard title="Purchase Order Details">
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                PO Number <span className="text-rose-400">*</span>
              </Label>
              <Input
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="PO-2025-001"
                className="w-full"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                PO Date
              </Label>
              <Input
                type="date"
                value={poDate}
                onChange={(e) => setPoDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Customer Notes
              </Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any notes from customer..."
                className="w-full rounded-[12px] border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-slate-900 shadow-[0_4px_14px_rgba(22,31,54,0.03)] placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>
        </SectionCard>

        {/* File upload */}
        <SectionCard title="PO Attachment">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.png"
            onChange={handleFileChange}
            className="hidden"
          />
          {fileName ? (
            <div className="flex items-center gap-3 rounded-[12px] border border-emerald-200 bg-emerald-50 px-4 py-3">
              <FileCheck className="h-5 w-5 text-emerald-500" />
              <div>
                <div className="text-[13px] font-semibold text-emerald-800">
                  {fileName}
                </div>
                <div className="text-[11px] text-emerald-600">
                  {/* BE: File will be uploaded to MinIO/storage on form submit */}
                  Ready to upload
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFileName(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="ml-auto text-[12px] text-emerald-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-3 rounded-[14px] border-2 border-dashed border-slate-200 bg-slate-50 py-8 text-slate-400 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-500"
            >
              <Upload className="h-7 w-7" />
              <div className="text-[13px] font-semibold">
                Click to upload PO document
              </div>
              <div className="text-[12px]">PDF, Word, or Image — max 10MB</div>
              <div className="text-[11px] text-slate-300">
                {/* BE: File stored in MinIO via POST /api/v1/uploads */}
                File will be stored securely
              </div>
            </button>
          )}
        </SectionCard>
      </div>
    </AppLayout>
  );
}
