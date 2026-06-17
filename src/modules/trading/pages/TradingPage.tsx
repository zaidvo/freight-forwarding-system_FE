// src/modules/trading/pages/TradingPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Plus,
  Search,
  FileText,
  ClipboardCheck,
  Handshake,
  TrendingUp,
} from "lucide-react";
import { useTradingStore } from "../store/tradingStore";
import { useFreightStore } from "@/modules/freight/store/freightStore";
import { StatusBadge } from "../components/StatusBadge";
import { ShipmentDecisionDialog } from "../components/ShipmentDecisionDialog";
import type { Deal } from "../types";

export default function TradingPage() {
  const navigate = useNavigate();
  const { inquiries, deals, handleFreightDecision } = useTradingStore();

  const [search, setSearch] = useState("");
  const [decisionDeal, setDecisionDeal] = useState<Deal | null>(null);

  // ── Stats ────────────────────────────────────────────────────────
  const stats = {
    total: inquiries.length,
    received: inquiries.filter((i) => i.status === "inquiry_received").length,
    quoted: inquiries.filter((i) => i.status === "quoted").length,
    confirmed: deals.filter((d) => d.status === "deal_confirmed").length,
  };

  // ── Filtered inquiries ───────────────────────────────────────────
  const filtered = inquiries.filter((inq) => {
    const q = search.toLowerCase();
    return (
      !q ||
      inq.buyer.toLowerCase().includes(q) ||
      inq.product.toLowerCase().includes(q) ||
      inq.id.toLowerCase().includes(q)
    );
  });

  // ── Freight decision handler ─────────────────────────────────────
  const onFreightDecide = (freightByUs: boolean) => {
    if (!decisionDeal) return;
    handleFreightDecision(decisionDeal.id, freightByUs);
    setDecisionDeal(null);
    if (freightByUs) {
      // Auto-create freight inquiry from the deal and navigate to freight quotation step
      const destination =
        inquiries.find((i) => i.id === decisionDeal.inquiryId)
          ?.destinationCountry ?? "";
      const { createInquiryFromDeal } = useFreightStore.getState();
      const freightInquiry = createInquiryFromDeal({
        customer: decisionDeal.customer,
        product: decisionDeal.product,
        quantity: decisionDeal.quantity,
        origin: "Pakistan",
        destination,
        tradingDealId: decisionDeal.id,
      });
      navigate(`/freight/quotation/new?inquiryId=${freightInquiry.id}`);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <span className="rounded-[8px] bg-sky-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-sky-600">
              Import / Export
            </span>
            <h1 className="mt-1.5 text-[26px] font-bold tracking-[-0.04em] text-slate-900">
              Trading Operations
            </h1>
            <p className="mt-1 text-[14px] text-slate-500">
              Manage the full trading pipeline from inquiry to deal
              confirmation.
            </p>
          </div>
          <Button onClick={() => navigate("/trading/inquiry/new")}>
            <Plus className="h-4 w-4" />
            New Inquiry
          </Button>
        </div>

        {/* Pipeline KPI cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: "Total Inquiries",
              value: stats.total,
              icon: FileText,
              color: "bg-blue-50 text-blue-500",
            },
            {
              label: "Received",
              value: stats.received,
              icon: ClipboardCheck,
              color: "bg-amber-50 text-amber-500",
            },
            {
              label: "Quoted",
              value: stats.quoted,
              icon: TrendingUp,
              color: "bg-purple-50 text-purple-500",
            },
            {
              label: "Deals Confirmed",
              value: stats.confirmed,
              icon: Handshake,
              color: "bg-emerald-50 text-emerald-500",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-[16px] border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(22,31,54,0.05)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    {label}
                  </div>
                  <div className="mt-2 text-[28px] font-bold tracking-[-0.04em] text-slate-900">
                    {value}
                  </div>
                </div>
                <div
                  className={`grid h-11 w-11 place-items-center rounded-[12px] ${color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 rounded-[16px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by buyer, product, or inquiry ID..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Inquiries table */}
        <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-[0.14em] text-slate-400">
              <tr>
                <th className="px-4 py-3">Inquiry ID</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Salesperson</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((inq) => {
                  const deal = deals.find((d) => d.inquiryId === inq.id);
                  const showDecision =
                    deal?.status === "deal_confirmed" &&
                    !deal.freightHandledByUs;

                  return (
                    <tr
                      key={inq.id}
                      className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                      onClick={() => navigate(`/trading/inquiry/${inq.id}`)}
                    >
                      <td className="px-4 py-3 font-mono text-[12px] font-semibold text-blue-600">
                        {inq.id}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {inq.buyer}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {inq.product}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {inq.quantity.toLocaleString()} {inq.unit}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {inq.destinationCountry}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {inq.assignedSalesperson}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={inq.status} />
                      </td>
                      <td
                        className="px-4 py-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-end gap-2">
                          {inq.status === "inquiry_received" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/trading/quotation/new?inquiryId=${inq.id}`,
                                )
                              }
                            >
                              Quote
                            </Button>
                          )}
                          {inq.status === "quoted" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(`/trading/pi/new?inquiryId=${inq.id}`)
                              }
                            >
                              Issue PI
                            </Button>
                          )}
                          {inq.status === "pi_issued" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(`/trading/po/new?inquiryId=${inq.id}`)
                              }
                            >
                              Record PO
                            </Button>
                          )}
                          {inq.status === "po_received" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/trading/deal/new?inquiryId=${inq.id}`,
                                )
                              }
                            >
                              Confirm Deal
                            </Button>
                          )}
                          {showDecision && deal && (
                            <Button
                              size="sm"
                              onClick={() => setDecisionDeal(deal)}
                            >
                              Freight Decision
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    No inquiries found. Start by creating a new inquiry.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Step 6 Decision Dialog */}
      <ShipmentDecisionDialog
        open={!!decisionDeal}
        deal={decisionDeal}
        onClose={() => setDecisionDeal(null)}
        onDecide={onFreightDecide}
      />
    </AppLayout>
  );
}
