export type UserStatus = "active" | "inactive";

export type ModuleKey =
  | "account-management"
  | "operations"
  | "finance"
  | "sales"
  | "marketing";

export type UserInput = {
  name: string;
  email: string;
  department: string;
  role: string;
  status: UserStatus;
  groups: string[];
};

export type User = UserInput & {
  id: string;
  avatar: string;
  lastActive: string;
};

export type Group = {
  id: string;
  name: string;
  description: string;
  modules: ModuleKey[];
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
