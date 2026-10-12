// src/modules/indenting/pages/IndentingPage.tsx

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Handshake,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Users,
  Eye,
  RefreshCw,
} from "lucide-react";
import { AppLayout } from "@/app/layout/AppLayout";
import { indentingService } from "../services/indentingService";
import type {
  IndentingDeal,
  IndentingDealStatus,
  IndentingSummaryResponse,
} from "../types";
import { DealStatusBadge, PaymentStatusBadge } from "../components/StatusBadge";

export default function IndentingPage() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<IndentingDeal[]>([]);
  const [summary, setSummary] = useState<IndentingSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<IndentingDealStatus | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDealsCount, setTotalDealsCount] = useState(0);

  const fetchData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);

    try {
      const [dealsRes, summaryRes] = await Promise.all([
        indentingService.listDeals({
          q: query.trim() || undefined,
          status: statusFilter ? statusFilter : undefined,
          page,
          page_size: 15,
        }),
        indentingService.getSummary(),
      ]);

      setDeals(dealsRes.items);
      setTotalPages(dealsRes.total_pages);
      setTotalDealsCount(dealsRes.total);
      setSummary(summaryRes);
    } catch (err) {
      console.error("Failed to fetch indenting data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Handshake className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Indenting Deals & Commissions
                </h1>
                <p className="text-xs text-slate-500">
                  Manage broker deals, party commissions, and payment reconciliations
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/indenting/parties"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              Manage Parties ({summary?.active_parties ?? 0})
            </Link>
            <Link
              to="/indenting/deals/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 text-white hover:bg-amber-600 rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Deal
            </Link>
          </div>
        </div>

        {/* Currency Summary Cards */}
        {summary && summary.currencies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.currencies.map((curr) => (
              <div
                key={curr.currency}
                className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm relative overflow-hidden"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                      {curr.currency}
                    </span>
                    <span className="text-xs text-slate-500">
                      {curr.deal_count} deal{curr.deal_count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Total Deal: {curr.currency}{" "}
                    {curr.total_deal_value.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 text-center">
                  <div>
                    <div className="text-[11px] font-medium text-slate-400">Expected</div>
                    <div className="text-sm font-semibold text-slate-800 mt-0.5">
                      {curr.expected_commission.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-emerald-600">Received</div>
                    <div className="text-sm font-semibold text-emerald-600 mt-0.5">
                      {curr.received_commission.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-amber-600">Pending</div>
                    <div className="text-sm font-semibold text-amber-600 mt-0.5">
                      {curr.pending_commission.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-4 text-xs text-amber-700 flex items-center justify-between">
            <span>No commission activity recorded yet. Create your first deal to track currencies.</span>
            <Link
              to="/indenting/deals/new"
              className="text-amber-800 font-semibold underline underline-offset-2"
            >
              Create Deal &rarr;
            </Link>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 w-full flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search reference, product, remarks..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors shrink-0"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as IndentingDealStatus | "");
                setPage(1);
              }}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:border-amber-500"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="confirmed">Confirmed</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              title="Refresh"
              className="p-1.5 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Deals Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Deal Reference</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Parties (A &rarr; B)</th>
                  <th className="py-3 px-4">Product & Quantity</th>
                  <th className="py-3 px-4 text-right">Deal Value</th>
                  <th className="py-3 px-4 text-right">Commission</th>
                  <th className="py-3 px-4 text-center">Payment Status</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      Loading deals...
                    </td>
                  </tr>
                ) : deals.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No deals found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  deals.map((deal) => (
                    <tr
                      key={deal.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/indenting/deals/${deal.id}`)}
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-amber-600">
                        {deal.reference}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {deal.deal_date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">
                          {deal.party_a?.name ?? "Party A"}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <ArrowRight className="w-3 h-3 text-slate-300" />
                          {deal.party_b?.name ?? "Party B"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{deal.product}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {deal.quantity} {deal.unit}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-800">
                        {deal.currency} {deal.deal_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-mono font-semibold text-slate-900">
                          {deal.commission_currency}{" "}
                          {deal.commission_amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {deal.commission_type === "percent"
                            ? `${deal.commission_rate}% rate`
                            : "Fixed amount"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <PaymentStatusBadge status={deal.payment_status} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <DealStatusBadge status={deal.status} />
                      </td>
                      <td
                        className="py-3 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            to={`/indenting/deals/${deal.id}`}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="View Deal"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing page <span className="font-semibold">{page}</span> of{" "}
                <span className="font-semibold">{totalPages}</span> ({totalDealsCount} total deals)
              </div>
              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
