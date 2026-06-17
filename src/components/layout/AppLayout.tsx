// src/components/layout/AppLayout.tsx
//
// Company-aware layout.
// Sidebar sections match the 5 dashboard tiles: Main, Operations, Sales, Finance, Marketing.
// Sub-items inside each section are company-specific.
// Sidebar is collapsible with an arrow toggle pinned to its edge.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  HandshakeIcon,
  LayoutGrid,
  LogOut,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import {
  useCompany,
  COMPANIES,
  type CompanyId,
} from "@/providers/CompanyProvider";

type LayoutProps = { children: ReactNode };
type NavItem = {
  label: string;
  to?: string;
  icon: typeof LayoutGrid;
  soon?: boolean;
};
type NavSection = { title: string; items: NavItem[] };

// ─── Nav sections per company ─────────────────────────────────────────────────
// Structure mirrors the dashboard tiles so users always know where they are.

const FREIGHT_NAV: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", to: "/", icon: LayoutGrid },
      { label: "Account Management", to: "/accounts", icon: Users },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Packing List",
        to: "/operations/packing-list",
        icon: ClipboardList,
      },
      {
        label: "Bill of Lading",
        to: "/operations/bill-of-lading",
        icon: FileText,
      },
    ],
  },
  {
    title: "Sales",
    items: [
      {
        label: "Proforma Invoice",
        to: "/sales/proforma-invoice",
        icon: Receipt,
      },
      { label: "Sales Overview", icon: TrendingUp, soon: true },
    ],
  },
  {
    title: "Finance",
    items: [{ label: "Finance", icon: Wallet, soon: true }],
  },
  {
    title: "Marketing",
    items: [{ label: "Marketing", icon: BarChart3, soon: true }],
  },
];

const TRADING_NAV: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", to: "/", icon: LayoutGrid },
      { label: "Account Management", to: "/accounts", icon: Users },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Trading Pipeline", to: "/trading", icon: TrendingUp },
      { label: "New Inquiry", to: "/trading/inquiry/new", icon: ShoppingCart },
      {
        label: "Deal Confirmation",
        to: "/trading/deal/new",
        icon: HandshakeIcon,
      },
    ],
  },
  {
    title: "Sales",
    items: [
      { label: "Quotation", to: "/trading/quotation/new", icon: FileText },
      { label: "Proforma Invoice", to: "/trading/pi/new", icon: Receipt },
      { label: "Purchase Order", to: "/trading/po/new", icon: ShoppingCart },
      { label: "Sales Overview", icon: TrendingUp, soon: true },
    ],
  },
  {
    title: "Finance",
    items: [{ label: "Finance", icon: Wallet, soon: true }],
  },
  {
    title: "Marketing",
    items: [{ label: "Marketing", icon: BarChart3, soon: true }],
  },
];

// ─── Page label map ───────────────────────────────────────────────────────────
const PAGE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/accounts": "Account Management",
  "/operations": "Operations",
  "/operations/packing-list": "Packing List",
  "/operations/bill-of-lading": "Bill of Lading",
  "/sales": "Sales",
  "/sales/proforma-invoice": "Proforma Invoice",
  "/trading": "Trading Pipeline",
  "/trading/inquiry/new": "New Inquiry",
  "/trading/quotation/new": "New Quotation",
  "/trading/pi/new": "Proforma Invoice",
  "/trading/po/new": "Purchase Order",
  "/trading/deal/new": "Deal Confirmation",
  "/freight": "Freight Operations",
  "/freight/inquiry/new": "New Freight Inquiry",
  "/freight/shipment/new": "New Shipment",
};

