import { ArrowLeft, Building2, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import Button from "@/shared/components/ui/Button";
import { useAuth } from "@/app/providers/AuthProvider";
import SaveFeedback from "@/shared/components/SaveFeedback";
import CustomerForm from "../components/CustomerForm";
import RoleBadge from "../components/RoleBadge";
import { getCustomer } from "../services/customerService";
import type { Customer } from "../types";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    void getCustomer(Number(id)).then(setCustomer).catch((failure) => setError(failure instanceof Error ? failure.message : "Could not load customer."));
  }, [id]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-5">
        <Link to="/customers" className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Back to customers</Link>
        {error && <SaveFeedback type="error" message={error} />}
        {!customer && !error ? <div className="py-16 text-center text-[13px] text-slate-400">Loading customer...</div> : customer && (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-600"><Building2 className="h-6 w-6" /></div>
                <div className="min-w-0 flex-1"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-600">{customer.code}</p><h1 className="mt-1 text-[26px] font-bold text-slate-900">{customer.name}</h1><div className="mt-2 flex flex-wrap gap-1.5">{customer.roles.map((role) => <RoleBadge key={role} role={role} />)}</div></div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${customer.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{customer.status}</span>
                  {user?.role === "root" && <Button type="button" size="sm" variant="secondary" onClick={() => setEditOpen(true)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>}
                </div>
              </div>
              <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
                <Detail label="Contact person" value={customer.contact_person} /><Detail label="Email" value={customer.email} /><Detail label="Phone" value={customer.phone} /><Detail label="Location" value={[customer.city, customer.country].filter(Boolean).join(", ")} /><Detail label="Tax ID" value={customer.tax_id} /><Detail label="Address" value={customer.address} />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_8px_rgba(22,31,54,0.04)]"><h2 className="text-[15px] font-semibold text-slate-800">History</h2><p className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-[13px] text-slate-400">History will appear here as this party is used in shipments, sales, and finance records.</p></div>
            <CustomerForm open={editOpen} onClose={() => setEditOpen(false)} customer={customer} onSaved={(updated) => { setCustomer(updated); setEditOpen(false); }} />
          </>
        )}
      </div>
    </AppLayout>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return <div><p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-[13px] text-slate-700">{value || "—"}</p></div>;
}
