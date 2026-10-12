import { Building2, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import Button from "@/shared/components/ui/Button";
import SaveFeedback from "@/shared/components/SaveFeedback";
import { useAuth } from "@/app/providers/AuthProvider";
import CustomerForm from "../components/CustomerForm";
import RoleBadge from "../components/RoleBadge";
import { listCustomers, setCustomerStatus } from "../services/customerService";
import type { Customer, CustomerRole, CustomerStatus } from "../types";

export default function CustomersPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState<CustomerRole | "">("");
  const [status, setStatus] = useState<CustomerStatus | "">("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [createOpen, setCreateOpen] = useState(searchParams.get("create") === "1");
  const [createName, setCreateName] = useState(searchParams.get("name") ?? "");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCustomers({ q, role, status, pageSize: 50 });
      setCustomers(data.items);
      setTotal(data.total);
    } catch (requestFailure) {
      setError(requestFailure instanceof Error ? requestFailure.message : "Could not load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 200);
    return () => window.clearTimeout(timer);
  }, [q, role, status]);

  const openCreate = (name = "") => {
    setCreateName(name);
    setCreateOpen(true);
    setSearchParams({ create: "1", ...(name ? { name } : {}) });
  };

  const closeCreate = () => {
    setCreateOpen(false);
    setSearchParams({});
  };

  const toggleStatus = async (customer: Customer) => {
    if (user?.role !== "root") return;
    try {
      const updated = await setCustomerStatus(customer.id, customer.status !== "active");
      setCustomers((items) => items.map((item) => item.id === updated.id ? updated : item));
    } catch (requestFailure) {
      setError(requestFailure instanceof Error ? requestFailure.message : "Could not update customer status.");
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-violet-600">
              <Building2 className="h-5 w-5" />
              <span className="text-[11px] font-bold uppercase tracking-[0.16em]">Shared party database</span>
            </div>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">Customers</h1>
            <p className="mt-1 text-[13px] text-slate-500">Reusable customers, shippers, consignees, and clearing agents.</p>
          </div>
          <Button type="button" onClick={() => openCreate()}><Plus className="h-4 w-4" /> New customer</Button>
        </div>

        {error && <SaveFeedback type="error" message={error} />}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search by name, code, email, city..." className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-[13px] outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              <select value={role} onChange={(event) => setRole(event.target.value as CustomerRole | "")} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none">
                <option value="">All roles</option>
                <option value="customer">Customer</option>
                <option value="shipper">Shipper</option>
                <option value="consignee">Consignee</option>
                <option value="clearing_agent">Clearing Agent</option>
              </select>
              <select value={status} onChange={(event) => setStatus(event.target.value as CustomerStatus | "")} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="">All statuses</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(22,31,54,0.04)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <p className="text-[13px] font-semibold text-slate-800">Directory records</p>
            <span className="text-[12px] text-slate-400">{total} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr><th className="px-5 py-3">Party</th><th className="px-4 py-3">Roles</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <tr><td colSpan={6} className="px-5 py-12 text-center text-[13px] text-slate-400">Loading customers...</td></tr> : customers.length === 0 ? <tr><td colSpan={6} className="px-5 py-12 text-center text-[13px] text-slate-400">No customers match these filters.</td></tr> : customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3"><Link to={`/customers/${customer.id}`} className="font-semibold text-slate-800 hover:text-violet-600">{customer.name}</Link><p className="mt-0.5 text-[11px] text-slate-400">{customer.code}</p></td>
                    <td className="px-4 py-3"><div className="flex max-w-[220px] flex-wrap gap-1">{customer.roles.map((item) => <RoleBadge key={item} role={item} />)}</div></td>
                    <td className="px-4 py-3 text-[12px] text-slate-600">{customer.contact_person || customer.email || customer.phone || "—"}</td>
                    <td className="px-4 py-3 text-[12px] text-slate-600">{[customer.city, customer.country].filter(Boolean).join(", ") || "—"}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${customer.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{customer.status}</span></td>
                    <td className="px-5 py-3 text-right"><button type="button" onClick={() => void toggleStatus(customer)} disabled={user?.role !== "root"} className="text-[12px] font-semibold text-slate-500 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40">{customer.status === "active" ? "Deactivate" : "Activate"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <CustomerForm open={createOpen} onClose={closeCreate} initialName={createName} onSaved={() => void load()} />
    </AppLayout>
  );
}
