import {
  Users,
  Ship,
  Receipt,
  Wallet,
  FileText,
  MapPin,
  BarChart3,
  Settings,
  Package,
  Truck,
  ClipboardList,
  Building2,
  Briefcase,
  CreditCard,
  Globe,
  Boxes,
  Warehouse,
  Calculator,
  UserCheck,
  PieChart,
  ShoppingCart,
  Phone,
  Mail,
  Plane,
  type LucideIcon,
} from "lucide-react";

export type ModuleDef = {
  name: string;
  icon: LucideIcon;
  color: string;
  to?: string;
  ready?: boolean;
};

export const MODULES: ModuleDef[] = [
  {
    name: "Account Management",
    icon: Users,
    color: "#3b82f6",
    to: "/accounts",
    ready: true,
  },
  { name: "Shipments", icon: Ship, color: "#0ea5e9" },
  { name: "Tracking", icon: MapPin, color: "#ef4444" },
  { name: "Air Freight", icon: Plane, color: "#06b6d4" },
  { name: "Road Freight", icon: Truck, color: "#f97316" },
  { name: "Warehouse", icon: Warehouse, color: "#8b5cf6" },
  { name: "Inventory", icon: Boxes, color: "#14b8a6" },
  { name: "Packages", icon: Package, color: "#a16207" },
  { name: "Invoicing", icon: Receipt, color: "#10b981" },
  { name: "Finance", icon: Wallet, color: "#059669" },
  { name: "Payments", icon: CreditCard, color: "#6366f1" },
  { name: "Accounting", icon: Calculator, color: "#db2777" },
  { name: "Documents", icon: FileText, color: "#64748b" },
  { name: "Contracts", icon: ClipboardList, color: "#9333ea" },
  { name: "Customers", icon: UserCheck, color: "#0891b2" },
  { name: "Suppliers", icon: Building2, color: "#7c3aed" },
  { name: "CRM", icon: Briefcase, color: "#e11d48" },
  { name: "Sales", icon: ShoppingCart, color: "#f59e0b" },
  { name: "Reports", icon: BarChart3, color: "#2563eb" },
  { name: "Analytics", icon: PieChart, color: "#c026d3" },
  { name: "Carriers", icon: Globe, color: "#0d9488" },
  { name: "Support", icon: Phone, color: "#dc2626" },
  { name: "Messages", icon: Mail, color: "#7c2d12" },
  { name: "Settings", icon: Settings, color: "#475569" },
];
