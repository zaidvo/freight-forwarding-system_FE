import type { Group } from "../types";

export const SEED_GROUPS: Group[] = [
  {
    id: "grp-ops",
    name: "Operations Core",
    description: "Core shipment handling and document workflows.",
    modules: ["shipments", "tracking", "documents"],
  },
  {
    id: "grp-finance",
    name: "Finance Desk",
    description: "Billing, invoicing, and finance visibility.",
    modules: ["invoicing", "finance", "reports"],
  },
  {
    id: "grp-compliance",
    name: "Compliance Review",
    description: "Documents, reports, and account oversight.",
    modules: ["documents", "reports", "account-management"],
  },
  {
    id: "grp-admin",
    name: "Super Admin",
    description: "Full access across the FreightOS build.",
    modules: [
      "shipments",
      "invoicing",
      "finance",
      "documents",
      "tracking",
      "reports",
      "account-management",
      "settings",
    ],
  },
];
