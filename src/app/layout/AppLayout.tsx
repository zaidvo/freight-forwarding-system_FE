// src/components/layout/AppLayout.tsx
//
// Company-aware layout.
// Sidebar sections match the 5 dashboard tiles: Main, Operations, Sales, Finance, Marketing.
// Sub-items inside each section are company-specific.
// Sidebar is collapsible with an arrow toggle pinned to its edge.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Handshake,
  LayoutGrid,
  Loader2,
  LogOut,
  Receipt,
  Ship,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";
import BrandLogo from "@/shared/components/BrandLogo";
import {
  useCompany,
  COMPANIES,
  type CompanyId,
} from "@/app/providers/CompanyProvider";

type LayoutProps = { children: ReactNode };
type NavItem = {
  label: string;
  to?: string;
  icon: typeof LayoutGrid;
  moduleSlug?: string;
};
type NavSection = { title: string; items: NavItem[] };

const COMING_SOON_WORKSPACES = [];

const INDENTING_NAV: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", to: "/", icon: LayoutGrid },
      {
        label: "Account Management",
        to: "/accounts",
        icon: Users,
        moduleSlug: "account-management",
      },
    ],
  },
  {
    title: "Indenting",
    items: [
      {
        label: "Deals",
        to: "/indenting",
        icon: Handshake,
        moduleSlug: "indenting",
      },
      {
        label: "New Deal",
        to: "/indenting/deals/new",
        icon: Receipt,
        moduleSlug: "indenting",
      },
      {
        label: "Parties Directory",
        to: "/indenting/parties",
        icon: Users,
        moduleSlug: "indenting",
      },
    ],
  },

// ─── Nav sections per company ─────────────────────────────────────────────────
// Structure mirrors the dashboard tiles so users always know where they are.

];

const FREIGHT_NAV: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", to: "/", icon: LayoutGrid },
      {
        label: "Account Management",
        to: "/accounts",
        icon: Users,
        moduleSlug: "account-management",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Freight Operations",
        to: "/freight",
        icon: Ship,
        moduleSlug: "operations",
      },
      {
        label: "New Inquiry",
        to: "/freight/inquiry/new",
        icon: ClipboardList,
        moduleSlug: "operations",
      },
      {
        label: "Packing List",
        to: "/operations/packing-list",
        icon: ClipboardList,
        moduleSlug: "operations",
      },
      {
        label: "Bill of Lading",
        to: "/operations/bill-of-lading",
        icon: FileText,
        moduleSlug: "operations",
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
        moduleSlug: "sales",
      },
    ],
  },
];

const TRADING_NAV: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", to: "/", icon: LayoutGrid },
      {
        label: "Account Management",
        to: "/accounts",
        icon: Users,
        moduleSlug: "account-management",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Trading Pipeline",
        to: "/trading",
        icon: TrendingUp,
        moduleSlug: "operations",
      },
      {
        label: "New Inquiry",
        to: "/trading/inquiry/new",
        icon: ShoppingCart,
        moduleSlug: "operations",
      },
    ],
  },
  {
    title: "Sales",
    items: [
      {
        label: "Import Shipments",
        to: "/trading/imports",
        icon: Ship,
        moduleSlug: "sales",
      },
      {
        label: "Quotation",
        to: "/trading/quotation/new",
        icon: FileText,
        moduleSlug: "sales",
      },
      {
        label: "Proforma Invoice",
        to: "/trading/pi/new",
        icon: Receipt,
        moduleSlug: "sales",
      },
      {
        label: "Purchase Order",
        to: "/trading/po/new",
        icon: ShoppingCart,
        moduleSlug: "sales",
      },
    ],
  },
];

const CUSTOMERS_NAV: NavSection[] = [
  {
    title: "Directory",
    items: [
      {
        label: "Customers",
        to: "/customers",
        icon: Building2,
        moduleSlug: "customers",
      },
    ],
  },
];

// ─── Page label map ───────────────────────────────────────────────────────────
const PAGE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/customers": "Customers",
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
  "/trading/imports": "Import Shipments",
  "/trading/imports/:id/invoice": "Freight Invoice",
  "/trading/imports/:id/payment-receipt": "Payment Receipt",
  "/trading/imports/:id/detention-invoice": "Detention Invoice",
  "/freight": "Freight Operations",
  "/freight/inquiry/new": "New Freight Inquiry",
  "/freight/quotation/new": "Freight Quotation",
  "/freight/booking/new": "Booking",
  "/freight/shipment/new": "New Shipment",
  "/indenting": "Indenting",
  "/indenting/deals/new": "New Deal",
  "/indenting/parties": "Indenting Parties",
};

