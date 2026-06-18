import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import { CompanyProvider } from "@/providers/CompanyProvider";
import GuestRoute from "@/routes/GuestRoute";
import ModuleAccessRoute from "@/routes/ModuleAccessRoute";
import ProtectedRoute from "@/routes/ProtectedRoute";

import LoginPage from "@/routes/Login";

import AccountsPage from "@/modules/accounts/pages/AccountsPage";
import DashboardPage from "@/modules/dashboard/pages/DashboardPage";

import BillOfLadingPage from "@/modules/operations/pages/BillOfLadingPage";
import OperationsPage from "@/modules/operations/pages/OperationsPage";
import PackingListPage from "@/modules/operations/pages/PackingListPage";

import ProformaInvoicePage from "@/modules/sales/pages/ProformaInvoicePage";
import SalesPage from "@/modules/sales/pages/SalesPage";

import DealConfirmationPage from "@/modules/trading/pages/DealConfirmationPage";
import PurchaseOrderPage from "@/modules/trading/pages/PurchaseOrderPage";
import QuotationPage from "@/modules/trading/pages/QuotationPage";
import TradingInquiryPage from "@/modules/trading/pages/TradingInquiryPage";
import TradingPage from "@/modules/trading/pages/TradingPage";
import TradingProformaInvoicePage from "@/modules/trading/pages/TradingProformaInvoicePage";

import FreightBookingPage from "@/modules/freight/pages/FreightBookingPage";
import FreightInquiryPage from "@/modules/freight/pages/FreightInquiryPage";
import FreightPage from "@/modules/freight/pages/FreightPage";
import FreightQuotationPage from "@/modules/freight/pages/FreightQuotationPage";
import FreightShipmentFormPage from "@/modules/freight/pages/FreightShipmentFormPage";
import ShipmentDetailPage from "@/modules/freight/pages/ShipmentDetailPage";

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
