import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  Download,
  FolderTree,
  Search,
  UserPlus,
  Users,
  UserCheck,
  Clock3,
} from "lucide-react";
import {
  DEPARTMENTS,
  SEED_AUDIT_LOGS,
  SEED_GROUPS,
  SEED_USERS,
  MODULE_ACCESS_OPTIONS,
} from "../data/seed";
import { UsersTable } from "../components/UsersTable";
import StatCard from "../components/StatCard";
import RolesPanel from "../components/RolesPanel";
import AuditLogTable from "../components/AuditLogTable";
import CreateUserDialog from "../components/CreateUserDialog";
import EditUserDialog from "../components/EditUserDialog";
import PermissionsDialog from "../components/PermissionsDialog";
import DeleteUserDialog from "../components/DeleteUserDialog";
import type {
  AuditAction,
  AuditLog,
  Group,
  User,
  UserInput,
  UserStatus,
} from "../types";

export default function AccountsPage() {
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [groups, setGroups] = useState<Group[]>(SEED_GROUPS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(SEED_AUDIT_LOGS);
  const [activeTab, setActiveTab] = useState<"users" | "groups" | "audit">(
    "users",
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [groupUser, setGroupUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const groupsById = useMemo(
    () => new Map(groups.map((group) => [group.id, group])),
    [groups],
  );

  const membersByGroup = useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach((user) => {
      user.groups.forEach((groupId) => {
        counts[groupId] = (counts[groupId] ?? 0) + 1;
      });
    });
    return counts;
  }, [users]);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesSearch =
          search.trim().length === 0 ||
          [user.name, user.email, user.department, user.role].some((field) =>
            field.toLowerCase().includes(search.toLowerCase()),
          );
        const matchesStatus =
          statusFilter === "all" || user.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [search, statusFilter, users],
  );

  const stats = useMemo(
    () => ({
      totalUsers: users.length,
      activeUsers: users.filter((user) => user.status === "active").length,
      groupsDefined: groups.length,
      pendingInvites: users.filter((user) => user.status === "pending").length,
    }),
    [groups.length, users],
  );

  const getGroupNames = (user: User) =>
    user.groups
      .map((groupId) => groupsById.get(groupId)?.name)
      .filter(Boolean) as string[];

  const appendAudit = (
    action: AuditAction,
    module: string,
    description: string,
  ) => {
    setAuditLogs((current) => [
      {
        id: crypto.randomUUID(),
        actor: "Alex Morgan",
        action,
        module,
        description,
        timestamp: "Just now",
      },
      ...current,
    ]);
  };

  const handleCreateUser = (values: UserInput) => {
    const newUser: User = {
      ...values,
      id: crypto.randomUUID(),
      avatar: values.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
      lastActive: "Just invited",
    };
    setUsers((current) => [newUser, ...current]);
    appendAudit(
      "invite",
      "Account Management",
      `Invited ${values.email} with ${values.groups.length} group(s).`,
    );
  };

  const handleSaveUser = (userId: string, values: UserInput) => {
    setUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? {
              ...user,
              ...values,
              avatar: values.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase(),
            }
          : user,
      ),
    );
    appendAudit(
      "update",
      "Account Management",
      `Updated ${values.name}'s profile and access details.`,
    );
  };

  const handleSaveGroups = (userId: string, groupIds: string[]) => {
    const user = users.find((entry) => entry.id === userId);
    setUsers((current) =>
      current.map((entry) =>
        entry.id === userId ? { ...entry, groups: groupIds } : entry,
      ),
    );
    appendAudit(
      "update",
      "Groups",
      `Updated ${user?.name ?? "a user"} to ${groupIds.length} group(s).`,
    );
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find((entry) => entry.id === userId);
    setUsers((current) => current.filter((entry) => entry.id !== userId));
    appendAudit(
      "delete",
      "Users",
      `Deleted ${user?.name ?? "a user"} while keeping audit history.`,
    );
  };

  const handleAddGroup = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const groupId = `grp-${crypto.randomUUID().slice(0, 8)}`;
    setGroups((current) => [
      {
        id: groupId,
        name: trimmedName,
        description: "New group created from the admin console.",
        modules: [],
      },
      ...current,
    ]);
    appendAudit("create", "Groups", `Created group ${trimmedName}.`);
  };

  const handleRenameGroup = (groupId: string, name: string) => {
    setGroups((current) =>
      current.map((group) =>
        group.id === groupId ? { ...group, name } : group,
      ),
    );
  };

  const handleToggleModule = (
    groupId: string,
    module: (typeof MODULE_ACCESS_OPTIONS)[number]["key"],
  ) => {
    setGroups((current) =>
      current.map((group) =>
        group.id === groupId
          ? {
              ...group,
              modules: group.modules.includes(module)
                ? group.modules.filter((entry) => entry !== module)
                : [...group.modules, module],
            }
          : group,
      ),
    );
  };

  const handleDeleteGroup = (groupId: string) => {
    const group = groupsById.get(groupId);
    setGroups((current) => current.filter((entry) => entry.id !== groupId));
    setUsers((current) =>
      current.map((user) => ({
        ...user,
        groups: user.groups.filter((entry) => entry !== groupId),
      })),
    );
    appendAudit(
      "delete",
      "Groups",
      `Removed ${group?.name ?? "a group"} and revoked access from members.`,
    );
  };

  const handleExport = () => {
    const rows = [
      [
        "Name",
        "Email",
        "Department",
        "Role",
        "Status",
        "Groups",
        "Last active",
      ],
      ...filteredUsers.map((user) => [
        user.name,
        user.email,
        user.department,
        user.role,
        user.status,
        getGroupNames(user).join(" | "),
        user.lastActive,
      ]),
    ];
    const blob = new Blob(
      [
        rows
          .map((row) =>
            row.map((value) => `"${value.replace(/"/g, '""')}"`).join(","),
          )
          .join("\n"),
      ],
      {
        type: "text/csv;charset=utf-8;",
      },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "freightos-users.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-[26px] font-bold tracking-[-0.04em] text-slate-900">
              Account Management
            </h1>
            <p className="mt-1 text-[14px] text-slate-500">
              Manage FreightOS team members, groups, and module access across
              the platform.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <UserPlus className="h-4 w-4" />
              New User
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 rounded-[16px] border border-slate-200 bg-white p-2 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
          {(
            [
              ["users", "Users"],
              ["groups", "Groups"],
              ["audit", "Audit Log"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`rounded-[12px] px-4 py-2.5 text-[14px] font-semibold transition ${activeTab === key ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total Users"
                value={String(stats.totalUsers)}
                icon={Users}
                accent="bg-blue-500"
                note="All seeded users"
              />
              <StatCard
                label="Active Users"
                value={String(stats.activeUsers)}
                icon={UserCheck}
                accent="bg-emerald-500"
                note="Currently online or active"
              />
              <StatCard
                label="Groups Defined"
                value={String(stats.groupsDefined)}
                icon={FolderTree}
                accent="bg-violet-500"
                note="Working access groups"
              />
              <StatCard
                label="Pending Invites"
                value={String(stats.pendingInvites)}
                icon={Clock3}
                accent="bg-amber-500"
                note="Users waiting to accept"
              />
            </div>

            <div className="flex flex-col gap-3 rounded-[18px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(22,31,54,0.05)] lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, email, department, or role"
                  className="pl-9"
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as "all" | UserStatus)
                }
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </Select>
            </div>

            <UsersTable
              users={filteredUsers}
              getGroupNames={getGroupNames}
              onEdit={setEditingUser}
              onGroups={setGroupUser}
              onDelete={setDeletingUser}
            />
          </div>
        )}

        {activeTab === "groups" && (
          <RolesPanel
            groups={groups}
            membersByGroup={membersByGroup}
            onAddGroup={handleAddGroup}
            onRenameGroup={handleRenameGroup}
            onToggleModule={handleToggleModule}
            onDeleteGroup={handleDeleteGroup}
          />
        )}

        {activeTab === "audit" && <AuditLogTable logs={auditLogs} />}
      </div>

      <CreateUserDialog
        open={createOpen}
        groups={groups}
        departments={DEPARTMENTS}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateUser}
      />
      <EditUserDialog
        open={Boolean(editingUser)}
        user={editingUser}
        departments={DEPARTMENTS}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveUser}
      />
      <PermissionsDialog
        open={Boolean(groupUser)}
        user={groupUser}
        groups={groups}
        onClose={() => setGroupUser(null)}
        onSave={handleSaveGroups}
      />
      <DeleteUserDialog
        open={Boolean(deletingUser)}
        user={deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteUser}
      />
    </AppLayout>
  );
}
