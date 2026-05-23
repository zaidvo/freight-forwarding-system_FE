import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "@/modules/dashboard/pages/DashboardPage";
import AccountsPage from "@/modules/accounts/pages/AccountsPage";
import LoginPage from "@/routes/Login";
import { Navigate } from "react-router-dom";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<DashboardPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
