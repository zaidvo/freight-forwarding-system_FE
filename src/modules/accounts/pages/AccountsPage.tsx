import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/providers/AuthProvider";
import {
  Clock3,
  Download,
  FolderTree,
  Search,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { SEED_AUDIT_LOGS } from "../data/seed";
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
  AppModule,
  Group,
  User,
  UserInput,
  UserStatus,
} from "../types";
import {
  createUser,
  deactivateUser,
  listUsers,
  updateUser,
} from "@/services/userService";
import type { BackendGroup, BackendModule, BackendUser } from "@/services/api";
import { listModules } from "@/services/moduleService";
import {
  createGroup,
  deleteGroup,
  listGroups,
  updateGroup,
  updateUserGroups,
} from "@/services/groupService";

export default function AccountsPage() {
  const { user: currentUser } = useAuth();
  const isRoot = currentUser?.role === "root";
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [modules, setModules] = useState<AppModule[]>([]);
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
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [groupsLoading, setGroupsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      setUsersLoading(true);
      setUsersError(null);
      try {
        const data = await listUsers();
        if (active) {
          setUsers(mapBackendUsers(data));
        }
      } catch (err) {
        if (active) {
          setUsersError(
            err instanceof Error ? err.message : "Unable to load users.",
          );
        }
      } finally {
        if (active) {
          setUsersLoading(false);
        }
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
        const [moduleData, groupData] = await Promise.all([
          listModules(),
          listGroups(),
        ]);
        if (active) {
          setModules(moduleData.map(mapBackendModule));
          setGroups(groupData.map(mapBackendGroup));
        }
      } catch (err) {
        if (active) {
          setUsersError(
            err instanceof Error ? err.message : "Unable to load access data.",
          );
        }
      } finally {
        if (active) {
          setGroupsLoading(false);
        }
      }
    }

    loadAccessData();

    return () => {
      active = false;
    };
  }, [isRoot]);

  const groupsById = useMemo(
    () => new Map(groups.map((group) => [group.id, group])),
    [groups],
  );

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
        const matchesSearch =
          search.trim().length === 0 ||
          [user.full_name, user.email, user.role, user.status].some((field) =>
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
      inactiveUsers: users.filter((user) => user.status === "inactive").length,
    }),
    [groups.length, users],
  );
  const visibleTab = !isRoot && activeTab === "groups" ? "users" : activeTab;

  const appendAudit = (
    action: AuditAction,
    module: string,
    description: string,
  ) => {
    setAuditLogs((current) => [
      {
        id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        actor: "Current admin",
        action,
        module,
        description,
        timestamp: "Just now",
      },
      ...current,
    ]);
  };

  const handleCreateUser = async (values: UserInput) => {
    if (!values.password) {
      throw new Error("Password is required.");
    }

    const createdUser = await createUser({
      full_name: values.full_name,
      email: values.email,
      password: values.password,
    });

    setUsers((current) => withCreatorNames([backendUserToUser(createdUser), ...current]));
    appendAudit("create", "Account Management", `Created ${values.email}.`);
  };

  const handleSaveUser = async (userId: number, values: UserInput) => {
    const updatedUser = await updateUser(userId, {
      full_name: values.full_name,
      email: values.email,
      status: values.status,
      password: values.password?.trim() ? values.password : undefined,
    });

    setUsers((current) =>
      withCreatorNames(
        current.map((user) =>
          user.id === userId ? mergeBackendUser(user, updatedUser) : user,
        ),
      ),
    );
    appendAudit(
      "update",
      "Account Management",
      `Updated ${values.full_name}'s profile.`,
    );
  };

  const handleSaveGroups = async (userId: number, groupIds: number[]) => {
    const user = users.find((entry) => entry.id === userId);
    await updateUserGroups(userId, groupIds);
    setUsers((current) =>
      current.map((entry) =>
        entry.id === userId ? { ...entry, groups: groupIds } : entry,
      ),
    );
    setGroups((current) =>
      current.map((group) => ({
        ...group,
        userIds: groupIds.includes(group.id)
          ? Array.from(new Set([...group.userIds, userId]))
          : group.userIds.filter((entry) => entry !== userId),
      })),
    );
    appendAudit(
      "update",
      "Groups",
      `Updated ${user?.full_name ?? "a user"} to ${groupIds.length} group(s).`,
    );
  };

  const handleDeleteUser = async (userId: number) => {
    const user = users.find((entry) => entry.id === userId);
    const deactivatedUser = await deactivateUser(userId);
    setUsers((current) =>
      withCreatorNames(
        current.map((entry) =>
          entry.id === userId ? mergeBackendUser(entry, deactivatedUser) : entry,
        ),
      ),
    );
    appendAudit(
      "delete",
      "Users",
      `Deactivated ${user?.full_name ?? "a user"} while keeping audit history.`,
    );
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
    appendAudit("create", "Groups", `Created group ${trimmedName}.`);
  };

  const handleRenameGroup = async (groupId: number, name: string) => {
    const group = await updateGroup(groupId, { name });
    setGroups((current) =>
      current.map((entry) =>
        entry.id === groupId ? mapBackendGroup(group) : entry,
      ),
    );
  };

  const handleToggleModule = async (groupId: number, moduleId: number) => {
    const group = groups.find((entry) => entry.id === groupId);
    if (!group) return;
    const moduleIds = group.modules.includes(moduleId)
      ? group.modules.filter((entry) => entry !== moduleId)
      : [...group.modules, moduleId];
    setGroups((current) =>
      current.map((entry) =>
        entry.id === groupId ? { ...entry, modules: moduleIds } : entry,
      ),
    );
    try {
      const updatedGroup = await updateGroup(groupId, { module_ids: moduleIds });
      setGroups((current) =>
        current.map((entry) =>
          entry.id === groupId ? mapBackendGroup(updatedGroup) : entry,
        ),
      );
    } catch (err) {
      setGroups((current) =>
        current.map((entry) =>
          entry.id === groupId ? { ...entry, modules: group.modules } : entry,
        ),
      );
      throw err;
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    const group = groupsById.get(groupId);
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
      appendAudit(
        "delete",
        "Groups",
        `Removed ${group?.name ?? "a group"} and revoked access from members.`,
      );
    } catch (err) {
      setGroups(previousGroups);
      setUsers(previousUsers);
      throw err;
    }
  };

  const handleExport = () => {
    const rows = [
      [
        "Name",
        "Email",
        "Role",
        "Status",
        "Created By",
        "Created At",
        "Updated At",
        "Last Active",
      ],
      ...filteredUsers.map((user) => [
        user.full_name,
        user.email,
        user.role,
        user.status,
        user.created_by_name,
        user.created_at,
        user.updated_at,
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
              Manage FreightOS users, groups, and module access across the
              platform.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            {isRoot && (
              <Button onClick={() => setCreateOpen(true)}>
                <UserPlus className="h-4 w-4" />
                New User
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 rounded-[16px] border border-slate-200 bg-white p-2 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
          {(
            [
              ["users", "Users"],
              ...(isRoot ? ([["groups", "Groups"]] as const) : []),
              ["audit", "Audit Log"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`rounded-[12px] px-4 py-2.5 text-[14px] font-semibold transition ${visibleTab === key ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {visibleTab === "users" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total Users"
                value={String(stats.totalUsers)}
                icon={Users}
                accent="bg-blue-500"
                note="Loaded from backend"
              />
              <StatCard
                label="Active Users"
                value={String(stats.activeUsers)}
                icon={UserCheck}
                accent="bg-emerald-500"
                note="Currently active"
              />
              <StatCard
                label="Groups Defined"
                value={String(stats.groupsDefined)}
                icon={FolderTree}
                accent="bg-violet-500"
                note="Working access groups"
              />
              <StatCard
                label="Inactive Users"
                value={String(stats.inactiveUsers)}
                icon={Clock3}
                accent="bg-amber-500"
                note="Users blocked from signing in"
              />
            </div>

            <div className="flex flex-col gap-3 rounded-[18px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(22,31,54,0.05)] lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, email, role, or status"
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

        {isRoot && visibleTab === "groups" && (
          groupsLoading ? (
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
          )
        )}

        {visibleTab === "audit" && <AuditLogTable logs={auditLogs} />}
      </div>

      <CreateUserDialog
        open={isRoot && createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateUser}
      />
      <EditUserDialog
        open={isRoot && Boolean(editingUser)}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveUser}
      />
      <PermissionsDialog
        open={isRoot && Boolean(groupUser)}
        user={groupUser}
        groups={groups}
        onClose={() => setGroupUser(null)}
        onSave={handleSaveGroups}
      />
      <DeleteUserDialog
        open={isRoot && Boolean(deletingUser)}
        user={deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteUser}
      />
    </AppLayout>
  );
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
    created_by_name: user.created_by
      ? (namesById.get(user.created_by) ?? `User #${user.created_by}`)
      : "System",
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
    lastActive: backendUser.last_login_at
      ? formatDate(backendUser.last_login_at)
      : "Never",
  };
}

function mapBackendUser(
  user: BackendUser,
  namesById: Map<number, string>,
): User {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    status: user.status,
    last_login_at: user.last_login_at,
    created_by: user.created_by,
    created_by_name: user.created_by
      ? (namesById.get(user.created_by) ?? `User #${user.created_by}`)
      : "System",
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
