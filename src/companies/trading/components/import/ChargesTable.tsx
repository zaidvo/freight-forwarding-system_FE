// src/companies/trading/components/import/ChargesTable.tsx

import { Plus, Trash2 } from "lucide-react";
import type { ChargeLine } from "../../types/importTypes";
import { generateChargeId, numberToWords } from "../../store/importStore";

type Props = {
  charges: ChargeLine[];
  onChange: (charges: ChargeLine[]) => void;
  readOnly?: boolean;
};

export default function ChargesTable({
  charges,
  onChange,
  readOnly = false,
}: Props) {
  const addRow = () => {
    onChange([
      ...charges,
      {
        id: generateChargeId(),
        chargeName: "",
        rate: 0,
        quantity: 1,
        amount: 0,
      },
    ]);
  };

  const removeRow = (id: string) => {
    onChange(charges.filter((c) => c.id !== id));
  };

  const updateRow = (
    id: string,
    field: keyof ChargeLine,
    value: string | number
  ) => {
    onChange(
      charges.map((c) => {
        if (c.id !== id) return c;
        const updated = { ...c, [field]: value };
        // Recalculate amount
        if (field === "rate" || field === "quantity") {
          updated.amount = updated.rate * updated.quantity;
        }
        return updated;
      })
    );
  };

  const subtotal = charges.reduce((s, c) => s + (c.amount || 0), 0);
  const totalAmount = subtotal;
  const grandTotal = totalAmount;

  const inputClasses =
    "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[13px] font-semibold text-slate-700">
          Charges
        </h4>
        {!readOnly && (
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[12px] font-medium text-blue-600 transition hover:bg-blue-100"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Charge
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-3 py-2.5 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">
                Charge Name
              </th>
              <th className="px-3 py-2.5 font-semibold text-slate-500 text-[11px] uppercase tracking-wider text-right">
                Rate
              </th>
              <th className="px-3 py-2.5 font-semibold text-slate-500 text-[11px] uppercase tracking-wider text-right">
                Quantity
              </th>
              <th className="px-3 py-2.5 font-semibold text-slate-500 text-[11px] uppercase tracking-wider text-right">
                Amount
              </th>
              {!readOnly && <th className="w-10 px-3 py-2.5" />}
            </tr>
          </thead>
          <tbody>
            {charges.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-100 last:border-b-0 hover:bg-blue-50/30 transition-colors"
              >
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className="text-slate-800">{row.chargeName}</span>
                  ) : (
                    <input
                      className={inputClasses}
                      value={row.chargeName}
                      onChange={(e) =>
                        updateRow(row.id, "chargeName", e.target.value)
                      }
                      placeholder="Charge name"
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className="text-slate-800 text-right block">
                      {row.rate.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  ) : (
                    <input
                      type="number"
                      className={`${inputClasses} text-right`}
                      value={row.rate || ""}
                      onChange={(e) =>
                        updateRow(
                          row.id,
                          "rate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className="text-slate-800 text-right block">
                      {row.quantity}
                    </span>
                  ) : (
                    <input
                      type="number"
                      className={`${inputClasses} text-right`}
                      value={row.quantity || ""}
                      onChange={(e) =>
                        updateRow(
                          row.id,
                          "quantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  )}
                </td>
                <td className="px-3 py-2 text-right font-medium text-slate-800">
                  {(row.rate * row.quantity).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </td>
                {!readOnly && (
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="grid h-7 w-7 place-items-center rounded-lg text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {charges.length === 0 && (
              <tr>
                <td
                  colSpan={readOnly ? 4 : 5}
                  className="px-4 py-8 text-center text-[13px] text-slate-400"
                >
                  No charges added yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals summary */}
      {charges.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 space-y-1.5">
          <div className="flex justify-between text-[13px]">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-medium text-slate-800">
              {subtotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-slate-500">Total Amount</span>
            <span className="font-medium text-slate-800">
              {totalAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="border-t border-slate-200 pt-1.5 flex justify-between text-[14px]">
            <span className="font-semibold text-slate-700">Grand Total</span>
            <span className="font-bold text-slate-900">
              {grandTotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="border-t border-slate-200 pt-1.5">
            <p className="text-[11px] text-slate-500 italic">
              Amount in words: {numberToWords(grandTotal)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
