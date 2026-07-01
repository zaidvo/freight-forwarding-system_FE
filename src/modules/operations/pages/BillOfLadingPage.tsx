// src/modules/operations/pages/BillOfLadingPage.tsx
import { useState } from "react";
import { AppLayout } from "@/app/layout/AppLayout";
import { Button } from "@/shared/components/ui/Button";
import { Download, Eye, FileText } from "lucide-react";
import { BillOfLadingFormPanel } from "../components/BillOfLadingForm";
import { BillOfLadingPreview } from "../components/BillOfLadingPreview";
import type { BillOfLadingForm } from "../types";
import { EMPTY_BILL_OF_LADING } from "../data/seed";

export default function BillOfLadingPage() {
  const [form, setForm] = useState<BillOfLadingForm>(EMPTY_BILL_OF_LADING);
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <span className="rounded-[8px] bg-blue-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Operations
            </span>
            <h1 className="mt-1.5 text-[26px] font-bold tracking-[-0.04em] text-slate-900">
              Bill of Lading
            </h1>
            <p className="mt-1 text-[14px] text-slate-500">
              Prepare the sea freight title document issued by the shipping
              line.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => window.print()}>
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            <Button onClick={() => alert("Saved (backend ready)")}>
              Save Draft
            </Button>
          </div>
        </div>

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
              onClick={() => setMobileTab(key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-[12px] px-4 py-2.5 text-[14px] font-semibold transition ${mobileTab === key ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className={mobileTab === "preview" ? "hidden lg:block" : ""}>
            <BillOfLadingFormPanel form={form} onChange={setForm} />
          </div>
          <div className={mobileTab === "form" ? "hidden lg:block" : ""}>
            <div className="lg:sticky lg:top-6">
              <div className="mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4 text-slate-400" />
                <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                  Live Preview
                </span>
              </div>
              <BillOfLadingPreview form={form} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
