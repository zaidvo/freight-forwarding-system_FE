// src/modules/indenting/pages/IndentDealDetailPage.tsx

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Edit3,
  Loader2,
  Plus,
  Trash2,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { AppLayout } from "@/app/layout/AppLayout";
import { useAuth } from "@/app/providers/AuthProvider";
import { indentingService } from "../services/indentingService";
import type { IndentingDeal, IndentingDealStatus } from "../types";
import { DealStatusBadge, PaymentStatusBadge } from "../components/StatusBadge";
import { AddPaymentDialog } from "../components/AddPaymentDialog";

export default function IndentDealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isRoot = user?.role === "root";

  const [deal, setDeal] = useState<IndentingDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchDeal = async () => {
    if (!id) return;
    try {
      const data = await indentingService.getDeal(parseInt(id, 10));
      setDeal(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load deal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeal();
  }, [id]);

  const handleStatusChange = async (newStatus: IndentingDealStatus) => {
    if (!deal) return;
    setUpdatingStatus(true);
    try {
      const updated = await indentingService.updateDealStatus(deal.id, newStatus);
      setDeal(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update deal status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (!deal) return;
    if (!window.confirm("Are you sure you want to remove this payment record? This action is permanent.")) {
      return;
    }

    try {
      const updated = await indentingService.deletePayment(deal.id, paymentId);
      setDeal(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to remove payment");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/indenting"
              className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight font-mono">
                  {deal?.reference ?? "Loading..."}
                </h1>
                {deal && <DealStatusBadge status={deal.status} />}
                {deal && <PaymentStatusBadge status={deal.payment_status} />}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Created on {deal?.created_at ? new Date(deal.created_at).toLocaleDateString() : ""}
              </p>
            </div>
          </div>

          {deal && (
            <div className="flex items-center gap-2.5">
              <select
                value={deal.status}
                disabled={updatingStatus}
                onChange={(e) => handleStatusChange(e.target.value as IndentingDealStatus)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:border-amber-500"
              >
                <option value="open">Status: Open</option>
                <option value="confirmed">Status: Confirmed</option>
                <option value="closed">Status: Closed</option>
                <option value="cancelled">Status: Cancelled</option>
              </select>

              <Link
                to={`/indenting/deals/${deal.id}/edit`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Deal
              </Link>

              <button
                type="button"
                onClick={() => setIsPaymentDialogOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Payment
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="p-16 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
            Loading deal details...
          </div>
        ) : deal ? (
          <>
            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Total Deal Value
                </div>
                <div className="text-lg font-bold text-slate-900 mt-1 font-mono">
                  {deal.currency} {deal.deal_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {deal.quantity} {deal.unit} • {deal.product}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Expected Commission
                </div>
                <div className="text-lg font-bold text-slate-900 mt-1 font-mono">
                  {deal.commission_currency}{" "}
                  {deal.commission_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {deal.commission_type === "percent"
                    ? `${deal.commission_rate}% of deal`
                    : "Fixed agreement"}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider">
                  Received Commission
                </div>
                <div className="text-lg font-bold text-emerald-600 mt-1 font-mono">
                  {deal.commission_currency}{" "}
                  {deal.total_paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {deal.payments.length} payment{deal.payments.length !== 1 ? "s" : ""} recorded
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="text-[11px] font-medium text-amber-600 uppercase tracking-wider">
                  Balance Outstanding
                </div>
                <div className="text-lg font-bold text-amber-700 mt-1 font-mono">
                  {deal.commission_currency}{" "}
                  {deal.balance_due.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  Payer:{" "}
                  <span className="font-semibold text-slate-700">
                    {deal.commission_payer === "party_a"
                      ? "Party A"
                      : deal.commission_payer === "party_b"
                      ? "Party B"
                      : "Shared"}
                  </span>
                </div>
              </div>
            </div>

            {/* Parties Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Party A */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-600" /> Party A (Seller / Principal)
                  </span>
                  <span className="font-mono text-xs text-slate-400">{deal.party_a?.code}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-800">{deal.party_a?.name}</h3>
                  {deal.party_a?.contact_person && (
                    <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {deal.party_a.contact_person}
                    </div>
                  )}
                  {deal.party_a?.email && (
                    <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {deal.party_a.email}
                    </div>
                  )}
                  {deal.party_a?.phone && (
                    <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {deal.party_a.phone}
                    </div>
                  )}
                  {deal.party_a?.city && (
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {deal.party_a.city}, {deal.party_a.country}
                    </div>
                  )}
                </div>
              </div>

              {/* Party B */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-sky-600" /> Party B (Buyer / Offtaker)
                  </span>
                  <span className="font-mono text-xs text-slate-400">{deal.party_b?.code}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-800">{deal.party_b?.name}</h3>
                  {deal.party_b?.contact_person && (
                    <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {deal.party_b.contact_person}
                    </div>
                  )}
                  {deal.party_b?.email && (
                    <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {deal.party_b.email}
                    </div>
                  )}
                  {deal.party_b?.phone && (
                    <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {deal.party_b.phone}
                    </div>
                  )}
                  {deal.party_b?.city && (
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {deal.party_b.city}, {deal.party_b.country}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Deal Terms & Remarks */}
            {deal.remarks && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Remarks / Terms
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {deal.remarks}
                </p>
              </div>
            )}

            {/* Commission Payments History */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden space-y-0">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Commission Payment Receipts
                  </h3>
                  <p className="text-xs text-slate-500">
                    Audit trail of all partial and full payments settled for this deal
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPaymentDialogOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-semibold shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Record Payment
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-4">Payment Date</th>
                      <th className="py-2.5 px-4 text-right">Amount</th>
                      <th className="py-2.5 px-4">Reference / TID</th>
                      <th className="py-2.5 px-4">Notes</th>
                      <th className="py-2.5 px-4">Recorded At</th>
                      {isRoot && <th className="py-2.5 px-4 text-center">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {deal.payments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={isRoot ? 6 : 5}
                          className="py-8 text-center text-slate-400"
                        >
                          No payments recorded yet for this deal.
                        </td>
                      </tr>
                    ) : (
                      deal.payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                            {p.payment_date}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                            {p.currency} {p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {p.reference || "—"}
                          </td>
                          <td className="py-3 px-4 text-slate-500">{p.notes || "—"}</td>
                          <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                            {new Date(p.created_at).toLocaleString()}
                          </td>
                          {isRoot && (
                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeletePayment(p.id)}
                                title="Delete payment (Root only)"
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add Payment Modal */}
            <AddPaymentDialog
              isOpen={isPaymentDialogOpen}
              onClose={() => setIsPaymentDialogOpen(false)}
              deal={deal}
              onSuccess={(updated) => setDeal(updated)}
            />
          </>
        ) : null}
      </div>
    </AppLayout>
  );
}
