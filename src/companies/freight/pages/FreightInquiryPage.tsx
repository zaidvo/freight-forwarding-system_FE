// src/modules/freight/pages/FreightInquiryPage.tsx
// Step 1 — Manual freight inquiry creation (Path 2)
// Path 1 (from trading deal) uses createInquiryFromDeal() in freightStore
//
// BE: POST /api/v1/freight/inquiries

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Label } from "@/shared/components/ui/Label";
import { useFreightStore } from "../store/freightStore";
import type { FreightInquiry, FreightMode } from "../types";

type FormData = Omit<
  FreightInquiry,
  "id" | "status" | "timeline" | "createdAt"
>;

const EMPTY: FormData = {
  customer: "",
  origin: "",
  destination: "",
  mode: "Sea",
  commodity: "",
  weight: 0,
  volume: 0,
  remarks: "",
};

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

export default function FreightInquiryPage() {
  const navigate = useNavigate();
  const { createInquiry } = useFreightStore();
  const [form, setForm] = useState<FormData>(EMPTY);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    createInquiry(form);
    navigate("/freight");
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <span className="rounded-[8px] bg-emerald-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-600">
              Freight — Step 1
            </span>
            <h1 className="mt-1.5 text-[26px] font-bold tracking-[-0.04em] text-slate-900">
              New Freight Inquiry
            </h1>
            <p className="mt-1 text-[14px] text-slate-500">
              Create a new external client freight inquiry.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate("/freight")}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Submit Inquiry</Button>
          </div>
        </div>

        <SectionCard title="Client & Route">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Customer">
              <Input
                value={form.customer}
                onChange={(e) => set("customer", e.target.value)}
                placeholder="Al-Razi Pharma Ltd"
                className="w-full"
              />
            </Field>
            <Field label="Mode of Transport">
              <select
                value={form.mode}
                onChange={(e) => set("mode", e.target.value as FreightMode)}
                className="h-10 w-full rounded-[12px] border border-slate-200 bg-white px-3 text-[14px] text-slate-900 shadow-[0_4px_14px_rgba(22,31,54,0.03)] focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                <option>Sea</option>
                <option>Air</option>
                <option>Land</option>
              </select>
            </Field>
            <Field label="Origin">
              <Input
                value={form.origin}
                onChange={(e) => set("origin", e.target.value)}
                placeholder="Karachi, Pakistan"
                className="w-full"
              />
            </Field>
            <Field label="Destination">
              <Input
                value={form.destination}
                onChange={(e) => set("destination", e.target.value)}
                placeholder="Dubai, UAE"
                className="w-full"
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Cargo Details">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Commodity">
              <Input
                value={form.commodity}
                onChange={(e) => set("commodity", e.target.value)}
                placeholder="Pharmaceutical Products"
                className="w-full"
              />
            </Field>
            <Field label="Weight (KG)">
              <Input
                type="number"
                value={form.weight}
                onChange={(e) => set("weight", Number(e.target.value))}
                className="w-full"
              />
            </Field>
            <Field label="Volume (CBM)">
              <Input
                type="number"
                value={form.volume}
                onChange={(e) => set("volume", Number(e.target.value))}
                className="w-full"
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Remarks">
          <textarea
            value={form.remarks}
            onChange={(e) => set("remarks", e.target.value)}
            rows={3}
            placeholder="Special handling requirements, temp-controlled, hazmat, etc."
            className="w-full rounded-[12px] border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-slate-900 shadow-[0_4px_14px_rgba(22,31,54,0.03)] placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
        </SectionCard>
      </div>
    </AppLayout>
  );
}
