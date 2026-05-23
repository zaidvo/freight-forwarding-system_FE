import type { AuditLog } from "../types";

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-001",
    actor: "Alex Morgan",
    action: "create",
    module: "Account Management",
    description: "Created james@freightos.com with Operations Core access.",
    timestamp: "2 min ago",
  },
  {
    id: "log-002",
    actor: "Alex Morgan",
    action: "update",
    module: "Groups",
    description: "Updated Priya Singh from Marketing Desk to Super Admin.",
    timestamp: "18 min ago",
  },
  {
    id: "log-003",
    actor: "Sarah Chen",
    action: "create",
    module: "Groups",
    description: "Created Finance Desk with finance access.",
    timestamp: "1 hr ago",
  },
  {
    id: "log-004",
    actor: "Alex Morgan",
    action: "delete",
    module: "Users",
    description: "Removed a temporary contractor while keeping audit history.",
    timestamp: "3 hr ago",
  },
  {
    id: "log-005",
    actor: "Priya Singh",
    action: "update",
    module: "Marketing",
    description: "Adjusted campaign access for the marketing team.",
    timestamp: "Yesterday",
  },
];
