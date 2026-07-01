// src/modules/dashboard/data/modules.ts
//
// Two tile sets — one per company context.
// Both share Account Management, Finance, Marketing.
// Operations and Sales tiles are company-specific so their routes
// lead to the relevant sub-flows without any confusion.

import {
  Users,
  Ship,
  Wallet,
  BarChart3,
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

// ─── Shared tiles (same for both companies) ───────────────────────
const SHARED_TILES: ModuleDef[] = [
  {
    name: "Account Management",
    slug: "account-management",
    icon: Users,
    color: "#3b82f6",
    to: "/accounts",
    ready: true,
  },
  { name: "Finance", slug: "finance", icon: Wallet, color: "#059669" },
  { name: "Marketing", slug: "marketing", icon: BarChart3, color: "#c026d3" },
];

// ─── Freight Forwarding tiles ─────────────────────────────────────
export const FREIGHT_MODULES: ModuleDef[] = [
  SHARED_TILES[0], // Account Management
  {
    name: "Freight Operations",
    slug: "operations",
    icon: Ship,
    color: "#0ea5e9",
    to: "/freight",
    ready: true,
  },
  SHARED_TILES[1], // Finance
  {
    name: "Sales",
    slug: "sales",
    icon: Receipt,
    color: "#f59e0b",
    to: "/sales",
    ready: true,
  },
  SHARED_TILES[2], // Marketing
];

// ─── Import / Export (Trading) tiles ─────────────────────────────
export const TRADING_MODULES: ModuleDef[] = [
  SHARED_TILES[0], // Account Management
  {
    name: "Trading Pipeline",
    slug: "trading",
    icon: TrendingUp,
    color: "#0ea5e9",
    to: "/trading",
    ready: true,
  },
  SHARED_TILES[1], // Finance
  {
    name: "Sales",
    slug: "sales",
    icon: ShoppingCart,
    color: "#f59e0b",
    to: "/sales",
    ready: true,
  },
  SHARED_TILES[2], // Marketing
];

// Legacy export — kept so any existing imports don't break.
// DashboardPage now uses FREIGHT_MODULES / TRADING_MODULES directly.
export const MODULES = FREIGHT_MODULES;
