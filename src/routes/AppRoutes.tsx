// src/routes/AppRoutes.tsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import { CompanyProvider } from "@/providers/CompanyProvider";
import ProtectedRoute from "@/routes/ProtectedRoute";
import GuestRoute from "@/routes/GuestRoute";

// Auth
import LoginPage from "@/routes/Login";

// Core
import DashboardPage from "@/modules/dashboard/pages/DashboardPage";
import AccountsPage from "@/modules/accounts/pages/AccountsPage";

// Operations (standalone)
import OperationsPage from "@/modules/operations/pages/OperationsPage";
import PackingListPage from "@/modules/operations/pages/PackingListPage";
import BillOfLadingPage from "@/modules/operations/pages/BillOfLadingPage";

// Sales (standalone)
import SalesPage from "@/modules/sales/pages/SalesPage";
import ProformaInvoicePage from "@/modules/sales/pages/ProformaInvoicePage";

// Trading workflow
import TradingPage from "@/modules/trading/pages/TradingPage";
import TradingInquiryPage from "@/modules/trading/pages/TradingInquiryPage";
import QuotationPage from "@/modules/trading/pages/QuotationPage";
import TradingProformaInvoicePage from "@/modules/trading/pages/TradingProformaInvoicePage";
import PurchaseOrderPage from "@/modules/trading/pages/PurchaseOrderPage";
import DealConfirmationPage from "@/modules/trading/pages/DealConfirmationPage";

// Freight workflow
import FreightPage from "@/modules/freight/pages/FreightPage";
import FreightInquiryPage from "@/modules/freight/pages/FreightInquiryPage";
import FreightShipmentFormPage from "@/modules/freight/pages/FreightShipmentFormPage";
import ShipmentDetailPage from "@/modules/freight/pages/ShipmentDetailPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      {/*
        AuthProvider: session management (JWT)
        CompanyProvider: active company state (freight / trading)
        Both wrap all routes so every page has access.
      */}
      <AuthProvider>
        <CompanyProvider>
          <Routes>
            {/* ── Guest only ── */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* ── Protected ── */}
            <Route element={<ProtectedRoute />}>
              {/* Core */}
              <Route path="/" element={<DashboardPage />} />
              <Route path="/accounts" element={<AccountsPage />} />

              {/* Operations standalone */}
              <Route path="/operations" element={<OperationsPage />} />
              <Route
                path="/operations/packing-list"
                element={<PackingListPage />}
              />
              <Route
                path="/operations/bill-of-lading"
                element={<BillOfLadingPage />}
              />

              {/* Sales standalone */}
              <Route path="/sales" element={<SalesPage />} />
              <Route
                path="/sales/proforma-invoice"
                element={<ProformaInvoicePage />}
              />

              {/* Trading workflow */}
              <Route path="/trading" element={<TradingPage />} />
              <Route
                path="/trading/inquiry/new"
                element={<TradingInquiryPage />}
              />
              <Route
                path="/trading/inquiry/:id"
                element={<TradingInquiryPage />}
              />
              <Route
                path="/trading/quotation/new"
                element={<QuotationPage />}
              />
              <Route
                path="/trading/pi/new"
                element={<TradingProformaInvoicePage />}
              />
              <Route path="/trading/po/new" element={<PurchaseOrderPage />} />
              <Route
                path="/trading/deal/new"
                element={<DealConfirmationPage />}
              />

              {/* Freight workflow */}
              <Route path="/freight" element={<FreightPage />} />
              <Route
                path="/freight/inquiry/new"
                element={<FreightInquiryPage />}
              />
              <Route
                path="/freight/shipment/new"
                element={<FreightShipmentFormPage />}
              />
              <Route
                path="/freight/shipment/:id"
                element={<ShipmentDetailPage />}
              />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CompanyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
