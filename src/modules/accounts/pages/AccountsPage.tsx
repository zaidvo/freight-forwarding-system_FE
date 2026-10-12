import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/app/layout/AppLayout";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";
import { useAuth } from "@/app/providers/AuthProvider";
import { Download, Search, UserPlus } from "lucide-react";
import { jsPDF } from "jspdf";
import { UsersTable } from "../components/UsersTable";
import RolesPanel from "../components/RolesPanel";
import AuditLogTable from "../components/AuditLogTable";
import CreateUserDialog from "../components/CreateUserDialog";
import EditUserDialog from "../components/EditUserDialog";
import PermissionsDialog from "../components/PermissionsDialog";
import DeleteUserDialog from "../components/DeleteUserDialog";
import type { AuditLog, AppModule, Group, User, UserInput, UserStatus } from "../types";
import { createUser, deactivateUser, listUsers, updateUser } from "@/shared/services/userService";
import type { BackendActivityLog, BackendGroup, BackendModule, BackendUser } from "@/shared/services/api";
import { listModules } from "@/shared/services/moduleService";
import { createGroup, deleteGroup, listGroups, updateGroup, updateUserGroups } from "@/shared/services/groupService";
import { listActivityLogs, type ActivityLogCategory } from "@/shared/services/activityLogService";

