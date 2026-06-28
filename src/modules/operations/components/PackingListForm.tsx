// src/modules/operations/components/PackingListForm.tsx
import { useCallback } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Label } from "@/shared/components/ui/Label";
import { Plus, Trash2 } from "lucide-react";
import type {
  PackingListForm as PackingListFormType,
  PackageRow,
} from "../types";

type Props = {
  form: PackingListFormType;
  onChange: (f: PackingListFormType) => void;
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
  className?: string;
}) {
  return (
    <div className={props.className}>
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
  placeholder?: string;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {props.label}
      </Label>
      <textarea
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder ?? ""}
        rows={props.rows ?? 2}
        className="w-full rounded-[12px] border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-slate-900 shadow-[0_4px_14px_rgba(22,31,54,0.03)] placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

export function PackingListFormPanel({ form, onChange }: Props) {
  const set = useCallback(
    <K extends keyof PackingListFormType>(
      key: K,
      value: PackingListFormType[K],
    ) => {
      onChange({ ...form, [key]: value });
    },
    [form, onChange],
  );

  const addPackage = () => {
    set("packages", [
      ...form.packages,
      {
        id: crypto.randomUUID(),
        description: "",
        quantity: "1",
        grossWeight: "",
        netWeight: "",
        length: "",
        width: "",
        height: "",
        unit: "cm",
      },
    ]);
  };

  const removePackage = (id: string) => {
    if (form.packages.length === 1) return;
    set(
      "packages",
      form.packages.filter((p) => p.id !== id),
    );
  };

  const updatePackage = (id: string, key: keyof PackageRow, value: string) => {
    set(
      "packages",
      form.packages.map((p) => (p.id === id ? { ...p, [key]: value } : p)),
    );
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Document Reference">
        <div className="grid grid-cols-2 gap-4">
          <FieldInput
            label="PL Number"
            value={form.plNumber}
            onChange={(v) => set("plNumber", v)}
          />
          <FieldInput
            label="Date"
            value={form.date}
            onChange={(v) => set("date", v)}
            type="date"
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
            placeholder="Full address"
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
            placeholder="Full address"
          />
        </div>
      </SectionCard>

      <SectionCard title="Shipment Details">
        <div className="grid grid-cols-2 gap-4">
          <FieldInput
            label="Vessel / Flight No."
            value={form.vesselFlight}
            onChange={(v) => set("vesselFlight", v)}
          />
          <FieldInput
            label="HS Code"
            value={form.hsCode}
            onChange={(v) => set("hsCode", v)}
            placeholder="e.g. 6109.10"
          />
          <FieldInput
            label="Port of Loading"
            value={form.portOfLoading}
            onChange={(v) => set("portOfLoading", v)}
            placeholder="Karachi, Pakistan"
          />
          <FieldInput
            label="Port of Discharge"
            value={form.portOfDischarge}
            onChange={(v) => set("portOfDischarge", v)}
          />
          <FieldInput
            label="Final Destination"
            value={form.finalDestination}
            onChange={(v) => set("finalDestination", v)}
          />
          <FieldInput
            label="Marks & Numbers"
            value={form.marksNumbers}
            onChange={(v) => set("marksNumbers", v)}
          />
        </div>
      </SectionCard>

      {/* Packages */}
      <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[13px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Package Details
          </h3>
          <Button variant="soft" size="sm" onClick={addPackage}>
            <Plus className="h-3.5 w-3.5" />
            Add Row
          </Button>
        </div>
        <div className="space-y-3">
          {form.packages.map((pkg, i) => (
            <div
              key={pkg.id}
              className="rounded-[12px] border border-slate-100 bg-slate-50 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-slate-500">
                  Package {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removePackage(pkg.id)}
                  disabled={form.packages.length === 1}
                  className="grid h-7 w-7 place-items-center rounded-[8px] text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 disabled:opacity-30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Description
                  </Label>
                  <Input
                    value={pkg.description}
                    onChange={(e) =>
                      updatePackage(pkg.id, "description", e.target.value)
                    }
                    placeholder="Goods description"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Quantity
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={pkg.quantity}
                    onChange={(e) =>
                      updatePackage(pkg.id, "quantity", e.target.value)
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Gross Weight (kg)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={pkg.grossWeight}
                    onChange={(e) =>
                      updatePackage(pkg.id, "grossWeight", e.target.value)
                    }
                    placeholder="0.00"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Net Weight (kg)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={pkg.netWeight}
                    onChange={(e) =>
                      updatePackage(pkg.id, "netWeight", e.target.value)
                    }
                    placeholder="0.00"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Unit
                  </Label>
                  <select
                    value={pkg.unit}
                    onChange={(e) =>
                      updatePackage(
                        pkg.id,
                        "unit",
                        e.target.value as "cm" | "in",
                      )
                    }
                    className="h-10 w-full rounded-[12px] border border-slate-200 bg-white px-3 text-[14px] text-slate-900 shadow-[0_4px_14px_rgba(22,31,54,0.03)] focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="cm">cm</option>
                    <option value="in">inch</option>
                  </select>
                </div>
                <div className="col-span-2 grid grid-cols-3 gap-2">
                  {(["length", "width", "height"] as const).map((dim) => (
                    <div key={dim}>
                      <Label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        {dim.charAt(0).toUpperCase() + dim.slice(1)}
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        value={pkg[dim]}
                        onChange={(e) =>
                          updatePackage(pkg.id, dim, e.target.value)
                        }
                        placeholder="0"
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SectionCard title="Notes">
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Additional notes or instructions..."
          rows={3}
          className="w-full rounded-[12px] border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-slate-900 shadow-[0_4px_14px_rgba(22,31,54,0.03)] placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
        />
      </SectionCard>
    </div>
  );
}
