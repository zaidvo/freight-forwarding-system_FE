// src/modules/sales/components/ProformaInvoiceForm.tsx
import { useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Plus, Trash2 } from "lucide-react";
import type {
  ProformaInvoiceForm as ProformaInvoiceFormType,
  ProformaLineItem,
} from "../types";
import { INCOTERMS, PAYMENT_TERMS } from "../data/seed";

type Props = {
  form: ProformaInvoiceFormType;
  onChange: (f: ProformaInvoiceFormType) => void;
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
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      rows={props.rows ?? 2}
      placeholder={props.placeholder}
      className="w-full rounded-[12px] border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-slate-900 shadow-[0_4px_14px_rgba(22,31,54,0.03)] placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
    />
  );
}

export function ProformaInvoiceFormPanel({ form, onChange }: Props) {
  const set = useCallback(
    <K extends keyof ProformaInvoiceFormType>(
      key: K,
      value: ProformaInvoiceFormType[K],
    ) => {
      onChange({ ...form, [key]: value });
    },
    [form, onChange],
  );

  const addItem = () => {
    set("items", [
      ...form.items,
      {
        id: crypto.randomUUID(),
        description: "",
        quantity: "1",
        unit: "PCS",
        unitPrice: "",
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (form.items.length === 1) return;
    set(
      "items",
      form.items.filter((item) => item.id !== id),
    );
  };

  const updateItem = (
    id: string,
    key: keyof ProformaLineItem,
    value: string,
  ) => {
    set(
      "items",
      form.items.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Document Reference">
        <div className="grid grid-cols-2 gap-4">
          <FieldInput
            label="PI Number"
            value={form.piNumber}
            onChange={(v) => set("piNumber", v)}
          />
          <FieldInput
            label="Date"
            value={form.date}
            onChange={(v) => set("date", v)}
            type="date"
          />
          <FieldInput
            label="Valid Until"
            value={form.validUntil}
            onChange={(v) => set("validUntil", v)}
            type="date"
          />
          <div>
            <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Currency
            </Label>
            <select
              value={form.currency}
              onChange={(e) =>
                set(
                  "currency",
                  e.target.value as ProformaInvoiceFormType["currency"],
                )
              }
              className="h-10 w-full rounded-[12px] border border-slate-200 bg-white px-3 text-[14px] text-slate-900 shadow-[0_4px_14px_rgba(22,31,54,0.03)] focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              {(["USD", "PKR", "EUR", "GBP"] as const).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Seller">
        <div className="space-y-3">
          <FieldInput
            label="Company Name"
            value={form.sellerName}
            onChange={(v) => set("sellerName", v)}
          />
          <div>
            <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Address
            </Label>
            <TextareaInput
              value={form.sellerAddress}
              onChange={(v) => set("sellerAddress", v)}
            />
          </div>
          <FieldInput
            label="Contact / Email"
            value={form.sellerContact}
            onChange={(v) => set("sellerContact", v)}
          />
        </div>
      </SectionCard>

      <SectionCard title="Buyer">
        <div className="space-y-3">
          <FieldInput
            label="Company Name"
            value={form.buyerName}
            onChange={(v) => set("buyerName", v)}
          />
          <div>
            <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Address
            </Label>
            <TextareaInput
              value={form.buyerAddress}
              onChange={(v) => set("buyerAddress", v)}
            />
          </div>
          <FieldInput
            label="Contact / Email"
            value={form.buyerContact}
            onChange={(v) => set("buyerContact", v)}
          />
        </div>
      </SectionCard>

      <SectionCard title="Shipment Terms">
        <div className="grid grid-cols-2 gap-4">
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
                <option key={t} value={t}>
                  {t}
                </option>
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
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </SectionCard>

      {/* Line Items */}
      <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[13px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Line Items
          </h3>
          <Button variant="soft" size="sm" onClick={addItem}>
            <Plus className="h-3.5 w-3.5" />
            Add Item
          </Button>
        </div>
        <div className="space-y-3">
          {form.items.map((item, i) => (
            <div
              key={item.id}
              className="rounded-[12px] border border-slate-100 bg-slate-50 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-slate-500">
                  Item {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={form.items.length === 1}
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
                    value={item.description}
                    onChange={(e) =>
                      updateItem(item.id, "description", e.target.value)
                    }
                    placeholder="Item description"
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
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.id, "quantity", e.target.value)
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Unit
                  </Label>
                  <Input
                    value={item.unit}
                    onChange={(e) =>
                      updateItem(item.id, "unit", e.target.value)
                    }
                    placeholder="PCS / KG / SET"
                    className="w-full"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Unit Price ({form.currency})
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(item.id, "unitPrice", e.target.value)
                    }
                    placeholder="0.00"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SectionCard title="Additional Charges">
        <div className="grid grid-cols-3 gap-4">
          <FieldInput
            label={`Freight (${form.currency})`}
            value={form.freightCharges}
            onChange={(v) => set("freightCharges", v)}
          />
          <FieldInput
            label={`Insurance (${form.currency})`}
            value={form.insuranceCharges}
            onChange={(v) => set("insuranceCharges", v)}
          />
          <FieldInput
            label={`Other (${form.currency})`}
            value={form.otherCharges}
            onChange={(v) => set("otherCharges", v)}
          />
        </div>
      </SectionCard>

      <SectionCard title="Bank Details">
        <TextareaInput
          value={form.bankDetails}
          onChange={(v) => set("bankDetails", v)}
          rows={4}
          placeholder={"Bank Name:\nAccount No.:\nIBAN:\nSWIFT:"}
        />
      </SectionCard>

      <SectionCard title="Notes">
        <TextareaInput
          value={form.notes}
          onChange={(v) => set("notes", v)}
          rows={3}
          placeholder="Additional terms or instructions..."
        />
      </SectionCard>
    </div>
  );
}
