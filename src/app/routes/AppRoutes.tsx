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

// Freight workflow
import FreightPage from "@/companies/freight/pages/FreightPage";
import FreightInquiryPage from "@/companies/freight/pages/FreightInquiryPage";
import FreightQuotationPage from "@/companies/freight/pages/FreightQuotationPage";
import FreightBookingPage from "@/companies/freight/pages/FreightBookingPage";
import FreightShipmentFormPage from "@/companies/freight/pages/FreightShipmentFormPage";
import ShipmentDetailPage from "@/companies/freight/pages/ShipmentDetailPage";

// Trading Import workflow
import ImportListPage from "@/companies/trading/pages/ImportListPage";
import ImportWorkspacePage from "@/companies/trading/pages/ImportWorkspacePage";
import DraftBLForm from "@/companies/trading/components/import/DraftBLForm";
import HouseBLForm from "@/companies/trading/components/import/HouseBLForm";
import MasterBLForm from "@/companies/trading/components/import/MasterBLForm";
import ImportClearingInvoiceForm from "@/companies/trading/components/import/ImportClearingInvoiceForm";
import PaymentReceiptForm from "@/companies/trading/components/import/PaymentReceiptForm";
import DetentionInvoiceForm from "@/companies/trading/components/import/DetentionInvoiceForm";

// Indenting workflow
import IndentingPage from "@/modules/indenting/pages/IndentingPage";
import IndentDealFormPage from "@/modules/indenting/pages/IndentDealFormPage";
import IndentDealDetailPage from "@/modules/indenting/pages/IndentDealDetailPage";
import IndentingPartiesPage from "@/modules/indenting/pages/IndentingPartiesPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompanyProvider>
          <Routes>
            {/* ── Guest only ── */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* ── Protected ── */}
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

                <Route path="/freight" element={<FreightPage />} />

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
                
                {/* Trading Imports Workflow */}
                <Route path="/trading/imports" element={<ImportListPage />} />
                <Route path="/trading/imports/:id" element={<ImportWorkspacePage />} />
                <Route path="/trading/imports/:id/draft-bl" element={<DraftBLForm />} />
                <Route path="/trading/imports/:id/hbl" element={<HouseBLForm />} />
                <Route path="/trading/imports/:id/mbl" element={<MasterBLForm />} />
                <Route path="/trading/imports/:id/invoice" element={<ImportClearingInvoiceForm />} />
                <Route path="/trading/imports/:id/payment-receipt" element={<PaymentReceiptForm />} />
                <Route path="/trading/imports/:id/detention-invoice" element={<DetentionInvoiceForm />} />
              </Route>

              {/* Indenting Workflow */}
              <Route element={<ModuleAccessRoute moduleSlug="indenting" />}>
                <Route path="/indenting" element={<IndentingPage />} />
                <Route
                  path="/indenting/deals/new"
                  element={<IndentDealFormPage />}
                />
                <Route
                  path="/indenting/deals/:id"
                  element={<IndentDealDetailPage />}
                />
                <Route
                  path="/indenting/deals/:id/edit"
                  element={<IndentDealFormPage />}
                />
                <Route
                  path="/indenting/parties"
                  element={<IndentingPartiesPage />}
                />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CompanyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}


