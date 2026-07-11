import type { ActivityLogCategory } from "@/shared/services/activityLogService";
import type { AuditLog } from "../types";
import ActionBadge from "./ActionBadge";

type AuditLogTableProps = {
  logs: AuditLog[];
  loading?: boolean;
  error?: string | null;
  filter: ActivityLogCategory;
  onFilterChange: (filter: ActivityLogCategory) => void;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
};

const FILTERS: Array<{ key: ActivityLogCategory; label: string; hint: string }> = [
  { key: "important", label: "Important", hint: "Hide normal sign-ins" },
  { key: "account", label: "Account", hint: "Users and access" },
  { key: "security", label: "Security", hint: "Failures and password activity" },
  { key: "auth", label: "Auth", hint: "Sign-ins and sign-outs" },
  { key: "all", label: "All", hint: "Everything" },
];

export default function AuditLogTable({
  logs,
  loading = false,
  error = null,
  filter,
  onFilterChange,
  page,
  totalPages,
  total,
  onPageChange,
}: AuditLogTableProps) {
  const safeTotalPages = Math.max(1, totalPages);

  return (
    <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-[15px] font-bold text-slate-900">Activity Log</h2>
          <p className="mt-1 text-[12px] text-slate-500">
            Showing real database activity with server-side filters and pagination.
          </p>
        </div>
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-[12px] border border-slate-200 bg-slate-50 p-1">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              title={item.hint}
              onClick={() => onFilterChange(item.key)}
              className={`shrink-0 rounded-[9px] px-3 py-1.5 text-[12px] font-semibold transition ${
                filter === item.key ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="px-6 py-12 text-center text-[13px] text-slate-500">Loading activity...</div>
      ) : error ? (
        <div className="px-6 py-8 text-[13px] text-rose-600">{error}</div>
      ) : logs.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-[14px] font-semibold text-slate-800">No matching activity</p>
          <p className="mt-1 text-[13px] text-slate-500">Try another filter to widen the list.</p>
        </div>
      ) : (
        <div className="max-h-[430px] divide-y divide-slate-100 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="grid gap-3 px-5 py-3 md:grid-cols-[190px_1fr_120px] md:items-center">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 text-[11px] font-bold text-blue-600">
                    {getInitials(log.actor)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-slate-900">{log.actor}</p>
                    <p className="text-[11px] text-slate-400">{log.timestamp}</p>
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <ActionBadge action={log.action} />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    {log.module}
                  </span>
                </div>
                <p className="text-[13px] leading-5 text-slate-600">{log.description}</p>
              </div>

              <div className="text-left md:text-right">
                <span className="inline-flex rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
                  {log.action === "login" ? "Auth" : log.module}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 text-[12px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {total === 0 ? "No records" : `Page ${page} of ${safeTotalPages} - ${total} record${total === 1 ? "" : "s"}`}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={loading || page <= 1}
            className="rounded-[10px] border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(safeTotalPages, page + 1))}
            disabled={loading || page >= safeTotalPages}
            className="rounded-[10px] border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

