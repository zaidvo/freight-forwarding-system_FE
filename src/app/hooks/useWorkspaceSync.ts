// src/app/hooks/useWorkspaceSync.ts
//
// URL ↔ workspace-switcher synchronisation hook.
//
// Problem it solves:
//   When a user lands on a bookmarked URL, uses the browser back/forward buttons,
//   or follows an in-app link, the active company stored in CompanyProvider may
//   disagree with the route they are actually on.  This hook watches the location
//   and silently corrects the switcher state so the sidebar, breadcrumb, and
//   header always reflect the current route.
//
// What it does NOT do:
//   - It never redirects.  Direction here is always URL → state, never state → URL.
//   - It does not run when the user manually switches workspace from the dropdown
//     (CompanyProvider.switchCompany handles that direction instead).
//
// Loop safety:
//   The update is guarded by `activeCompany.id !== detectedId`.  Setting the same
//   value twice in a row is a no-op in React state, but the explicit guard makes
//   the intent clear and avoids the Zustand / context re-render on every navigation.
//
// Mount point: AppLayout — runs inside every protected page render.

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  useCompany,
  type CompanyId,
} from "@/app/providers/CompanyProvider";

// Ordered list: more-specific prefixes must come before shorter ones.
const URL_TO_COMPANY: Array<{ prefix: string; companyId: CompanyId }> = [
  { prefix: "/trading/imports", companyId: "import-export" },
  { prefix: "/trading",         companyId: "import-export" },
  { prefix: "/freight",         companyId: "freight-forwarding" },
  { prefix: "/indenting",       companyId: "indenting" },
  { prefix: "/customers",       companyId: "customers" },
];

/** Derive the company that owns `pathname`, or null if it is company-neutral. */
function detectCompanyFromPath(pathname: string): CompanyId | null {
  for (const { prefix, companyId } of URL_TO_COMPANY) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return companyId;
    }
  }
  return null; // "/" "/accounts" "/sales" "/operations" are shared — no forced switch
}

export function useWorkspaceSync(): void {
  const location = useLocation();
  const { activeCompany, setActiveCompanyId } = useCompany();

  useEffect(() => {
    const detected = detectCompanyFromPath(location.pathname);
    if (detected !== null && detected !== activeCompany.id) {
      // Silently align the switcher with the URL the user is actually on.
      setActiveCompanyId(detected);
    }
  // We intentionally only re-run when the pathname changes, not on every render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
}
