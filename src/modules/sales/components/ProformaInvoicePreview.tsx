// src/modules/sales/components/ProformaInvoicePreview.tsx
import type { ProformaInvoiceForm } from "../types";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  PKR: "₨",
  EUR: "€",
  GBP: "£",
};

function calcTotals(form: ProformaInvoiceForm) {
  const subtotal = form.items.reduce((sum, item) => {
    return (
      sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)
    );
  }, 0);
  const freight = parseFloat(form.freightCharges) || 0;
  const insurance = parseFloat(form.insuranceCharges) || 0;
  const other = parseFloat(form.otherCharges) || 0;
  return {
    subtotal,
    freight,
    insurance,
    other,
    total: subtotal + freight + insurance + other,
  };
}

function fmtCurrency(n: number, currency: string) {
  const sym = CURRENCY_SYMBOLS[currency] ?? "";
  return `${sym}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type Props = { form: ProformaInvoiceForm };

export function ProformaInvoicePreview({ form }: Props) {
  const totals = calcTotals(form);
  const sym = CURRENCY_SYMBOLS[form.currency] ?? "";

  return (
    <div className="rounded-[18px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-500">
            FreightOS — Sales Division
          </div>
          <div className="mt-1 text-[22px] font-bold tracking-[-0.03em] text-slate-900">
            Proforma Invoice
          </div>
        </div>
        <div className="text-right text-[13px]">
          <div className="font-bold text-slate-900">
            {form.piNumber || "PI-XXXX-XXX"}
          </div>
          <div className="mt-0.5 text-slate-400">
            Date:{" "}
            {form.date
              ? new Date(form.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </div>
          <div className="text-slate-400">
            Valid until:{" "}
            {form.validUntil
              ? new Date(form.validUntil).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </div>
        </div>
      </div>

      <div className="space-y-4 px-6 py-5">
        {/* Seller & Buyer */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[12px] bg-blue-50 p-4">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-400">
              Seller
            </div>
            <div className="text-[13px] font-semibold text-slate-900">
              {form.sellerName || <span className="text-slate-300">—</span>}
            </div>
            <div className="mt-1 whitespace-pre-line text-[12px] text-slate-600">
              {form.sellerAddress}
            </div>
            {form.sellerContact && (
              <div className="mt-1.5 text-[12px] text-blue-600">
                {form.sellerContact}
              </div>
            )}
          </div>
          <div className="rounded-[12px] bg-slate-50 p-4">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Buyer
            </div>
            <div className="text-[13px] font-semibold text-slate-900">
              {form.buyerName || <span className="text-slate-300">—</span>}
            </div>
            <div className="mt-1 whitespace-pre-line text-[12px] text-slate-500">
              {form.buyerAddress}
            </div>
            {form.buyerContact && (
              <div className="mt-1.5 text-[12px] text-slate-500">
                {form.buyerContact}
              </div>
            )}
          </div>
        </div>

        {/* Shipment Terms */}
        <div className="grid grid-cols-4 gap-3 rounded-[12px] border border-slate-100 bg-slate-50 p-3 text-[12px]">
          {[
            ["Port of Loading", form.portOfLoading],
            ["Port of Discharge", form.portOfDischarge],
            ["Incoterms", form.incoterms],
            ["Currency", form.currency],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                {label}
              </div>
              <div className="mt-0.5 font-semibold text-slate-800">
                {value || <span className="text-slate-300">—</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Line Items Table */}
        <div className="overflow-hidden rounded-[12px] border border-slate-200">
          <table className="w-full border-collapse text-[12px]">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              <tr>
                <th className="px-3 py-2.5 text-left">#</th>
                <th className="px-3 py-2.5 text-left">Description</th>
                <th className="px-3 py-2.5 text-right">Qty</th>
                <th className="px-3 py-2.5 text-right">Unit</th>
                <th className="px-3 py-2.5 text-right">Unit Price</th>
                <th className="px-3 py-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {form.items.map((item, i) => {
                const qty = parseFloat(item.quantity) || 0;
                const price = parseFloat(item.unitPrice) || 0;
                const amount = qty * price;
                return (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-3 py-2.5 text-slate-400">{i + 1}</td>
                    <td className="px-3 py-2.5 text-slate-800">
                      {item.description || (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-600">
                      {item.quantity || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-600">
                      {item.unit || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-600">
                      {item.unitPrice
                        ? `${sym}${parseFloat(item.unitPrice).toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-slate-800">
                      {amount > 0 ? fmtCurrency(amount, form.currency) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="ml-auto w-64 space-y-1.5 text-[13px]">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{fmtCurrency(totals.subtotal, form.currency)}</span>
          </div>
          {totals.freight > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Freight</span>
              <span>{fmtCurrency(totals.freight, form.currency)}</span>
            </div>
          )}
          {totals.insurance > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Insurance</span>
              <span>{fmtCurrency(totals.insurance, form.currency)}</span>
            </div>
          )}
          {totals.other > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Other Charges</span>
              <span>{fmtCurrency(totals.other, form.currency)}</span>
            </div>
          )}
          <div className="flex justify-between rounded-[10px] bg-blue-50 px-3 py-2.5 font-bold text-blue-700">
            <span>Total</span>
            <span>{fmtCurrency(totals.total, form.currency)}</span>
          </div>
        </div>

        {form.paymentTerms && (
          <div className="rounded-[12px] border border-amber-200 bg-amber-50 p-3 text-[12px]">
            <div className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-600">
              Payment Terms
            </div>
            <div className="text-slate-700">{form.paymentTerms}</div>
          </div>
        )}

        {form.bankDetails && (
          <div className="rounded-[12px] bg-slate-50 p-3 text-[12px]">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Bank Details
            </div>
            <p className="whitespace-pre-line text-slate-600">
              {form.bankDetails}
            </p>
          </div>
        )}

        {form.notes && (
          <div className="rounded-[12px] bg-slate-50 p-3 text-[12px]">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Notes
            </div>
            <p className="whitespace-pre-line text-slate-600">{form.notes}</p>
          </div>
        )}

        <div className="border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400">
          This proforma invoice is prepared by FreightOS — Document ID:{" "}
          {form.piNumber}
        </div>
      </div>
    </div>
  );
}
