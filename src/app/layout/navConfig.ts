import {
  ClipboardList,
  FileText,
  Handshake,
  LayoutGrid,
  Receipt,
  Ship,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

export type NavItem = {
  label: string;
  to?: string;
  icon: typeof LayoutGrid;
  moduleSlug?: string;
};

export type NavSection = { title: string; items: NavItem[] };

export const INDENTING_NAV: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", to: "/", icon: LayoutGrid },
      { label: "Account Management", to: "/accounts", icon: Users, moduleSlug: "account-management" },
    ],
  },
  {
    title: "Indenting",
    items: [
      { label: "Deals", to: "/indenting", icon: Handshake, moduleSlug: "indenting" },
      { label: "New Deal", to: "/indenting/deals/new", icon: Receipt, moduleSlug: "indenting" },
      { label: "Parties Directory", to: "/indenting/parties", icon: Users, moduleSlug: "indenting" },
    ],
  },
];

export const FREIGHT_NAV: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", to: "/", icon: LayoutGrid },
      { label: "Account Management", to: "/accounts", icon: Users, moduleSlug: "account-management" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Freight Operations", to: "/freight", icon: Ship, moduleSlug: "operations" },
      { label: "New Inquiry", to: "/freight/inquiry/new", icon: ClipboardList, moduleSlug: "operations" },
      { label: "Packing List", to: "/operations/packing-list", icon: ClipboardList, moduleSlug: "operations" },
      { label: "Bill of Lading", to: "/operations/bill-of-lading", icon: FileText, moduleSlug: "operations" },
    ],
  },
];

export const TRADING_NAV: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", to: "/", icon: LayoutGrid },
      { label: "Account Management", to: "/accounts", icon: Users, moduleSlug: "account-management" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Trading Pipeline", to: "/trading", icon: TrendingUp, moduleSlug: "operations" },
      { label: "New Inquiry", to: "/trading/inquiry/new", icon: ShoppingCart, moduleSlug: "operations" },
    ],
  },
  {
    title: "Sales",
    items: [
      { label: "Import Shipments", to: "/trading/imports", icon: Ship, moduleSlug: "sales" },
      { label: "Quotation", to: "/trading/quotation/new", icon: FileText, moduleSlug: "sales" },
      { label: "Purchase Order", to: "/trading/po/new", icon: ShoppingCart, moduleSlug: "sales" },
    ],
  },
];
