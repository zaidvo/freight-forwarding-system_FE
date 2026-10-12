import { useEffect, useState } from "react";
import { Dialog } from "@/shared/components/ui/Dialog";
import Button from "@/shared/components/ui/Button";
import Input from "@/shared/components/ui/Input";
import SaveFeedback from "@/shared/components/SaveFeedback";
import { checkCustomerDuplicates, createCustomer, updateCustomer } from "../services/customerService";
import type { Customer, CustomerInput, CustomerRole } from "../types";
import DuplicateWarning from "./DuplicateWarning";
import { customerRoleLabels } from "./RoleBadge";

type Props = {
  open: boolean;
  onClose: () => void;
  initialName?: string;
  initialRole?: CustomerRole;
  customer?: Customer;
  onSaved: (customer: Customer) => void;
};

const emptyForm = (name = "", role: CustomerRole = "customer"): CustomerInput => ({
  name,
  contact_person: "",
  city: "",
  email: "",
  phone: "",
  address: "",
  country: "",
  tax_id: "",
  notes: "",
  roles: [role],
});

const customerToForm = (customer: Customer): CustomerInput => ({
  name: customer.name,
  contact_person: customer.contact_person ?? "",
  city: customer.city ?? "",
  email: customer.email ?? "",
  phone: customer.phone ?? "",
  address: customer.address ?? "",
  country: customer.country ?? "",
  tax_id: customer.tax_id ?? "",
  notes: customer.notes ?? "",
  roles: customer.roles.length ? customer.roles : ["customer"],
});

export default function CustomerForm({ open, onClose, initialName = "", initialRole = "customer", customer, onSaved }: Props) {
  const isEditing = Boolean(customer);
  const [form, setForm] = useState<CustomerInput>(customer ? customerToForm(customer) : emptyForm(initialName, initialRole));
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [duplicates, setDuplicates] = useState<Customer[]>([]);

  useEffect(() => {
    if (open) {
      setForm(customer ? customerToForm(customer) : emptyForm(initialName, initialRole));
      setFeedback(null);
      setDuplicates([]);
    }
  }, [open, initialName, initialRole, customer]);

  const setField = (field: keyof CustomerInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleRole = (role: CustomerRole) => {
    setForm((current) => ({
      ...current,
      roles: current.roles.includes(role)
        ? current.roles.length > 1 ? current.roles.filter((item) => item !== role) : current.roles
        : [...current.roles, role],
    }));
  };

  const persist = async () => {
    if (!form.name.trim()) {
      setFeedback({ type: "error", message: "Customer name is required." });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const savedCustomer = isEditing
        ? await updateCustomer(customer!.id, { ...form, name: form.name.trim() })
        : await createCustomer({ ...form, name: form.name.trim() });
      onSaved(savedCustomer);
      onClose();
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Could not create customer." });
    } finally {
      setSaving(false);
    }
  };

  const submit = async () => {
    if (!form.name.trim()) {
      setFeedback({ type: "error", message: "Customer name is required." });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const matches = await checkCustomerDuplicates(form.name, customer?.id);
      if (matches.length > 0) {
        setDuplicates(matches);
        return;
      }
      await persist();
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Could not check duplicates." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} panelClassName="max-w-2xl">
      <div className="p-6">
        <div className="mb-5 pr-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-600">Customer directory</p>
          <h2 className="mt-1 text-[22px] font-bold tracking-tight text-slate-900">{isEditing ? "Edit customer" : "Create customer"}</h2>
          <p className="mt-1 text-[13px] text-slate-500">This party can be reused as a customer, shipper, consignee, or clearing agent.</p>
        </div>

        <div className="space-y-4">
          {feedback && <SaveFeedback type={feedback.type} message={feedback.message} />}
          {duplicates.length > 0 && (
            <DuplicateWarning matches={duplicates} onCancel={() => setDuplicates([])} onContinue={() => { setDuplicates([]); void persist(); }} />
          )}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-slate-500">Company name *</label>
            <Input value={form.name} onChange={(event) => setField("name", event.target.value)} placeholder="e.g. XYZ Fashion Trading LLC" autoFocus />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Contact person" value={form.contact_person ?? ""} onChange={(value) => setField("contact_person", value)} />
            <Field label="City" value={form.city ?? ""} onChange={(value) => setField("city", value)} />
            <Field label="Email" value={form.email ?? ""} onChange={(value) => setField("email", value)} type="email" />
            <Field label="Phone" value={form.phone ?? ""} onChange={(value) => setField("phone", value)} />
            <Field label="Country" value={form.country ?? ""} onChange={(value) => setField("country", value)} />
            <Field label="Tax ID" value={form.tax_id ?? ""} onChange={(value) => setField("tax_id", value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-slate-500">Address</label>
            <textarea value={form.address ?? ""} onChange={(event) => setField("address", event.target.value)} rows={2} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-[13px] outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
          </div>
          <div>
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-slate-500">Role tags</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(customerRoleLabels) as CustomerRole[]).map((role) => (
                <button key={role} type="button" onClick={() => toggleRole(role)} className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition ${form.roles.includes(role) ? "border-violet-300 bg-violet-50 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}>
                  {customerRoleLabels[role]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={() => void submit()} disabled={saving}>{saving ? "Checking..." : isEditing ? "Save changes" : "Create customer"}</Button>
        </div>
      </div>
    </Dialog>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-slate-500">{label}</label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
