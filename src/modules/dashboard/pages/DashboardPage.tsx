import { AppLayout } from "@/components/layout/AppLayout";
import { MODULES } from "../data/modules";
import { ModuleTile } from "../components/ModuleTile";

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="max-w-none">
        <div className="mb-7">
          <h1 className="text-[20px] font-bold tracking-[-0.03em] text-slate-900">
            Welcome back, Alex
          </h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Select one of the five modules below. Only Account Management is
            active in this build.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {MODULES.map((m) => (
            <ModuleTile key={m.name} m={m} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
