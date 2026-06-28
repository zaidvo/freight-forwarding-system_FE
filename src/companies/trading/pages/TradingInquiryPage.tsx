// src/modules/trading/pages/TradingInquiryPage.tsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Label } from "@/shared/components/ui/Label";
import { WorkflowStepper } from "../components/WorkflowStepper";
import { StatusBadge } from "../components/StatusBadge";
import { useTradingStore } from "../store/tradingStore";
import type { TradingInquiry } from "../types";
import { ArrowRight, Clock } from "lucide-react";
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
        {required && <span className="ml-1 text-rose-400">*</span>}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full"
        required={required}
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

// ─── Empty form state ─────────────────────────────────────────────
const emptyForm = (): Omit<
  TradingInquiry,
  "id" | "status" | "auditTrail" | "createdAt"
> => ({
  buyer: "",
  contactPerson: "",
  email: "",
  phone: "",
  product: "",
  quantity: 0,
  unit: "MT",
  destinationCountry: "",
  inquiryDate: new Date().toISOString().split("T")[0],
  notes: "",
  assignedSalesperson: "",
});

export default function TradingInquiryPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { inquiries, createInquiry, submitInquiry } = useTradingStore();

  const existing =
    id && id !== "new" ? inquiries.find((i) => i.id === id) : null;
  const isView = !!existing;

  const [form, setForm] = useState(existing ? { ...existing } : emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: string, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.buyer || !form.product || !form.email) {
      setError("Buyer, product and email are required.");
      return;
    }
    setError(null);
    setSaving(true);
    // BE: POST /api/v1/trading/inquiries
    try {
      const inq = createInquiry({
        ...form,
        quantity: Number(form.quantity),
      });
      navigate(`/trading/inquiry/${inq.id}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = () => {
    if (!existing) return;
    // BE: PATCH /api/v1/trading/inquiries/:id/submit
    submitInquiry(existing.id);
    navigate("/trading");
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="rounded-[8px] bg-sky-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-sky-600">
              Trading · Step 1
            </span>
            <h1 className="mt-1.5 text-[26px] font-bold tracking-[-0.04em] text-slate-900">
              {isView ? `Inquiry — ${existing.id}` : "New Trading Inquiry"}
            </h1>
            {isView && (
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge status={existing.status} />
                <span className="text-[13px] text-slate-400">
                  by {existing.assignedSalesperson}
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate("/trading")}>
              Back
            </Button>
            {!isView && (
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Inquiry"}
              </Button>
            )}
            {isView && existing.status === "draft" && (
              <Button onClick={handleSubmit}>
                Submit Inquiry <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {isView && existing.status === "inquiry_received" && (
              <Button
                onClick={() =>
                  navigate(`/trading/quotation/new?inquiryId=${existing.id}`)
                }
              >
                Generate Quotation <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Stepper */}
        <WorkflowStepper currentStatus={existing?.status ?? "draft"} />

        {error && (
          <div className="rounded-[12px] border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
            {error}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Buyer info */}
          <SectionCard title="Buyer Information">
            <div className="space-y-4">
              <Field
                label="Buyer / Company"
                value={form.buyer}
                onChange={(v) => set("buyer", v)}
                required
                placeholder="Global Traders LLC"
              />
              <Field
                label="Contact Person"
                value={form.contactPerson}
                onChange={(v) => set("contactPerson", v)}
                placeholder="Ahmed Khan"
              />
              <Field
                label="Email"
                value={form.email}
                onChange={(v) => set("email", v)}
                type="email"
                required
                placeholder="ahmed@company.com"
              />
              <Field
                label="Phone"
                value={form.phone}
                onChange={(v) => set("phone", v)}
                placeholder="+92 321 1234567"
              />
            </div>
          </SectionCard>

          {/* Product info */}
          <SectionCard title="Product & Shipment">
            <div className="space-y-4">
              <Field
                label="Product"
                value={form.product}
                onChange={(v) => set("product", v)}
                required
                placeholder="Cotton Yarn"
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Quantity"
                  value={String(form.quantity)}
                  onChange={(v) => set("quantity", v)}
                  type="number"
                  placeholder="500"
                />
                <div>
                  <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Unit
                  </Label>
                  <select
                    value={form.unit}
                    onChange={(e) => set("unit", e.target.value)}
                    className="h-10 w-full rounded-[12px] border border-slate-200 bg-white px-3 text-[14px] text-slate-900 shadow-[0_4px_14px_rgba(22,31,54,0.03)] focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  >
                    {["MT", "KG", "PCS", "CTN", "SET", "LTR"].map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Field
                label="Destination Country"
                value={form.destinationCountry}
                onChange={(v) => set("destinationCountry", v)}
                placeholder="Germany"
              />
              <Field
                label="Inquiry Date"
                value={form.inquiryDate}
                onChange={(v) => set("inquiryDate", v)}
                type="date"
              />
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Assignment & Notes">
          <div className="space-y-4">
            <Field
              label="Assigned Salesperson"
              value={form.assignedSalesperson}
              onChange={(v) => set("assignedSalesperson", v)}
              placeholder="Ali Hassan"
            />
            <div>
              <Label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Notes
              </Label>
              <textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={3}
                placeholder="Any special requirements or notes..."
                className="w-full rounded-[12px] border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-slate-900 shadow-[0_4px_14px_rgba(22,31,54,0.03)] placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>
        </SectionCard>

        {/* Audit trail */}
        {isView && existing.auditTrail.length > 0 && (
          <SectionCard title="Activity Log">
            <div className="space-y-3">
              {existing.auditTrail.map((entry, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100">
                    <Clock className="h-3 w-3 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-slate-800">
                      {entry.action}
                    </div>
                    <div className="text-[12px] text-slate-400">
                      {entry.user} ·{" "}
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                    {entry.remarks && (
                      <div className="mt-0.5 text-[12px] text-slate-500">
                        {entry.remarks}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </AppLayout>
  );
}
