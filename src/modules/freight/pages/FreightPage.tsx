// src/modules/freight/pages/FreightPage.tsx
//
// BE integration:
//   On mount: fetch GET /api/v1/freight/inquiries and GET /api/v1/freight/shipments
//   Replace store data with API responses

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

  const stats = {
    totalShipments: shipments.length,
    inTransit: shipments.filter((s) => s.status === "in_transit").length,
    awaitingDocs: shipments.filter((s) => s.documents.some((d) => !d.fileUrl))
      .length,
    completed: shipments.filter((s) => s.status === "completed").length,
  };

  const filtered = shipments.filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      s.id.toLowerCase().includes(q) ||
      s.customer.toLowerCase().includes(q) ||
      s.containerNumber.toLowerCase().includes(q)
    );
  });

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
              <Plus className="h-4 w-4" />
              New Inquiry
            </Button>
            <Button onClick={() => navigate("/freight/shipment/new")}>
              <Ship className="h-4 w-4" />
              New Shipment
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

        {/* Search */}
        <div className="flex items-center gap-3 rounded-[16px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by shipment ID, customer, or container number..."
              className="pl-9"
            />
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/freight/inquiry/new")}
          >
            View Inquiries ({inquiries.length})
          </Button>
        </div>

        {/* Shipments Table */}
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
              {filtered.length ? (
                filtered.map((shp) => {
                  const docsUploaded = shp.documents.filter(
                    (d) => d.fileUrl
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
                      <td className="px-4 py-3 text-slate-500 text-[12px]">
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
                        <div className="flex justify-end gap-2">
                          {!isLocked && (
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
                          {isLocked && (
                            <span className="text-[12px] font-semibold text-slate-400">
                              Closed
                            </span>
                          )}
                        </div>
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
      </div>
    </AppLayout>
  );
}
