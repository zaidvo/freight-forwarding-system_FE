import type { ModuleKey } from "../types";

export type ModuleAccessOption = {
  key: ModuleKey;
  label: string;
  description: string;
};

export const MODULE_ACCESS_OPTIONS: ModuleAccessOption[] = [
  {
    key: "account-management",
    label: "Account Management",
    description: "Users, groups, and access control.",
  },
  {
    key: "operations",
    label: "Operations",
    description: "Shipment handling, movement, and execution workflows.",
  },
  {
    key: "finance",
    label: "Finance",
    description: "Cash flow, reconciliation, and ledger views.",
  },
  {
    key: "sales",
    label: "Sales",
    description: "Pipeline, opportunities, and customer-facing activity.",
  },
  {
    key: "marketing",
    label: "Marketing",
    description: "Campaigns, outreach, and brand activity.",
  },
];
