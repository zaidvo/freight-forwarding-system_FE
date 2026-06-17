import {
  Users,
  Ship,
  Wallet,
  BarChart3,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";

export type ModuleDef = {
  name: string;
  icon: LucideIcon;
  color: string;
  to?: string;
  ready?: boolean;
};

// These are the fixed top-level module tiles shown on the dashboard.
// Operations and Sales route to their respective landing pages which
// are company-aware and show the relevant sub-flows.
export const MODULES: ModuleDef[] = [
  {
    name: "Account Management",
    icon: Users,
    color: "#3b82f6",
    to: "/accounts",
    ready: true,
  },
  {
    name: "Operations",
    icon: Ship,
    color: "#0ea5e9",
    to: "/operations",
    ready: true,
  },
  { name: "Finance", icon: Wallet, color: "#059669" },
  {
    name: "Sales",
    icon: ShoppingCart,
    color: "#f59e0b",
    to: "/sales",
    ready: true,
  },
  { name: "Marketing", icon: BarChart3, color: "#c026d3" },
];
