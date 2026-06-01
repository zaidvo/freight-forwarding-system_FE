// src/components/layout/AppLayout.tsx
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Bell,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  LayoutGrid,
  Receipt,
  Ship,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";

type LayoutProps = {
  children: ReactNode;
};

type NavItem = {
  label: string;
  to?: string;
  icon: typeof LayoutGrid;
  soon?: boolean;
};

const mainSections: Array<{ title: string; items: NavItem[] }> = [
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
      { label: "Bill of Lading", to: "/operations/bill-of-lading", icon: Ship },
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
      { label: "Sales Overview", icon: ShoppingCart, soon: true },
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

const companyOptions = [
  {
    id: "freight-forwarding",
    name: "Freight Forwarding",
    accent: "bg-emerald-500",
  },
  { id: "import-export", name: "Import / Export", accent: "bg-sky-500" },
];

const PAGE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/accounts": "Account Management",
  "/operations/packing-list": "Packing List",
  "/operations/bill-of-lading": "Bill of Lading",
  "/sales/proforma-invoice": "Proforma Invoice",
};

export function AppLayout({ children }: LayoutProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    return (
      window.localStorage.getItem("freightos-sidebar-collapsed") === "true"
    );
  });
  const [companyOpen, setCompanyOpen] = useState(false);
  const [activeCompanyId, setActiveCompanyId] = useState("freight-forwarding");

  useEffect(() => {
    window.localStorage.setItem(
      "freightos-sidebar-collapsed",
      String(collapsed),
    );
  }, [collapsed]);

  // Close company dropdown when clicking outside
  useEffect(() => {
    if (!companyOpen) return;
    const handler = () => setCompanyOpen(false);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [companyOpen]);

  const currentPage = useMemo(() => {
    return PAGE_LABELS[location.pathname] ?? "FreightOS";
  }, [location.pathname]);

  const company =
    companyOptions.find((c) => c.id === activeCompanyId) ?? companyOptions[0];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(79,124,255,0.08),_transparent_28%),linear-gradient(180deg,#fbfcff_0%,#f4f6fb_100%)] px-2 py-2 text-slate-900 lg:px-0 lg:py-0">
      <div className="flex min-h-[calc(100vh-1rem)] overflow-hidden border border-slate-200/80 bg-white/60 shadow-[0_12px_44px_rgba(22,31,54,0.08)] backdrop-blur-xl lg:min-h-screen lg:border-x lg:border-y-0">
        {/* ── SIDEBAR ── */}
        <aside
          className={`flex shrink-0 flex-col border-r border-slate-200/80 bg-white/90 transition-[width] duration-200 ${collapsed ? "w-[76px]" : "w-[232px]"}`}
        >
          {/* Logo */}
          <div className="flex h-[68px] items-center gap-3 border-b border-slate-200/80 px-4">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-blue-500 text-white shadow-[0_10px_20px_rgba(59,130,246,0.24)]">
              <LayoutGrid className="h-4 w-4" />
            </div>
            {!collapsed && (
              <span className="text-[18px] font-bold tracking-[-0.02em]">
                FreightOS
              </span>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-3 overflow-y-auto px-2 py-3">
            {mainSections.map((section) => (
              <section key={section.title} className="space-y-0.5">
                {!collapsed && (
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    {section.title}
                  </div>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = item.to
                    ? location.pathname === item.to
                    : false;
                  const content = (
                    <div
                      title={collapsed ? item.label : undefined}
                      className={`group flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[13.5px] transition ${
                        active
                          ? "bg-blue-50 text-blue-600"
                          : item.soon
                            ? "cursor-default text-slate-300"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 opacity-80" />
                      {!collapsed && (
                        <>
                          <span className="font-medium">{item.label}</span>
                          {item.soon && (
                            <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                              Soon
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  );

                  return item.to && !item.soon ? (
                    <Link key={item.label} to={item.to} className="block">
                      {content}
                    </Link>
                  ) : (
                    <div key={item.label}>{content}</div>
                  );
                })}
              </section>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-200/80 p-3">
            {/* Company switcher */}
            {!collapsed && (
              <div className="relative mb-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCompanyOpen((open) => !open);
                  }}
                  className="flex w-full items-center gap-3 rounded-[12px] border border-slate-200 bg-white px-3 py-3 text-left shadow-[0_4px_14px_rgba(22,31,54,0.04)]"
                >
                  <div
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white ${company.accent}`}
                  >
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Company
                    </div>
                    <div className="truncate text-[13px] font-semibold text-slate-900">
                      {company.name}
                    </div>
                  </div>
                  <ChevronDown
                    className={`ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform ${companyOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {companyOpen && (
                  <div
                    className="absolute inset-x-0 bottom-[62px] z-50 rounded-[14px] border border-slate-200 bg-white p-2 shadow-[0_18px_40px_rgba(22,31,54,0.12)]"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {companyOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setActiveCompanyId(option.id);
                          setCompanyOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-[13px] transition hover:bg-slate-50 ${option.id === activeCompanyId ? "bg-blue-50" : ""}`}
                      >
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${option.accent}`}
                        />
                        <span className="font-medium text-slate-700">
                          {option.name}
                        </span>
                        {option.id === activeCompanyId && (
                          <span className="ml-auto text-[11px] font-semibold text-blue-500">
                            Active
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* User */}
            {!collapsed && (
              <div className="flex items-center gap-3 rounded-[12px] px-2 py-2">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-sm font-bold text-blue-600">
                  AM
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-semibold text-slate-900">
                    Alex Morgan
                  </div>
                  <div className="text-[12px] text-slate-400">
                    Administrator
                  </div>
                </div>
              </div>
            )}

            {/* Collapse toggle */}
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white text-[12px] font-medium text-slate-500 shadow-[0_4px_14px_rgba(22,31,54,0.04)] transition hover:bg-slate-50"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
              {!collapsed && <span>Collapse</span>}
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[68px] items-center gap-4 border-b border-slate-200/80 bg-white/85 px-6 backdrop-blur-xl">
            <div className="flex items-center gap-1.5 text-[14px] text-slate-400">
              <FileText className="h-3.5 w-3.5 text-slate-300" />
              <span>FreightOS</span>
              <span className="mx-1 text-slate-300">/</span>
              <span className="font-semibold text-slate-700">
                {currentPage}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[14px] font-medium text-slate-700 shadow-[0_4px_14px_rgba(22,31,54,0.04)]"
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${company.accent}`}
                />
                <span>{company.name}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              <button
                type="button"
                className="relative grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-[0_4px_14px_rgba(22,31,54,0.04)]"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-emerald-500" />
              </button>
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-sky-100 to-sky-200 text-[13px] font-bold text-sky-600">
                AM
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
