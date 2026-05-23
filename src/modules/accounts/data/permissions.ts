import type { ModuleKey } from "../types";

export type ModuleAccessOption = {
  key: ModuleKey;
  label: string;
  description: string;
};

export const MODULE_ACCESS_OPTIONS: ModuleAccessOption[] = [
  {
    key: "shipments",
    label: "Shipments",
    description: "Shipment creation and tracking workflows.",
  },
  {
    key: "invoicing",
    label: "Invoicing",
    description: "Invoices, billing, and collections.",
  },
  {
    key: "finance",
    label: "Finance",
    description: "Cash flow, reconciliation, and ledger views.",
  },
  {
    key: "documents",
    label: "Documents",
    description: "Files, records, and shared docs.",
  },
  {
    key: "tracking",
    label: "Tracking",
    description: "Live tracking and milestones.",
  },
  {
    key: "reports",
    label: "Reports",
    description: "Operational and financial reporting.",
  },
  {
    key: "account-management",
    label: "Account Management",
    description: "Users, groups, and access control.",
  },
  {
    key: "settings",
    label: "Settings",
    description: "Workspace and platform settings.",
  },
];