export default function AccountsPage() {
  const { user: currentUser } = useAuth();
  const isRoot = currentUser?.role === "root";
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [modules, setModules] = useState<AppModule[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "groups" | "audit">("users");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [groupUser, setGroupUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditFilter, setAuditFilter] = useState<ActivityLogCategory>("important");
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditReloadKey, setAuditReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      setUsersLoading(true);
      setUsersError(null);
      try {
        const data = await listUsers();
        if (active) setUsers(mapBackendUsers(data));
      } catch (err) {
        if (active) setUsersError(err instanceof Error ? err.message : "Unable to load users.");
      } finally {
        if (active) setUsersLoading(false);
      }
    }

    loadUsers();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadAccessData() {
      if (!isRoot) {
        setGroups([]);
        setModules([]);
        setGroupsLoading(false);
        return;
      }

      setGroupsLoading(true);
      try {
        const [moduleData, groupData] = await Promise.all([listModules(), listGroups()]);
        if (active) {
          setModules(moduleData.map(mapBackendModule));
          setGroups(groupData.map(mapBackendGroup));
        }
      } catch (err) {
        if (active) setUsersError(err instanceof Error ? err.message : "Unable to load access data.");
      } finally {
        if (active) setGroupsLoading(false);
      }
    }

    loadAccessData();
    return () => {
      active = false;
    };
  }, [isRoot]);

  useEffect(() => {
    let active = true;

    async function loadAuditLogsPage() {
      setAuditLoading(true);
      setAuditError(null);
      try {
        const result = await listActivityLogs({ page: auditPage, pageSize: 10, category: auditFilter });
        if (active) {
          setAuditLogs(result.items.map(mapBackendActivityLog));
          setAuditTotal(result.total);
          setAuditTotalPages(result.total_pages);
          if (result.page !== auditPage) setAuditPage(result.page);
        }
      } catch (err) {
        if (active) setAuditError(err instanceof Error ? err.message : "Unable to load activity logs.");
      } finally {
        if (active) setAuditLoading(false);
      }
    }

    loadAuditLogsPage();
    return () => {
      active = false;
    };
  }, [auditFilter, auditPage, auditReloadKey]);

  const membersByGroup = useMemo(() => {
    const counts: Record<number, number> = {};
    groups.forEach((group) => {
      counts[group.id] = group.userIds.length;
    });
    return counts;
  }, [groups]);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const query = search.trim().toLowerCase();
        const matchesSearch =
          query.length === 0 ||
          [user.full_name, user.email, user.role, user.status].some((field) => field.toLowerCase().includes(query));
        const matchesStatus = statusFilter === "all" || user.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [search, statusFilter, users],
  );

  const visibleTab = !isRoot && activeTab === "groups" ? "users" : activeTab;

  const refreshAudit = () => {
    setAuditPage(1);
    setAuditReloadKey((key) => key + 1);
  };

  const handleCreateUser = async (values: UserInput) => {
    if (!values.password) throw new Error("Password is required.");
    const createdUser = await createUser({
      full_name: values.full_name,
      email: values.email,
      password: values.password,
    });
    setUsers((current) => withCreatorNames([backendUserToUser(createdUser), ...current]));
    refreshAudit();
  };

  const handleSaveUser = async (userId: number, values: UserInput) => {
    const updatedUser = await updateUser(userId, {
      full_name: values.full_name,
      email: values.email,
      status: values.status,
      password: values.password?.trim() ? values.password : undefined,
    });
    setUsers((current) =>
      withCreatorNames(current.map((user) => (user.id === userId ? mergeBackendUser(user, updatedUser) : user))),
    );
    refreshAudit();
  };

  const handleSaveGroups = async (userId: number, groupIds: number[]) => {
    await updateUserGroups(userId, groupIds);
    setUsers((current) => current.map((entry) => (entry.id === userId ? { ...entry, groups: groupIds } : entry)));
    setGroups((current) =>
      current.map((group) => ({
        ...group,
        userIds: groupIds.includes(group.id)
          ? Array.from(new Set([...group.userIds, userId]))
          : group.userIds.filter((entry) => entry !== userId),
      })),
    );
    refreshAudit();
  };

  const handleDeleteUser = async (userId: number) => {
    const deactivatedUser = await deactivateUser(userId);
    setUsers((current) =>
      withCreatorNames(
        current.map((entry) => (entry.id === userId ? mergeBackendUser(entry, deactivatedUser) : entry)),
      ),
    );
    refreshAudit();
  };

  const handleAddGroup = async (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const group = await createGroup({
      name: trimmedName,
      description: "New group created from the admin console.",
      module_ids: [],
    });
    setGroups((current) => [mapBackendGroup(group), ...current]);
    refreshAudit();
  };

  const handleRenameGroup = async (groupId: number, name: string) => {
    const group = await updateGroup(groupId, { name });
    setGroups((current) => current.map((entry) => (entry.id === groupId ? mapBackendGroup(group) : entry)));
    refreshAudit();
  };

  const handleToggleModule = async (groupId: number, moduleId: number) => {
    const group = groups.find((entry) => entry.id === groupId);
    if (!group) return;
    const moduleIds = group.modules.includes(moduleId)
      ? group.modules.filter((entry) => entry !== moduleId)
      : [...group.modules, moduleId];
    setGroups((current) => current.map((entry) => (entry.id === groupId ? { ...entry, modules: moduleIds } : entry)));
    try {
      const updatedGroup = await updateGroup(groupId, { module_ids: moduleIds });
      setGroups((current) => current.map((entry) => (entry.id === groupId ? mapBackendGroup(updatedGroup) : entry)));
      refreshAudit();
    } catch (err) {
      setGroups((current) => current.map((entry) => (entry.id === groupId ? { ...entry, modules: group.modules } : entry)));
      throw err;
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    const previousGroups = groups;
    const previousUsers = users;
    setGroups((current) => current.filter((entry) => entry.id !== groupId));
    setUsers((current) =>
      current.map((user) => ({
        ...user,
        groups: user.groups.filter((entry) => entry !== groupId),
      })),
    );
    try {
      await deleteGroup(groupId);
      refreshAudit();
    } catch (err) {
      setGroups(previousGroups);
      setUsers(previousUsers);
      throw err;
    }
  };

  const handleExport = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    const generatedAt = new Date().toLocaleString();
    const rows = filteredUsers.map((user) => [
      user.full_name,
      user.email,
      user.role,
      user.status,
      user.created_by_name,
      formatDate(user.created_at),
      user.lastActive,
    ]);
    const headers = ["Name", "Email", "Role", "Status", "Created By", "Created", "Last Active"];
    const columnWidths = [42, 68, 28, 28, 42, 34, 34];
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    let y = 34;

    const drawHeader = () => {
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 22, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("B2B Global Supplies Users", margin, 14);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`Generated ${generatedAt}`, pageWidth - margin, 14, { align: "right" });

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, 27, pageWidth - margin * 2, 10, 2, 2, "FD");
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      let x = margin + 3;
      headers.forEach((header, index) => {
        doc.text(header, x, 33.5);
        x += columnWidths[index];
      });
      y = 43;
    };

    drawHeader();

    if (rows.length === 0) {
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("No users matched the current filters.", margin, y);
    }

    rows.forEach((row, rowIndex) => {
      if (y > pageHeight - 18) {
        doc.addPage();
        drawHeader();
      }
      if (rowIndex % 2 === 0) {
        doc.setFillColor(252, 253, 255);
        doc.rect(margin, y - 6, pageWidth - margin * 2, 10, "F");
      }
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      let x = margin + 3;
      row.forEach((value, index) => {
        const text = String(value ?? "");
        const clipped = text.length > 36 ? `${text.slice(0, 33)}...` : text;
        doc.text(clipped, x, y);
        x += columnWidths[index];
      });
      y += 10;
    });

    doc.save(`freightos-users-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex flex-col gap-4 rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-[24px] font-bold tracking-[-0.04em] text-slate-950">Account Management</h1>
            <p className="mt-1 text-[14px] text-slate-500">
            Manage B2B Global Supplies users, groups, and module access across the platform.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            {isRoot && (
              <Button onClick={() => setCreateOpen(true)}>
                <UserPlus className="h-4 w-4" />
                New User
              </Button>
            )}
          </div>
        </div>

        <div className="flex w-fit flex-wrap gap-1 rounded-[14px] border border-slate-200 bg-white p-1 shadow-[0_8px_24px_rgba(22,31,54,0.04)]">
          {([
            ["users", "Users"],
            ...(isRoot ? ([ ["groups", "Groups"] ] as const) : []),
            ["audit", "Audit Log"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`rounded-[10px] px-4 py-2 text-[13px] font-semibold transition ${
                visibleTab === key ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {visibleTab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-[16px] border border-slate-200 bg-white p-3 shadow-[0_8px_24px_rgba(22,31,54,0.04)] lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, email, role, or status"
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | UserStatus)}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>

            {usersError && (
              <div className="rounded-[16px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {usersError}
              </div>
            )}

            {usersLoading ? (
              <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
                Loading users...
              </div>
            ) : (
              <UsersTable
                users={filteredUsers}
                onEdit={setEditingUser}
                onGroups={setGroupUser}
                onDelete={setDeletingUser}
                canManageUsers={isRoot}
                canManageGroups={isRoot}
              />
            )}
          </div>
        )}

        {isRoot &&
          visibleTab === "groups" &&
          (groupsLoading ? (
            <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
              Loading groups...
            </div>
          ) : (
            <RolesPanel
              groups={groups}
              modules={modules}
              membersByGroup={membersByGroup}
              onAddGroup={handleAddGroup}
              onRenameGroup={handleRenameGroup}
              onToggleModule={handleToggleModule}
              onDeleteGroup={handleDeleteGroup}
            />
          ))}

        {visibleTab === "audit" && (
          <AuditLogTable
            logs={auditLogs}
            loading={auditLoading}
            error={auditError}
            filter={auditFilter}
            onFilterChange={(nextFilter) => {
              setAuditFilter(nextFilter);
              setAuditPage(1);
            }}
            page={auditPage}
            totalPages={auditTotalPages}
            total={auditTotal}
            onPageChange={setAuditPage}
          />
        )}
      </div>

      <CreateUserDialog open={isRoot && createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreateUser} />
      <EditUserDialog open={isRoot && Boolean(editingUser)} user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveUser} />
      <PermissionsDialog open={isRoot && Boolean(groupUser)} user={groupUser} groups={groups} onClose={() => setGroupUser(null)} onSave={handleSaveGroups} />
      <DeleteUserDialog open={isRoot && Boolean(deletingUser)} user={deletingUser} onClose={() => setDeletingUser(null)} onConfirm={handleDeleteUser} />
    </AppLayout>
  );
}

