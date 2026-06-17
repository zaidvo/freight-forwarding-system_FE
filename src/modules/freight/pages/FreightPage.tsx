// src/modules/freight/pages/FreightPage.tsx
//
// Freight hub — two tabs: Shipments and Inquiries.
// Inquiries tab shows "Next Step" action per status so the workflow is always one click away.
//
// BE integration:
//   GET /api/v1/freight/inquiries   → replace store data
//   GET /api/v1/freight/shipments   → replace store data

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Ship, Package, Truck, CheckCircle } from "lucide-react";
import { useFreightStore } from "../store/freightStore";
import { FreightStatusBadge } from "../components/FreightStatusBadge";

export default function FreightPage() {
  const navigate = useNavigate();
  const { shipments, inquiries } = useFreightStore();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"shipments" | "inquiries">("shipments");

  const stats = {
    totalShipments: shipments.length,
    inTransit: shipments.filter((s) => s.status === "in_transit").length,
    awaitingDocs: shipments.filter((s) => s.documents.some((d) => !d.fileUrl))
      .length,
    completed: shipments.filter((s) => s.status === "completed").length,
  };

  const filteredShipments = shipments.filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      s.id.toLowerCase().includes(q) ||
      s.customer.toLowerCase().includes(q) ||
      s.containerNumber.toLowerCase().includes(q)
    );
  });

  const filteredInquiries = inquiries.filter((i) => {
    const q = search.toLowerCase();
    return (
      !q ||
      i.id.toLowerCase().includes(q) ||
      i.customer.toLowerCase().includes(q) ||
      i.commodity.toLowerCase().includes(q)
    );
  });

  // Next action button per inquiry status
  const getInquiryAction = (status: string, id: string) => {
    switch (status) {
      case "inquiry":
        return {
          label: "Create Quotation",
          route: `/freight/quotation/new?inquiryId=${id}`,
        };
      case "quoted":
        return {
          label: "Book Shipment",
          route: `/freight/booking/new?inquiryId=${id}`,
        };
      case "booked":
        return {
          label: "Create Shipment",
          route: `/freight/shipment/new?inquiryId=${id}`,
        };
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <span className="rounded-[8px] bg-emerald-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-600">
              Freight Forwarding
            </span>
            <h1 className="mt-1.5 text-[26px] font-bold tracking-[-0.04em] text-slate-900">
              Freight Operations
            </h1>
            <p className="mt-1 text-[14px] text-slate-500">
              Manage inquiries, shipments, tracking, documentation and finance.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate("/freight/inquiry/new")}
            >
              <Plus className="h-4 w-4" /> New Inquiry
            </Button>
            <Button onClick={() => navigate("/freight/shipment/new")}>
              <Ship className="h-4 w-4" /> New Shipment
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: "Total Shipments",
              value: stats.totalShipments,
              icon: Package,
              color: "bg-blue-50 text-blue-500",
            },
            {
              label: "In Transit",
              value: stats.inTransit,
              icon: Ship,
              color: "bg-sky-50 text-sky-500",
            },
            {
              label: "Awaiting Docs",
              value: stats.awaitingDocs,
              icon: Truck,
              color: "bg-amber-50 text-amber-500",
            },
            {
              label: "Completed",
              value: stats.completed,
              icon: CheckCircle,
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

        {/* Tabs + Search bar */}
        <div className="flex items-center gap-3 rounded-[16px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
          <div className="flex gap-2 shrink-0">
            {(["shipments", "inquiries"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-[10px] px-3 py-1.5 text-[13px] font-semibold capitalize transition ${
                  tab === t
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {t} ({t === "shipments" ? shipments.length : inquiries.length})
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                tab === "shipments"
                  ? "Search by ID, customer, container..."
                  : "Search by ID, customer, commodity..."
              }
              className="pl-9"
            />
          </div>
        </div>

        {/* ── SHIPMENTS TABLE ── */}
        {tab === "shipments" && (
          <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-[0.14em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">Shipment ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Container</th>
                  <th className="px-4 py-3">ETD</th>
                  <th className="px-4 py-3">ETA</th>
                  <th className="px-4 py-3">Docs</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.length ? (
                  filteredShipments.map((shp) => {
                    const docsUploaded = shp.documents.filter(
                      (d) => d.fileUrl,
                    ).length;
                    const totalDocs = shp.documents.length;
                    const isLocked = shp.status === "completed";
                    return (
                      <tr
                        key={shp.id}
                        className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                        onClick={() => navigate(`/freight/shipment/${shp.id}`)}
                      >
                        <td className="px-4 py-3 font-mono text-[12px] font-semibold text-emerald-600">
                          {shp.id}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {shp.customer}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-slate-500">
                          {shp.origin} → {shp.destination}
                        </td>
                        <td className="px-4 py-3 font-mono text-[12px] text-slate-600">
                          {shp.containerNumber || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{shp.etd}</td>
                        <td className="px-4 py-3 text-slate-500">{shp.eta}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-16 rounded-full bg-slate-100">
                              <div
                                className="h-1.5 rounded-full bg-emerald-400"
                                style={{
                                  width: `${(docsUploaded / totalDocs) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {docsUploaded}/{totalDocs}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <FreightStatusBadge status={shp.status} />
                        </td>
                        <td
                          className="px-4 py-3 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isLocked ? (
                            <span className="text-[12px] font-semibold text-slate-400">
                              Closed
                            </span>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(`/freight/shipment/${shp.id}`)
                              }
                            >
                              View
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-10 text-center text-slate-400"
                    >
                      No shipments found. Create a new inquiry or shipment to
                      begin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── INQUIRIES TABLE ── */}
        {tab === "inquiries" && (
          <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-[0.14em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">Inquiry ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Commodity</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Next Step</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.length ? (
                  filteredInquiries.map((inq) => {
                    const action = getInquiryAction(inq.status, inq.id);
                    return (
                      <tr
                        key={inq.id}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 font-mono text-[12px] font-semibold text-emerald-600">
                          {inq.id}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {inq.customer}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {inq.commodity}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-slate-500">
                          {inq.origin} → {inq.destination}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{inq.mode}</td>
                        <td className="px-4 py-3">
                          {inq.fromTradingDealId ? (
                            <span className="rounded-[5px] bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-600">
                              From Deal
                            </span>
                          ) : (
                            <span className="rounded-[5px] bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                              Manual
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <FreightStatusBadge status={inq.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          {action ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(action.route)}
                            >
                              {action.label}
                            </Button>
                          ) : (
                            <span className="text-[12px] text-slate-400">
                              —
                            </span>
                          )}
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
                      No inquiries found. Start with a new inquiry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
