export type UserStatus = "active" | "inactive";

export type ModuleKey =
  | "account-management"
  | "operations"
  | "finance"
  | "sales"
  | "marketing";

export type UserRole = "root" | "user";

export type UserInput = {
  full_name: string;
  email: string;
  password?: string;
  role?: UserRole;
  status?: UserStatus;
  groups: number[];
};

export type User = UserInput & {
  id: number;
  role: UserRole;
  status: UserStatus;
  last_login_at: string | null;
  created_by: number | null;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  avatar: string;
  lastActive: string;
};

export type Group = {
  id: number;
  name: string;
  description: string | null;
  modules: number[];
  userIds: number[];
};

export type AppModule = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
  route: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type Role = Group;

export type AuditAction = "create" | "update" | "delete";

export type AuditLog = {
  id: string;
  actor: string;
  action: AuditAction;
  module: string;
  description: string;
  timestamp: string;
};