function mapBackendActivityLog(log: BackendActivityLog): AuditLog {
  return {
    id: String(log.id),
    actor: log.actor_name || log.actor_email || (log.success ? "System" : "Unknown visitor"),
    action: mapActivityAction(log.action, log.success),
    module: mapActivityModule(log.action),
    description: cleanActivityDescription(log),
    timestamp: formatRelativeTime(log.created_at),
  };
}

function mapActivityAction(action: BackendActivityLog["action"], success: boolean) {
  if (!success || action === "failed_login") return "security" as const;
  if (action === "login" || action === "logout") return "login" as const;
  if (action === "create_user") return "create" as const;
  if (action === "deactivate_user") return "delete" as const;
  return "update" as const;
}

function mapActivityModule(action: BackendActivityLog["action"]) {
  if (action === "login" || action === "logout" || action === "failed_login") return "Authentication";
  if (action === "change_password" || action === "forgot_password" || action === "reset_password") return "Security";
  return "Account Management";
}

function cleanActivityDescription(log: BackendActivityLog) {
  const target = log.target_name || log.target_email;
  if (log.action === "login") return `${log.actor_name ?? target ?? "A user"} signed in.`;
  if (log.action === "logout") return `${log.actor_name ?? target ?? "A user"} signed out.`;
  if (log.action === "failed_login") return log.description ?? "Failed sign-in attempt.";
  if (log.action === "create_user") return `Created user ${target ?? "account"}.`;
  if (log.action === "update_user") return `Updated user ${target ?? "account"}.`;
  if (log.action === "deactivate_user") return `Deactivated user ${target ?? "account"}.`;
  return log.description ?? "Account activity recorded.";
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(value);
}

