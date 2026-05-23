import type { AuditLog } from "../types";
import ActionBadge from "./ActionBadge";

type AuditLogTableProps = {
  logs: AuditLog[];
};

export default function AuditLogTable({ logs }: AuditLogTableProps) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.14em] text-slate-400">
          <tr>
            <th className="px-4 py-3">Who</th>
            <th className="px-4 py-3">Action</th>
            <th className="px-4 py-3">Module</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-t border-slate-100">
              <td className="px-4 py-4 font-medium text-slate-900">
                {log.actor}
              </td>
              <td className="px-4 py-4">
                <ActionBadge action={log.action} />
              </td>
              <td className="px-4 py-4 text-slate-600">{log.module}</td>
              <td className="px-4 py-4 font-mono text-[12px] text-slate-500">
                {log.description}
              </td>
              <td className="px-4 py-4 text-slate-500">{log.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
