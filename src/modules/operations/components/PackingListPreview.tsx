// src/modules/operations/components/PackingListPreview.tsx
import type { PackingListForm, PackageRow } from "../types";

function calcTotals(packages: PackageRow[]) {
  let totalQty = 0,
    totalGross = 0,
    totalNet = 0,
    totalVol = 0;
  packages.forEach((pkg) => {
    const qty = parseFloat(pkg.quantity) || 0;
    totalQty += qty;
    totalGross += (parseFloat(pkg.grossWeight) || 0) * qty;
    totalNet += (parseFloat(pkg.netWeight) || 0) * qty;
    const l = parseFloat(pkg.length) || 0;
    const w = parseFloat(pkg.width) || 0;
    const h = parseFloat(pkg.height) || 0;
    const divisor = pkg.unit === "cm" ? 1_000_000 : 1728;
    totalVol += (l * w * h * qty) / divisor;
  });
  return { totalQty, totalGross, totalNet, totalVol };
}

function fmt(n: number, decimals = 2) {
  return n.toFixed(decimals);
}

type Props = { form: PackingListForm };

export function PackingListPreview({ form }: Props) {
  const totals = calcTotals(form.packages);

  return (
    <div className="rounded-[18px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
      {/* Doc Header */}
      <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-500">
            FreightOS
          </div>
          <div className="mt-1 text-[22px] font-bold tracking-[-0.03em] text-slate-900">
            Packing List
          </div>
        </div>
        <div className="text-right text-[13px]">
          <div className="font-bold text-slate-900">
            {form.plNumber || "PL-XXXX-XXX"}
          </div>
          <div className="text-slate-400">
            Date:{" "}
            {form.date
              ? new Date(form.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </div>
        </div>
      </div>

      <div className="space-y-4 px-6 py-5">
        {/* Parties */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[12px] bg-slate-50 p-4">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Shipper / Exporter
            </div>
            <div className="text-[13px] font-semibold text-slate-900">
              {form.shipperName || <span className="text-slate-300">—</span>}
            </div>
            <div className="mt-1 whitespace-pre-line text-[12px] leading-relaxed text-slate-500">
              {form.shipperAddress}
            </div>
          </div>
          <div className="rounded-[12px] bg-slate-50 p-4">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Consignee
            </div>
            <div className="text-[13px] font-semibold text-slate-900">
              {form.consigneeName || <span className="text-slate-300">—</span>}
            </div>
            <div className="mt-1 whitespace-pre-line text-[12px] leading-relaxed text-slate-500">
              {form.consigneeAddress}
            </div>
          </div>
        </div>

        {/* Shipment Details */}
        <div className="grid grid-cols-3 gap-3 rounded-[12px] border border-slate-100 bg-slate-50 p-4 text-[12px]">
          {[
            ["Vessel / Flight", form.vesselFlight],
            ["Port of Loading", form.portOfLoading],
            ["Port of Discharge", form.portOfDischarge],
            ["Final Destination", form.finalDestination],
            ["HS Code", form.hsCode],
            ["Marks & Numbers", form.marksNumbers],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                {label}
              </div>
              <div className="mt-0.5 font-medium text-slate-800">
                {value || <span className="text-slate-300">—</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Packages Table */}
        <div className="overflow-hidden rounded-[12px] border border-slate-200">
          <table className="w-full border-collapse text-[12px]">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              <tr>
                <th className="px-3 py-2.5 text-left">#</th>
                <th className="px-3 py-2.5 text-left">Description</th>
                <th className="px-3 py-2.5 text-right">Qty</th>
                <th className="px-3 py-2.5 text-right">G.W (kg)</th>
                <th className="px-3 py-2.5 text-right">N.W (kg)</th>
                <th className="px-3 py-2.5 text-right">Dimensions (L×W×H)</th>
              </tr>
            </thead>
            <tbody>
              {form.packages.map((pkg, i) => (
                <tr key={pkg.id} className="border-t border-slate-100">
                  <td className="px-3 py-2.5 text-slate-400">{i + 1}</td>
                  <td className="px-3 py-2.5 text-slate-800">
                    {pkg.description || (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right text-slate-800">
                    {pkg.quantity || "—"}
                  </td>
                  <td className="px-3 py-2.5 text-right text-slate-800">
                    {pkg.grossWeight || "—"}
                  </td>
                  <td className="px-3 py-2.5 text-right text-slate-800">
                    {pkg.netWeight || "—"}
                  </td>
                  <td className="px-3 py-2.5 text-right text-slate-500">
                    {pkg.length && pkg.width && pkg.height
                      ? `${pkg.length}×${pkg.width}×${pkg.height} ${pkg.unit}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-blue-50 text-[11px] font-bold text-slate-700">
              <tr>
                <td colSpan={2} className="px-3 py-2.5">
                  TOTALS
                </td>
                <td className="px-3 py-2.5 text-right">{totals.totalQty}</td>
                <td className="px-3 py-2.5 text-right">
                  {fmt(totals.totalGross)} kg
                </td>
                <td className="px-3 py-2.5 text-right">
                  {fmt(totals.totalNet)} kg
                </td>
                <td className="px-3 py-2.5 text-right">
                  {fmt(totals.totalVol, 3)} m³
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {form.notes && (
          <div className="rounded-[12px] bg-slate-50 p-4 text-[12px] text-slate-600">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Notes
            </div>
            <p className="whitespace-pre-line">{form.notes}</p>
          </div>
        )}

        <div className="border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400">
          This packing list is prepared by FreightOS — Document ID:{" "}
          {form.plNumber}
        </div>
      </div>
    </div>
  );
}
