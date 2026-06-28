// src/app/routes/AppRoutes.tsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { CompanyProvider } from "@/app/providers/CompanyProvider";
import ProtectedRoute from "@/app/routes/ProtectedRoute";
import GuestRoute from "@/app/routes/GuestRoute";
import ModuleAccessRoute from "@/app/routes/ModuleAccessRoute";

// Auth
import LoginPage from "@/app/routes/Login";

// Core
import DashboardPage from "@/app/dashboard/pages/DashboardPage";
// Accounts
import AccountsPage from "@/modules/accounts/pages/AccountsPage";

// Operations
import OperationsPage from "@/modules/operations/pages/OperationsPage";
import PackingListPage from "@/modules/operations/pages/PackingListPage";
import BillOfLadingPage from "@/modules/operations/pages/BillOfLadingPage";

// Sales
import SalesPage from "@/modules/sales/pages/SalesPage";
import ProformaInvoicePage from "@/modules/sales/pages/ProformaInvoicePage";

// Trading workflow
import TradingPage from "@/companies/trading/pages/TradingPage";
import TradingInquiryPage from "@/companies/trading/pages/TradingInquiryPage";
import QuotationPage from "@/companies/trading/pages/QuotationPage";
import TradingProformaInvoicePage from "@/companies/trading/pages/TradingProformaInvoicePage";
import PurchaseOrderPage from "@/companies/trading/pages/PurchaseOrderPage";
import DealConfirmationPage from "@/companies/trading/pages/DealConfirmationPage";

// Freight workflow
import FreightPage from "@/companies/freight/pages/FreightPage";
import FreightInquiryPage from "@/companies/freight/pages/FreightInquiryPage";
import FreightQuotationPage from "@/companies/freight/pages/FreightQuotationPage";
import FreightBookingPage from "@/companies/freight/pages/FreightBookingPage";
import FreightShipmentFormPage from "@/companies/freight/pages/FreightShipmentFormPage";
import ShipmentDetailPage from "@/companies/freight/pages/ShipmentDetailPage"

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompanyProvider>
          <Routes>
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<DashboardPage />} />

              <Route
                element={<ModuleAccessRoute moduleSlug="account-management" />}
              >
                <Route path="/accounts" element={<AccountsPage />} />
              </Route>

              <Route element={<ModuleAccessRoute moduleSlug="operations" />}>
                <Route path="/operations" element={<OperationsPage />} />
                <Route
                  path="/operations/packing-list"
                  element={<PackingListPage />}
                />
                <Route
                  path="/operations/bill-of-lading"
                  element={<BillOfLadingPage />}
                />

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
                  path="/trading/deal/new"
                  element={<DealConfirmationPage />}
                />
                <Route
                  path="/trading/deal/:id"
                  element={<DealConfirmationPage />}
                />

                <Route path="/freight" element={<FreightPage />} />
                <Route
                  path="/freight/inquiry/new"
                  element={<FreightInquiryPage />}
                />
                <Route
                  path="/freight/quotation/new"
                  element={<FreightQuotationPage />}
                />
                <Route
                  path="/freight/booking/new"
                  element={<FreightBookingPage />}
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

              <Route element={<ModuleAccessRoute moduleSlug="sales" />}>
                <Route path="/sales" element={<SalesPage />} />
                <Route
                  path="/sales/proforma-invoice"
                  element={<ProformaInvoicePage />}
                />
                <Route
                  path="/trading/quotation/new"
                  element={<QuotationPage />}
                />
                <Route
                  path="/trading/quotation/:id"
                  element={<QuotationPage />}
                />
                <Route
                  path="/trading/pi/new"
                  element={<TradingProformaInvoicePage />}
                />
                <Route
                  path="/trading/pi/:id"
                  element={<TradingProformaInvoicePage />}
                />
                <Route path="/trading/po/new" element={<PurchaseOrderPage />} />
                <Route path="/trading/po/:id" element={<PurchaseOrderPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CompanyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
