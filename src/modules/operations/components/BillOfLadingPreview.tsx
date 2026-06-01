// src/modules/operations/components/BillOfLadingPreview.tsx
import type { BillOfLadingForm } from "../types";

type Props = { form: BillOfLadingForm };

export function BillOfLadingPreview({ form }: Props) {
  return (
    <div className="rounded-[18px] border-2 border-slate-300 bg-white shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
      {/* Official header */}
      <div className="border-b-2 border-slate-300 bg-slate-900 px-6 py-4 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              FreightOS — Shipping Division
            </div>
            <div className="mt-1 text-[20px] font-bold tracking-[-0.02em]">
              BILL OF LADING
            </div>
            <div className="mt-0.5 text-[11px] text-slate-400">
              Original — Not Negotiable
            </div>
          </div>
          <div className="text-right text-[12px]">
            <div className="text-slate-400">B/L No.</div>
            <div className="mt-0.5 text-[16px] font-bold">
              {form.blNumber || "BL-XXXX-XXX"}
            </div>
            <div className="mt-1 text-slate-400">
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
      </div>

      <div className="space-y-0 divide-y divide-slate-200">
        {/* Shipper & Consignee */}
        <div className="grid grid-cols-2 divide-x divide-slate-200">
          <div className="p-4">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              1. Shipper / Exporter
            </div>
            <div className="text-[13px] font-semibold text-slate-900">
              {form.shipperName || <span className="text-slate-300">—</span>}
            </div>
            <div className="mt-1 whitespace-pre-line text-[12px] text-slate-500">
              {form.shipperAddress}
            </div>
          </div>
          <div className="p-4">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              2. Consignee
            </div>
            <div className="text-[13px] font-semibold text-slate-900">
              {form.consigneeName || <span className="text-slate-300">—</span>}
            </div>
            <div className="mt-1 whitespace-pre-line text-[12px] text-slate-500">
              {form.consigneeAddress}
            </div>
          </div>
        </div>

        {/* Notify Party & Booking Ref */}
        <div className="grid grid-cols-2 divide-x divide-slate-200">
          <div className="p-4">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              3. Notify Party
            </div>
            <div className="text-[13px] font-semibold text-slate-900">
              {form.notifyPartyName || (
                <span className="text-slate-300">—</span>
              )}
            </div>
            <div className="mt-1 whitespace-pre-line text-[12px] text-slate-500">
              {form.notifyPartyAddress}
            </div>
          </div>
          <div className="p-4">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              4. Booking Reference
            </div>
            <div className="text-[13px] font-semibold text-slate-900">
              {form.bookingRef || <span className="text-slate-300">—</span>}
            </div>
          </div>
        </div>

        {/* Vessel */}
        <div className="grid grid-cols-4 divide-x divide-slate-200">
          {[
            ["5. Vessel Name", form.vesselName],
            ["6. Voyage No.", form.voyageNo],
            ["7. Flag", form.flag],
            ["8. Container Type", form.containerType],
          ].map(([label, value]) => (
            <div key={label} className="p-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                {label}
              </div>
              <div className="mt-0.5 text-[12px] font-semibold text-slate-800">
                {value || <span className="text-slate-300">—</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Ports */}
        <div className="grid grid-cols-4 divide-x divide-slate-200">
          {[
            ["9. Place of Receipt", form.placeOfReceipt],
            ["10. Port of Loading", form.portOfLoading],
            ["11. Port of Discharge", form.portOfDischarge],
            ["12. Place of Delivery", form.placeOfDelivery],
          ].map(([label, value]) => (
            <div key={label} className="p-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                {label}
              </div>
              <div className="mt-0.5 text-[12px] font-semibold text-slate-800">
                {value || <span className="text-slate-300">—</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Cargo Table */}
        <div className="overflow-hidden">
          <table className="w-full border-collapse text-[11px]">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              <tr className="divide-x divide-slate-200">
                <th className="px-3 py-2.5 text-left">13. Container No.</th>
                <th className="px-3 py-2.5 text-left">Seal No.</th>
                <th className="px-3 py-2.5 text-left">Marks & Numbers</th>
                <th className="px-3 py-2.5 text-left">Description</th>
                <th className="px-3 py-2.5 text-left">HS Code</th>
                <th className="px-3 py-2.5 text-right">Pkgs</th>
                <th className="px-3 py-2.5 text-right">G.W (kg)</th>
                <th className="px-3 py-2.5 text-right">Meas (m³)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="divide-x divide-slate-200 border-t border-slate-200">
                <td className="px-3 py-3 font-semibold text-slate-800">
                  {form.containerNo || (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="px-3 py-3 text-slate-600">
                  {form.sealNo || <span className="text-slate-300">—</span>}
                </td>
                <td className="px-3 py-3 text-slate-600">
                  {form.marksNumbers || (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="px-3 py-3 text-slate-800">
                  {form.description || (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="px-3 py-3 text-slate-600">
                  {form.hsCode || <span className="text-slate-300">—</span>}
                </td>
                <td className="px-3 py-3 text-right text-slate-800">
                  {form.noOfPackages || "—"}
                </td>
                <td className="px-3 py-3 text-right text-slate-800">
                  {form.grossWeight || "—"}
                </td>
                <td className="px-3 py-3 text-right text-slate-800">
                  {form.measurement || "—"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Freight Terms */}
        <div className="grid grid-cols-2 divide-x divide-slate-200">
          <div className="p-4">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              14. Freight Terms
            </div>
            <div className="mt-1 flex gap-4 text-[12px]">
              {(["prepaid", "collect"] as const).map((t) => (
                <span
                  key={t}
                  className={`rounded-[6px] px-2.5 py-1 font-semibold capitalize ${form.freightTerms === t ? "bg-blue-100 text-blue-700" : "text-slate-400"}`}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="p-4">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              15. Freight Amount
            </div>
            <div className="text-[13px] font-semibold text-slate-900">
              {form.freightAmount ? (
                `USD ${form.freightAmount}`
              ) : (
                <span className="text-slate-300">—</span>
              )}
            </div>
          </div>
        </div>

        {form.remarks && (
          <div className="p-4">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              16. Remarks
            </div>
            <p className="whitespace-pre-line text-[12px] text-slate-600">
              {form.remarks}
            </p>
          </div>
        )}

        {/* Signatures */}
        <div className="grid grid-cols-2 divide-x divide-slate-200">
          <div className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Shipper Signature
            </div>
            <div className="mt-8 border-t border-slate-300 pt-1 text-[11px] text-slate-400">
              Authorized Signature & Stamp
            </div>
          </div>
          <div className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Carrier / Agent Signature
            </div>
            <div className="mt-8 border-t border-slate-300 pt-1 text-[11px] text-slate-400">
              Authorized Signature & Stamp
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
