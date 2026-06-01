// src/routes/AppRoutes.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import ProtectedRoute from "@/routes/ProtectedRoute";
import GuestRoute from "@/routes/GuestRoute";
import LoginPage from "@/routes/Login";
import DashboardPage from "@/modules/dashboard/pages/DashboardPage";
import AccountsPage from "@/modules/accounts/pages/AccountsPage";
import OperationsPage from "@/modules/operations/pages/OperationsPage";
import PackingListPage from "@/modules/operations/pages/PackingListPage";
import BillOfLadingPage from "@/modules/operations/pages/BillOfLadingPage";
import SalesPage from "@/modules/sales/pages/SalesPage";
import ProformaInvoicePage from "@/modules/sales/pages/ProformaInvoicePage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Guest only — logged-in users get redirected to / */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Protected — unauthenticated users get redirected to /login */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/operations" element={<OperationsPage />} />
            <Route
              path="/operations/packing-list"
              element={<PackingListPage />}
            />
            <Route
              path="/operations/bill-of-lading"
              element={<BillOfLadingPage />}
            />
            <Route path="/sales" element={<SalesPage />} />
            <Route
              path="/sales/proforma-invoice"
              element={<ProformaInvoicePage />}
            />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
