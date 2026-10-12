import { AppLayout } from "@/app/layout/AppLayout";
import { useCompany } from "@/app/providers/CompanyProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import { ModuleTile } from "../components/ModuleTile";
import { FREIGHT_MODULES, TRADING_MODULES } from "../data/modules";

export default function DashboardPage() {
  const { isFreight } = useCompany();
  const { user, hasModuleAccess } = useAuth();

  const firstName = user?.full_name?.split(" ")[0] ?? "there";
  const modules = isFreight ? FREIGHT_MODULES : TRADING_MODULES;
  const visibleModules = modules.filter((m) => hasModuleAccess(m.slug));

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-7">
        <section className="rounded-[18px] border border-slate-200 bg-white px-6 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-500">
            {isFreight ? "Freight Forwarding" : "Trading"}
          </p>
          <h1 className="mt-2 text-[24px] font-bold tracking-[-0.04em] text-slate-950">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-6 text-slate-500">
            {isFreight
              ? "Continue with freight operations, shipment documents, and finance from one workspace."
              : "Continue with trading operations, import shipments, and sales documents from one workspace."}
          </p>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-[16px] font-bold tracking-[-0.02em] text-slate-900">
              Modules
            </h2>
            <p className="mt-1 text-[13px] text-slate-500">
              Open the areas assigned to your account.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {visibleModules.map((m) => (
              <ModuleTile key={m.name} m={m} />
            ))}
          </div>
        </section>

        {visibleModules.length === 0 && (
          <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-8 text-sm text-slate-500 shadow-[0_8px_24px_rgba(22,31,54,0.05)]">
            No modules are assigned to your account.
          </div>
        )}
      </div>
    </AppLayout>
  );
}
