import type { AuditLog } from "../types";

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-001",
    actor: "Alex Morgan",
    action: "invite",
    module: "Account Management",
    description: "Invited james@freightos.com with Operations Core access.",
    timestamp: "2 min ago",
  },
  {
    id: "log-002",
    actor: "Alex Morgan",
    action: "update",
    module: "Groups",
    description: "Updated Priya Singh from Compliance Review to Super Admin.",
    timestamp: "18 min ago",
  },
  {
    id: "log-003",
    actor: "Sarah Chen",
    action: "create",
    module: "Groups",
    description:
      "Created Finance Desk with invoicing, finance, and reports access.",
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
    module: "Documents",
    description: "Adjusted document retention access for the warehouse team.",
    timestamp: "Yesterday",
  },
];
