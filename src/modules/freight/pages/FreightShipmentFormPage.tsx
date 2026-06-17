// src/modules/freight/pages/FreightShipmentFormPage.tsx
// Step 4 — Create Shipment Record
//
// BE: POST /api/v1/freight/shipments

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useFreightStore } from "../store/freightStore";

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

export default function FreightShipmentFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createShipment, inquiries } = useFreightStore();

  const prefillInquiryId = searchParams.get("inquiryId") ?? "";
  const prefillInquiry = inquiries.find((i) => i.id === prefillInquiryId);

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

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = () => {
    const shipment = createShipment(form);
    navigate(`/freight/shipment/${shipment.id}`);
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-5">
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

        {/* Link to inquiry */}
        <SectionCard title="Linked Inquiry">
          <Field label="Freight Inquiry ID">
            <select
              value={form.inquiryId}
              onChange={(e) => {
                const inq = inquiries.find((i) => i.id === e.target.value);
                setForm((f) => ({
                  ...f,
                  inquiryId: e.target.value,
                  customer: inq?.customer ?? f.customer,
                  origin: inq?.origin ?? f.origin,
                  destination: inq?.destination ?? f.destination,
                }));
              }}
              className="h-10 w-full rounded-[12px] border border-slate-200 bg-white px-3 text-[14px] text-slate-900 shadow-[0_4px_14px_rgba(22,31,54,0.03)] focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              <option value="">— Select inquiry —</option>
              {inquiries
                .filter((i) =>
                  ["booked", "quoted", "inquiry"].includes(i.status)
                )
                .map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.id} — {i.customer}
                  </option>
                ))}
            </select>
            {/* BE: GET /api/v1/freight/inquiries?status=booked,quoted */}
          </Field>
        </SectionCard>

        <SectionCard title="Shipment Details">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Customer">
              <Input
                value={form.customer}
                onChange={(e) => set("customer", e.target.value)}
                className="w-full"
              />
            </Field>
            <Field label="Carrier">
              <Input
                value={form.carrier}
                onChange={(e) => set("carrier", e.target.value)}
                placeholder="MSC Lines"
                className="w-full"
              />
            </Field>
            <Field label="Container Number">
              <Input
                value={form.containerNumber}
                onChange={(e) => set("containerNumber", e.target.value)}
                placeholder="MSCU1234567"
                className="w-full"
              />
            </Field>
            <div /> {/* spacer */}
            <Field label="Origin">
              <Input
                value={form.origin}
                onChange={(e) => set("origin", e.target.value)}
                placeholder="Port Qasim, Pakistan"
                className="w-full"
              />
            </Field>
            <Field label="Destination">
              <Input
                value={form.destination}
                onChange={(e) => set("destination", e.target.value)}
                placeholder="Jebel Ali, UAE"
                className="w-full"
              />
            </Field>
            <Field label="ETD (Estimated Departure)">
              <Input
                type="date"
                value={form.etd}
                onChange={(e) => set("etd", e.target.value)}
                className="w-full"
              />
            </Field>
            <Field label="ETA (Estimated Arrival)">
              <Input
                type="date"
                value={form.eta}
                onChange={(e) => set("eta", e.target.value)}
                className="w-full"
              />
            </Field>
          </div>
        </SectionCard>
      </div>
    </AppLayout>
  );
}
