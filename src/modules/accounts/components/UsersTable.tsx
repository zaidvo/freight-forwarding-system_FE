import { CalendarClock, Layers3, PencilLine, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { User } from "../types";
import { StatusPill } from "./StatusPill";

type UsersTableProps = {
  users: User[];
  onEdit: (u: User) => void;
  onGroups: (u: User) => void;
  onDelete: (u: User) => void;
};

export function UsersTable({
  users,
  onEdit,
  onGroups,
  onDelete,
}: UsersTableProps) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-[0.14em] text-slate-400">
          <tr>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created by</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Last active</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length ? (
            users.map((user) => (
              <tr key={user.id} className="border-t border-slate-100">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-[13px] font-bold text-blue-600">
                      {user.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {user.full_name}
                      </div>
                      <div className="text-[12px] text-slate-400">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-slate-600">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-slate-300" />
                    <span className="capitalize">
                      {user.role.replace("_", " ")}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <StatusPill status={user.status} />
                </td>
                <td className="px-4 py-4 text-slate-500">
                  {user.created_by_name}
                </td>
                <td className="px-4 py-4 text-slate-500">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-slate-300" />
                    {formatDate(user.created_at)}
                  </div>
                </td>
                <td className="px-4 py-4 text-slate-500">{user.lastActive}</td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-1.5">
                    {user.role !== "root" ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(user)}
                        >
                          <PencilLine className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onGroups(user)}
                        >
                          <Layers3 className="h-3.5 w-3.5" />
                          Groups
                        </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(user)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                      </>
                    ) : (
                      <span className="text-[12px] font-semibold text-slate-400">
                        Protected
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr className="border-t border-slate-100">
              <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