function mapBackendUsers(users: BackendUser[]): User[] {
  const namesById = new Map(users.map((user) => [user.id, user.full_name]));
  return users.map((user) => mapBackendUser(user, namesById));
}

function backendUserToUser(user: BackendUser): User {
  return mapBackendUser(user, new Map([[user.id, user.full_name]]));
}

function withCreatorNames(users: User[]): User[] {
  const namesById = new Map(users.map((user) => [user.id, user.full_name]));
  return users.map((user) => ({
    ...user,
    created_by_name: user.created_by ? (namesById.get(user.created_by) ?? "Deleted user") : "System",
  }));
}

function mergeBackendUser(existing: User, backendUser: BackendUser): User {
  return {
    ...existing,
    id: backendUser.id,
    full_name: backendUser.full_name,
    email: backendUser.email,
    role: backendUser.role,
    status: backendUser.status,
    last_login_at: backendUser.last_login_at,
    created_by: backendUser.created_by,
    created_at: backendUser.created_at,
    updated_at: backendUser.updated_at,
    groups: backendUser.group_ids ?? existing.groups,
    avatar: getInitials(backendUser.full_name),
    lastActive: backendUser.last_login_at ? formatDate(backendUser.last_login_at) : "Never",
  };
}

function mapBackendUser(user: BackendUser, namesById: Map<number, string>): User {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    status: user.status,
    last_login_at: user.last_login_at,
    created_by: user.created_by,
    created_by_name: user.created_by ? (namesById.get(user.created_by) ?? "Deleted user") : "System",
    created_at: user.created_at,
    updated_at: user.updated_at,
    groups: user.group_ids ?? [],
    avatar: getInitials(user.full_name),
    lastActive: user.last_login_at ? formatDate(user.last_login_at) : "Never",
  };
}

function mapBackendGroup(group: BackendGroup): Group {
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    modules: group.module_ids,
    userIds: group.user_ids,
  };
}

function mapBackendModule(module: BackendModule): AppModule {
  return {
    id: module.id,
    name: module.name,
    slug: module.slug,
    icon: module.icon,
    color: module.color,
    route: module.route,
    isActive: module.is_active,
    sortOrder: module.sort_order,
  };
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}



