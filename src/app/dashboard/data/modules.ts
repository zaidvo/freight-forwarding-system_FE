// src/app/dashboard/data/modules.ts
//
// Active module tiles per company context.
// Operations and Sales tiles are company-specific so their routes
// lead to the relevant sub-flows without any confusion.

import {
  Users,
  Ship,
  ShoppingCart,
  TrendingUp,
  Receipt,
  type LucideIcon,
} from "lucide-react";

export type ModuleDef = {
  name: string;
  slug: string;
  icon: LucideIcon;
  color: string;
  to?: string;
  ready?: boolean;
};

// ─── Shared tiles ─────────────────────────────────────────────────
const ACCOUNT_MANAGEMENT: ModuleDef = {
  name: "Account Management",
  slug: "account-management",
  icon: Users,
  color: "#3b82f6",
  to: "/accounts",
  ready: true,
};

// ─── Freight Forwarding tiles ─────────────────────────────────────
export const FREIGHT_MODULES: ModuleDef[] = [
  ACCOUNT_MANAGEMENT,
  {
    name: "Freight Operations",
    slug: "operations",
    icon: Ship,
    color: "#0ea5e9",
    to: "/freight",
    ready: true,
  },
  {
    name: "Sales",
    slug: "sales",
    icon: Receipt,
    color: "#f59e0b",
    to: "/sales",
    ready: true,
  },
];

// ─── Import / Export (Trading) tiles ─────────────────────────────
export const TRADING_MODULES: ModuleDef[] = [
  ACCOUNT_MANAGEMENT,
  {
    name: "Trading Pipeline",
    slug: "trading",
    icon: TrendingUp,
    color: "#0ea5e9",
    to: "/trading",
    ready: true,
  },
  {
    name: "Sales",
    slug: "sales",
    icon: ShoppingCart,
    color: "#f59e0b",
    to: "/sales",
    ready: true,
  },
];
