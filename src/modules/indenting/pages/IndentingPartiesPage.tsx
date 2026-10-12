// src/modules/indenting/pages/IndentingPartiesPage.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  ArrowLeft,
  Mail,
  Phone,
  Edit2,
  Power,
  RefreshCw,
} from "lucide-react";
import { AppLayout } from "@/app/layout/AppLayout";
import { indentingService } from "../services/indentingService";
import type { IndentingParty, IndentingPartyStatus } from "../types";
import { PartyFormDialog } from "../components/PartyFormDialog";

export default function IndentingPartiesPage() {
  const [parties, setParties] = useState<IndentingParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<IndentingPartyStatus | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalParties, setTotalParties] = useState(0);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [partyToEdit, setPartyToEdit] = useState<IndentingParty | null>(null);

  const fetchParties = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await indentingService.listParties({
        q: query.trim() || undefined,
        status: statusFilter ? statusFilter : undefined,
        page,
        page_size: 20,
      });
      setParties(res.items);
      setTotalPages(res.total_pages);
      setTotalParties(res.total);
    } catch (err) {
      console.error("Failed to load parties:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchParties();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchParties();
  };

  const handleToggleStatus = async (party: IndentingParty) => {
    try {
      if (party.status === "active") {
        await indentingService.deactivateParty(party.id);
      } else {
        await indentingService.activateParty(party.id);
      }
      fetchParties(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to toggle party status");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/indenting"
              className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Indenting Parties Directory
                </h1>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                  {totalParties}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Manage buyers, sellers, brokers, and trade counter-parties
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setPartyToEdit(null);
              setIsDialogOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 text-white hover:bg-amber-600 rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Party
          </button>
        </div>

        {/* Filter & Search Bar */}
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
                placeholder="Search by party name, code, contact person, email, or phone..."
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
                setStatusFilter(e.target.value as IndentingPartyStatus | "");
                setPage(1);
              }}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:border-amber-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <button
              onClick={() => fetchParties(true)}
              disabled={refreshing}
              title="Refresh"
              className="p-1.5 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Parties Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Party Name</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Tax ID / NTN</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Loading parties...
                    </td>
                  </tr>
                ) : parties.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No parties found.
                    </td>
                  </tr>
                ) : (
                  parties.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                        {p.code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{p.name}</div>
                        {p.notes && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                            {p.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {p.contact_person || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {p.phone && (
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {p.phone}
                            </div>
                          )}
                          {p.email && (
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {p.email}
                            </div>
                          )}
                          {!p.phone && !p.email && <span className="text-slate-400">—</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {p.city ? `${p.city}${p.country ? `, ${p.country}` : ""}` : p.country || "—"}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {p.tax_id || "—"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            p.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          {p.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setPartyToEdit(p);
                              setIsDialogOpen(true);
                            }}
                            title="Edit Party"
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(p)}
                            title={p.status === "active" ? "Deactivate Party" : "Activate Party"}
                            className={`p-1.5 rounded-lg transition-colors ${
                              p.status === "active"
                                ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
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
                Page <span className="font-semibold">{page}</span> of{" "}
                <span className="font-semibold">{totalPages}</span> ({totalParties} total)
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

        {/* Dialog for Add / Edit Party */}
        <PartyFormDialog
          isOpen={isDialogOpen}
          partyToEdit={partyToEdit}
          onClose={() => setIsDialogOpen(false)}
          onSuccess={() => fetchParties(true)}
        />
      </div>
    </AppLayout>
  );
}