// ─── Component ────────────────────────────────────────────────────────────────
export function AppLayout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasModuleAccess } = useAuth();
  const { activeCompany, setActiveCompanyId, isFreight, isIndenting, isCustomers } = useCompany();

  const [collapsed, setCollapsed] = useState(
    () => window.localStorage.getItem("freightos-sidebar-collapsed") === "true",
  );
  const [companyOpen, setCompanyOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const companySwitcherRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

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
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  const baseNavSections = isCustomers
    ? CUSTOMERS_NAV
    : isIndenting
    ? INDENTING_NAV
    : isFreight
    ? FREIGHT_NAV
    : TRADING_NAV;
  const navSections = useMemo(
    () =>
      baseNavSections
        .map((section) => ({
          ...section,
          items: section.items.filter(
            (item) => !item.moduleSlug || hasModuleAccess(item.moduleSlug),
          ),
        }))
        .filter((section) => section.items.length > 0),
    [baseNavSections, hasModuleAccess],
  );

  const currentPage = useMemo(() => {
    if (
      location.pathname.startsWith("/indenting/deals/") &&
      location.pathname.endsWith("/edit")
    )
      return "Edit Deal";
    if (location.pathname.startsWith("/indenting/deals/"))
      return "Deal Detail";
    if (location.pathname.startsWith("/freight/shipment/"))
      return "Shipment Detail";
    if (location.pathname.startsWith("/trading/inquiry/"))
      return "Inquiry Detail";
    if (location.pathname.startsWith("/freight/quotation/"))
      return "Freight Quotation";
    if (location.pathname.startsWith("/freight/booking/")) return "Booking";
    return PAGE_LABELS[location.pathname] ?? "B2B Global Supplies";
  }, [location.pathname]);

  const switchWorkspace = (id: CompanyId) => {
    setActiveCompanyId(id);
    setCompanyOpen(false);
    if (id === "customers") {
      navigate("/customers");
    } else if (id === "indenting") {
      navigate("/indenting");
    } else if (
      location.pathname.startsWith("/customers") ||
      location.pathname.startsWith("/indenting")
    ) {
      navigate("/");
    }
  };

  const avatarInitials = user
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "??";

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
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
          className={`relative flex shrink-0 flex-col border-r border-slate-900 bg-slate-950 transition-[width] duration-200 ease-in-out ${
            collapsed ? "w-[68px]" : "w-[224px]"
          }`}
        >
          {/* B2B Global Supplies logo */}
          <div className="flex h-[60px] items-center gap-2.5 border-b border-white/10 px-4">
            <BrandLogo
              compact={collapsed}
              className={collapsed ? "" : "h-10 w-24 shrink-0"}
            />
            {!collapsed && (
              <span className="select-none text-[16px] font-bold tracking-[-0.02em] text-white">
                B2B Global Supplies
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
                        ? "text-sky-300"
                        : "text-slate-500",
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
                            ? "bg-white/10 text-white shadow-[inset_3px_0_0_rgba(56,189,248,0.95)]"
                            : "text-slate-300 hover:bg-white/10 hover:text-white",
                          collapsed ? "justify-center" : "",
                        ].join(" ")}
                      >
                        <Icon
                          className={[
                            "h-[17px] w-[17px] shrink-0",
                            active ? "text-sky-300" : "text-slate-400",
                          ].join(" ")}
                        />
                        {!collapsed && (
                          <span className="min-w-0 truncate">
                            {item.label}
                          </span>
                        )}
                      </span>
                    );

                    return (
                      <li key={item.label}>
                        {item.to ? (
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
          <div className="border-t border-white/10 px-2 py-3">
            {collapsed ? (
              <div className="flex justify-center">
                <div
                  title={user?.full_name}
                  className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-[12px] font-bold text-blue-600"
                >
                  {avatarInitials}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 rounded-[8px] px-2 py-2 transition-colors hover:bg-white/10">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-[12px] font-bold text-blue-600">
                  {avatarInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-white">
                    {user?.full_name ?? "-"}
                  </p>
                  <p className="text-[11px] capitalize text-slate-400">
                    {user?.role ?? ""}
                  </p>
                </div>
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
                  {COMPANIES.filter(
                    (option) =>
                      option.id !== "customers" ||
                      user?.role === "root" ||
                      hasModuleAccess("customers"),
                  ).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => switchWorkspace(option.id as CompanyId)}
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
                  <div className="my-1 border-t border-slate-100" />
                  {COMING_SOON_WORKSPACES.map((option) => (
                    <button
                      key={option.name}
                      type="button"
                      disabled
                      aria-label={`${option.name} workspace coming soon`}
                      className="flex w-full cursor-not-allowed items-center gap-2.5 rounded-[7px] px-2.5 py-2 text-left text-[13px] opacity-60"
                    >
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${option.accent}`}
                      />
                      <span className="flex-1 font-medium text-slate-500">
                        {option.name}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Coming soon
                      </span>
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

            {/* Profile actions */}
            <div ref={profileMenuRef} className="relative ml-auto">
              <button
                type="button"
                title={user?.full_name}
                onClick={() => setProfileOpen((open) => !open)}
                className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-sky-100 to-sky-200 text-[12px] font-bold text-sky-600 transition ring-blue-100 hover:ring-4"
              >
                {avatarInitials}
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[220px] rounded-[10px] border border-slate-200 bg-white p-2 shadow-[0_10px_30px_rgba(22,31,54,0.14)]">
                  <div className="flex items-center gap-2.5 rounded-[8px] px-2 py-2">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-100 to-sky-200 text-[12px] font-bold text-sky-600">
                      {avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-slate-800">
                        {user?.full_name ?? "-"}
                      </p>
                      <p className="text-[11px] capitalize text-slate-400">
                        {user?.role ?? ""}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="mt-1 flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-[13px] font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-wait disabled:opacity-70"
                  >
                    {loggingOut ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <LogOut className="h-3.5 w-3.5" />
                    )}
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
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






