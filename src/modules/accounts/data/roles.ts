import type { Group } from "../types";

export const SEED_GROUPS: Group[] = [
  {
    id: "grp-ops",
    name: "Operations Core",
    description: "Core operations execution workflows.",
    modules: ["operations"],
  },
  {
    id: "grp-finance",
    name: "Finance Desk",
    description: "Billing, finance, and cash visibility.",
    modules: ["finance"],
  },
  {
    id: "grp-sales",
    name: "Sales Desk",
    description: "Pipeline, customers, and revenue activity.",
    modules: ["sales"],
  },
  {
    id: "grp-marketing",
    name: "Marketing Desk",
    description: "Campaigns, outreach, and market activity.",
    modules: ["marketing"],
  },
  {
    id: "grp-admin",
    name: "Super Admin",
    description: "Full access across the FreightERP build.",
    modules: [
      "account-management",
      "operations",
      "finance",
      "sales",
      "marketing",
    ],
  },
];
