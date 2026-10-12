import {
  Building2,
  Users,
  Ship,
  ShoppingCart,
  TrendingUp,
  Receipt,
  Handshake,
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

const ACCOUNT_MANAGEMENT: ModuleDef = {
  name: "Account Management",
  slug: "account-management",
  icon: Users,
  color: "#3b82f6",
  to: "/accounts",
  ready: true,
};

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

export const INDENTING_MODULES: ModuleDef[] = [
  ACCOUNT_MANAGEMENT,
  {
    name: "Indenting Deals",
    slug: "indenting",
    icon: Handshake,
    color: "#d97706",
    to: "/indenting",
    ready: true,
  },
  {
    name: "Parties Directory",
    slug: "indenting",
    icon: Users,
    color: "#059669",
    to: "/indenting/parties",
    ready: true,
  },
];

export const CUSTOMER_MODULES: ModuleDef[] = [
  {
    name: "Customers",
    slug: "customers",
    icon: Building2,
    color: "#7c3aed",
    to: "/customers",
    ready: true,
  },
];
