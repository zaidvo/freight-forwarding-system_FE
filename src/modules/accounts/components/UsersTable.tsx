import { Building2, Layers3, PencilLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { User } from "../types";
import { StatusPill } from "./StatusPill";

type UsersTableProps = {
  users: User[];
  getGroupNames: (user: User) => string[];
  onEdit: (u: User) => void;
  onGroups: (u: User) => void;
  onDelete: (u: User) => void;
};

export function UsersTable({
  users,
  getGroupNames,
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
            <th className="px-4 py-3">Department</th>
            <th className="px-4 py-3">Groups</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Last active</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const groupNames = getGroupNames(user);
            return (
              <tr key={user.id} className="border-t border-slate-100">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-[13px] font-bold text-blue-600">
                      {user.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {user.name}
                      </div>
                      <div className="text-[12px] text-slate-400">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-300" />
                    <span>{user.department}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    {groupNames.length ? (
                      groupNames.map((groupName) => (
                        <span
                          key={groupName}
                          className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                        >
                          {groupName}
                        </span>
                      ))
                    ) : (
                      <span className="text-[12px] text-slate-400">
                        No groups
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <StatusPill status={user.status} />
                </td>
                <td className="px-4 py-4 text-slate-500">{user.lastActive}</td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-1.5">
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
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
