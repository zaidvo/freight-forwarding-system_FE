// src/modules/operations/components/BillOfLadingForm.tsx
import { useCallback } from "react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import type { BillOfLadingForm as BillOfLadingFormType } from "../types";
import { CONTAINER_TYPES } from "../data/seed";

type Props = {
  form: BillOfLadingFormType;
  onChange: (f: BillOfLadingFormType) => void;
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

function FieldInput(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {props.label}
      </Label>
      <Input
        type={props.type ?? "text"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder ?? ""}
        className="w-full"
      />
    </div>
  );
}

function TextareaInput(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {props.label}
      </Label>
      <textarea
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        rows={props.rows ?? 2}
        className="w-full rounded-[12px] border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-slate-900 shadow-[0_4px_14px_rgba(22,31,54,0.03)] placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

export function BillOfLadingFormPanel({ form, onChange }: Props) {
  const set = useCallback(
    <K extends keyof BillOfLadingFormType>(
      key: K,
      value: BillOfLadingFormType[K],
    ) => {
      onChange({ ...form, [key]: value });
    },
    [form, onChange],
  );

  return (
    <div className="space-y-4">
      <SectionCard title="Document Reference">
        <div className="grid grid-cols-2 gap-4">
          <FieldInput
            label="B/L Number"
            value={form.blNumber}
            onChange={(v) => set("blNumber", v)}
          />
          <FieldInput
            label="Date"
            value={form.date}
            onChange={(v) => set("date", v)}
            type="date"
          />
          <FieldInput
            label="Booking Reference"
            value={form.bookingRef}
            onChange={(v) => set("bookingRef", v)}
          />
        </div>
      </SectionCard>

      <SectionCard title="Shipper / Exporter">
        <div className="space-y-3">
          <FieldInput
            label="Company Name"
            value={form.shipperName}
            onChange={(v) => set("shipperName", v)}
          />
          <TextareaInput
            label="Address"
            value={form.shipperAddress}
            onChange={(v) => set("shipperAddress", v)}
          />
        </div>
      </SectionCard>

      <SectionCard title="Consignee">
        <div className="space-y-3">
          <FieldInput
            label="Company Name"
            value={form.consigneeName}
            onChange={(v) => set("consigneeName", v)}
          />
          <TextareaInput
            label="Address"
            value={form.consigneeAddress}
            onChange={(v) => set("consigneeAddress", v)}
          />
        </div>
      </SectionCard>

      <SectionCard title="Notify Party">
        <div className="space-y-3">
          <FieldInput
            label="Company Name"
            value={form.notifyPartyName}
            onChange={(v) => set("notifyPartyName", v)}
          />
          <TextareaInput
            label="Address"
            value={form.notifyPartyAddress}
            onChange={(v) => set("notifyPartyAddress", v)}
          />
        </div>
      </SectionCard>

      <SectionCard title="Vessel Details">
        <div className="grid grid-cols-2 gap-4">
          <FieldInput
            label="Vessel Name"
            value={form.vesselName}
            onChange={(v) => set("vesselName", v)}
          />
          <FieldInput
            label="Voyage No."
            value={form.voyageNo}
            onChange={(v) => set("voyageNo", v)}
          />
          <FieldInput
            label="Flag / Country"
            value={form.flag}
            onChange={(v) => set("flag", v)}
          />
          <div>
            <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Container Type
            </Label>
            <select
              value={form.containerType}
              onChange={(e) => set("containerType", e.target.value)}
              className="h-10 w-full rounded-[12px] border border-slate-200 bg-white px-3 text-[14px] text-slate-900 shadow-[0_4px_14px_rgba(22,31,54,0.03)] focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              {CONTAINER_TYPES.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Ports">
        <div className="grid grid-cols-2 gap-4">
          <FieldInput
            label="Place of Receipt"
            value={form.placeOfReceipt}
            onChange={(v) => set("placeOfReceipt", v)}
          />
          <FieldInput
            label="Port of Loading"
            value={form.portOfLoading}
            onChange={(v) => set("portOfLoading", v)}
          />
          <FieldInput
            label="Port of Discharge"
            value={form.portOfDischarge}
            onChange={(v) => set("portOfDischarge", v)}
          />
          <FieldInput
            label="Place of Delivery"
            value={form.placeOfDelivery}
            onChange={(v) => set("placeOfDelivery", v)}
          />
        </div>
      </SectionCard>

      <SectionCard title="Cargo Details">
        <div className="grid grid-cols-2 gap-4">
          <FieldInput
            label="Container No."
            value={form.containerNo}
            onChange={(v) => set("containerNo", v)}
          />
          <FieldInput
            label="Seal No."
            value={form.sealNo}
            onChange={(v) => set("sealNo", v)}
          />
          <FieldInput
            label="HS Code"
            value={form.hsCode}
            onChange={(v) => set("hsCode", v)}
            placeholder="e.g. 6109.10"
          />
          <FieldInput
            label="No. of Packages"
            value={form.noOfPackages}
            onChange={(v) => set("noOfPackages", v)}
          />
          <FieldInput
            label="Gross Weight (kg)"
            value={form.grossWeight}
            onChange={(v) => set("grossWeight", v)}
          />
          <FieldInput
            label="Measurement (m³)"
            value={form.measurement}
            onChange={(v) => set("measurement", v)}
          />
          <div className="col-span-2">
            <TextareaInput
              label="Marks & Numbers"
              value={form.marksNumbers}
              onChange={(v) => set("marksNumbers", v)}
            />
          </div>
          <div className="col-span-2">
            <TextareaInput
              label="Cargo Description"
              value={form.description}
              onChange={(v) => set("description", v)}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Freight">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Freight Terms
            </Label>
            <div className="flex gap-3">
              {(["prepaid", "collect"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("freightTerms", t)}
                  className={`flex-1 rounded-[12px] border py-2.5 text-[13px] font-semibold capitalize transition ${form.freightTerms === t ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <FieldInput
            label="Freight Amount (USD)"
            value={form.freightAmount}
            onChange={(v) => set("freightAmount", v)}
          />
        </div>
      </SectionCard>

      <SectionCard title="Remarks">
        <TextareaInput
          label="Remarks"
          value={form.remarks}
          onChange={(v) => set("remarks", v)}
          rows={3}
        />
      </SectionCard>
    </div>
  );
}