// ─── Component ────────────────────────────────────────────────────────────────
export function AppLayout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { activeCompany, setActiveCompanyId, isFreight } = useCompany();

  const [collapsed, setCollapsed] = useState(
    () => window.localStorage.getItem("freightos-sidebar-collapsed") === "true",
  );
  const [companyOpen, setCompanyOpen] = useState(false);
  const companySwitcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.localStorage.setItem(
      "freightos-sidebar-collapsed",
      String(collapsed),
    );
  }, [collapsed]);

  useEffect(() => {
    if (!companyOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        companySwitcherRef.current &&
        !companySwitcherRef.current.contains(e.target as Node)
      ) {
        setCompanyOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [companyOpen]);

  const navSections = isFreight ? FREIGHT_NAV : TRADING_NAV;

  const currentPage = useMemo(() => {
    if (location.pathname.startsWith("/freight/shipment/"))
      return "Shipment Detail";
    if (location.pathname.startsWith("/trading/inquiry/"))
      return "Inquiry Detail";
    return PAGE_LABELS[location.pathname] ?? "FreightOS";
  }, [location.pathname]);

  const avatarInitials = user
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "??";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  // Determine active section for highlighting section header
  const activeSectionTitle = useMemo(() => {
    for (const section of navSections) {
      if (
        section.items.some((item) => item.to && location.pathname === item.to)
      ) {
        return section.title;
      }
    }
    return null;
  }, [location.pathname, navSections]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(79,124,255,0.08),_transparent_28%),linear-gradient(180deg,#fbfcff_0%,#f4f6fb_100%)] text-slate-900">
      <div className="flex min-h-screen overflow-hidden bg-white/60">
        {/* ── SIDEBAR ── */}
        <aside
          className={`relative flex shrink-0 flex-col border-r border-slate-200/80 bg-white transition-[width] duration-200 ease-in-out ${
            collapsed ? "w-[68px]" : "w-[224px]"
          }`}
        >
          {/* Logo */}
          <div className="flex h-[60px] items-center gap-2.5 border-b border-slate-200/80 px-4">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-[8px] bg-blue-500 text-white shadow-[0_6px_16px_rgba(59,130,246,0.28)]">
              <LayoutGrid className="h-3.5 w-3.5" />
            </div>
            {!collapsed && (
              <span className="select-none text-[16px] font-bold tracking-[-0.02em] text-slate-900">
                FreightOS
              </span>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 space-y-4">
            {navSections.map((section) => (
              <section key={section.title}>
                {!collapsed && (
                  <p
                    className={[
                      "mb-1 px-3 text-[10.5px] font-semibold uppercase tracking-[0.14em]",
                      activeSectionTitle === section.title
                        ? "text-blue-500"
                        : "text-slate-400/80",
                    ].join(" ")}
                  >
                    {section.title}
                  </p>
                )}
                <ul className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = item.to
                      ? location.pathname === item.to
                      : false;

                    const inner = (
                      <span
                        title={item.label}
                        className={[
                          "flex items-center gap-3 rounded-[8px] px-2.5 py-2 text-[13px] font-medium transition-colors",
                          active
                            ? "bg-blue-50 text-blue-600"
                            : item.soon
                              ? "cursor-default text-slate-300"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                          collapsed ? "justify-center" : "",
                        ].join(" ")}
                      >
                        <Icon
                          className={[
                            "h-[17px] w-[17px] shrink-0",
                            active
                              ? "text-blue-500"
                              : item.soon
                                ? "text-slate-300"
                                : "text-slate-400",
                          ].join(" ")}
                        />
                        {!collapsed && (
                          <>
                            <span className="min-w-0 truncate">
                              {item.label}
                            </span>
                            {item.soon && (
                              <span className="ml-auto shrink-0 rounded-[4px] bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-widest text-slate-400">
                                Soon
                              </span>
                            )}
                          </>
                        )}
                      </span>
                    );

                    return (
                      <li key={item.label}>
                        {item.to && !item.soon ? (
                          <Link to={item.to} className="block">
                            {inner}
                          </Link>
                        ) : (
                          inner
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </nav>

          {/* User footer */}
          <div className="border-t border-slate-200/80 px-2 py-3">
            {collapsed ? (
              <div className="flex flex-col items-center gap-2">
                <div
                  title={user?.full_name}
                  className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-[12px] font-bold text-blue-600"
                >
                  {avatarInitials}
                </div>
                <button
                  type="button"
                  title="Sign out"
                  onClick={handleLogout}
                  className="grid h-7 w-7 place-items-center rounded-[6px] text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 rounded-[8px] px-2 py-2 hover:bg-slate-50 transition-colors">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-[12px] font-bold text-blue-600">
                  {avatarInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-slate-800">
                    {user?.full_name ?? "—"}
                  </p>
                  <p className="text-[11px] capitalize text-slate-400">
                    {user?.role ?? ""}
                  </p>
                </div>
                <button
                  type="button"
                  title="Sign out"
                  onClick={handleLogout}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-[6px] text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Collapse toggle */}
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((v) => !v)}
            className="absolute -right-[13px] top-1/2 z-20 -translate-y-1/2 grid h-6 w-6 place-items-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-[0_2px_8px_rgba(22,31,54,0.10)] transition hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200"
          >
            {collapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </button>
        </aside>

        {/* ── MAIN ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top header */}
          <header className="flex h-[60px] shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-xl">
            {/* Company switcher */}
            <div ref={companySwitcherRef} className="relative">
              <button
                type="button"
                onClick={() => setCompanyOpen((o) => !o)}
                className={[
                  "flex items-center gap-2 rounded-[8px] border px-3 py-1.5 text-[13px] font-medium transition-colors",
                  companyOpen
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                ].join(" ")}
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${activeCompany.accent}`}
                />
                <span>{activeCompany.name}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-150 ${companyOpen ? "rotate-180" : ""}`}
                />
              </button>

              {companyOpen && (
                <div className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-[200px] rounded-[10px] border border-slate-200 bg-white p-1.5 shadow-[0_8px_30px_rgba(22,31,54,0.12)]">
                  <p className="mb-1 px-2.5 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Switch workspace
                  </p>
                  {COMPANIES.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setActiveCompanyId(option.id as CompanyId);
                        setCompanyOpen(false);
                      }}
                      className={[
                        "flex w-full items-center gap-2.5 rounded-[7px] px-2.5 py-2 text-left text-[13px] transition-colors hover:bg-slate-50",
                        option.id === activeCompany.id ? "bg-blue-50/70" : "",
                      ].join(" ")}
                    >
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${option.accent}`}
                      />
                      <span className="flex-1 font-medium text-slate-700">
                        {option.name}
                      </span>
                      {option.id === activeCompany.id && (
                        <Check className="h-3.5 w-3.5 text-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-[13px] text-slate-400">
              <span className="text-slate-300">/</span>
              <span className="font-medium text-slate-600">{currentPage}</span>
            </div>

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                className="relative grid h-8 w-8 place-items-center rounded-[8px] border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full border-[1.5px] border-white bg-emerald-500" />
              </button>
              <div
                title={user?.full_name}
                className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-sky-100 to-sky-200 text-[12px] font-bold text-sky-600 cursor-default select-none"
              >
                {avatarInitials}
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
