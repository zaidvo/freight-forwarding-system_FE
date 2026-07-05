// src/companies/trading/components/import/ContainerTable.tsx

import { Plus, Trash2 } from "lucide-react";
import type { ContainerRow } from "../../types/importTypes";
import { generateContainerId } from "../../store/importStore";

type Props = {
  containers: ContainerRow[];
  onChange: (containers: ContainerRow[]) => void;
  readOnly?: boolean;
};

const SIZES = ["20'", "40'", "40'HC", "45'"];

export default function ContainerTable({
  containers,
  onChange,
  readOnly = false,
}: Props) {
  const addRow = () => {
    onChange([
      ...containers,
      {
        id: generateContainerId(),
        containerNo: "",
        size: "20'",
        sealNo: "",
        packages: 0,
        grossWeight: 0,
        netWeight: 0,
        cbm: 0,
      },
    ]);
  };

  const removeRow = (id: string) => {
    onChange(containers.filter((c) => c.id !== id));
  };

  const updateRow = (
    id: string,
    field: keyof ContainerRow,
    value: string | number
  ) => {
    onChange(
      containers.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      )
    );
  };

  const inputClasses =
    "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100";

  const numInputClasses = `${inputClasses} text-right`;

  const totalPackages = containers.reduce((s, c) => s + (c.packages || 0), 0);
  const totalGross = containers.reduce((s, c) => s + (c.grossWeight || 0), 0);
  const totalNet = containers.reduce((s, c) => s + (c.netWeight || 0), 0);
  const totalCbm = containers.reduce((s, c) => s + (c.cbm || 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[13px] font-semibold text-slate-700">
          Container Details
        </h4>
        {!readOnly && (
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[12px] font-medium text-blue-600 transition hover:bg-blue-100"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Container
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-3 py-2.5 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">
                Container No
              </th>
              <th className="px-3 py-2.5 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">
                Size
              </th>
              <th className="px-3 py-2.5 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">
                Seal No
              </th>
              <th className="px-3 py-2.5 font-semibold text-slate-500 text-[11px] uppercase tracking-wider text-right">
                Packages
              </th>
              <th className="px-3 py-2.5 font-semibold text-slate-500 text-[11px] uppercase tracking-wider text-right">
                Gross Wt (kg)
              </th>
              <th className="px-3 py-2.5 font-semibold text-slate-500 text-[11px] uppercase tracking-wider text-right">
                Net Wt (kg)
              </th>
              <th className="px-3 py-2.5 font-semibold text-slate-500 text-[11px] uppercase tracking-wider text-right">
                CBM
              </th>
              {!readOnly && (
                <th className="w-10 px-3 py-2.5" />
              )}
            </tr>
          </thead>
          <tbody>
            {containers.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-100 last:border-b-0 hover:bg-blue-50/30 transition-colors"
              >
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className="text-slate-800">{row.containerNo}</span>
                  ) : (
                    <input
                      className={inputClasses}
                      value={row.containerNo}
                      onChange={(e) =>
                        updateRow(row.id, "containerNo", e.target.value)
                      }
                      placeholder="e.g. MSCU1234567"
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className="text-slate-800">{row.size}</span>
                  ) : (
                    <select
                      className={inputClasses}
                      value={row.size}
                      onChange={(e) =>
                        updateRow(row.id, "size", e.target.value)
                      }
                    >
                      {SIZES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className="text-slate-800">{row.sealNo}</span>
                  ) : (
                    <input
                      className={inputClasses}
                      value={row.sealNo}
                      onChange={(e) =>
                        updateRow(row.id, "sealNo", e.target.value)
                      }
                      placeholder="Seal No"
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className="text-slate-800 text-right block">
                      {row.packages.toLocaleString()}
                    </span>
                  ) : (
                    <input
                      type="number"
                      className={numInputClasses}
                      value={row.packages || ""}
                      onChange={(e) =>
                        updateRow(
                          row.id,
                          "packages",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className="text-slate-800 text-right block">
                      {row.grossWeight.toLocaleString()}
                    </span>
                  ) : (
                    <input
                      type="number"
                      className={numInputClasses}
                      value={row.grossWeight || ""}
                      onChange={(e) =>
                        updateRow(
                          row.id,
                          "grossWeight",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className="text-slate-800 text-right block">
                      {row.netWeight.toLocaleString()}
                    </span>
                  ) : (
                    <input
                      type="number"
                      className={numInputClasses}
                      value={row.netWeight || ""}
                      onChange={(e) =>
                        updateRow(
                          row.id,
                          "netWeight",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className="text-slate-800 text-right block">
                      {row.cbm.toLocaleString()}
                    </span>
                  ) : (
                    <input
                      type="number"
                      className={numInputClasses}
                      value={row.cbm || ""}
                      onChange={(e) =>
                        updateRow(
                          row.id,
                          "cbm",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  )}
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
            {containers.length === 0 && (
              <tr>
                <td
                  colSpan={readOnly ? 7 : 8}
                  className="px-4 py-8 text-center text-[13px] text-slate-400"
                >
                  No containers added yet
                </td>
              </tr>
            )}
          </tbody>
          {containers.length > 0 && (
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50/80">
                <td
                  colSpan={3}
                  className="px-3 py-2.5 text-[12px] font-bold uppercase tracking-wider text-slate-500"
                >
                  Totals
                </td>
                <td className="px-3 py-2.5 text-right text-[13px] font-bold text-slate-800">
                  {totalPackages.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right text-[13px] font-bold text-slate-800">
                  {totalGross.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right text-[13px] font-bold text-slate-800">
                  {totalNet.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right text-[13px] font-bold text-slate-800">
                  {totalCbm.toLocaleString()}
                </td>
                {!readOnly && <td />}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
