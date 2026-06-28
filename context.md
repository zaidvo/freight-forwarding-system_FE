# FREIGHTOS — CURRENT IMPLEMENTATION STATE

Last updated: June 2026

This document describes what is fully implemented and working in the codebase.
It is the single source of truth for developers continuing work on this project.

=====================================================
SYSTEM ARCHITECTURE
===================

Stack: React 18 + TypeScript + Vite + Tailwind CSS + Zustand (state) + React Router v6

Entry point: src/main.tsx → App.tsx → AppRoutes.tsx
Providers (wrapping all routes): AuthProvider → CompanyProvider
Layout: AppLayout.tsx (sidebar + header, wraps every protected page)

All routing is in src/routes/AppRoutes.tsx.
All state is Zustand — no backend calls yet (all data is in-memory seed).
BE integration comments are present throughout the codebase for future wiring.

=====================================================
COMPANY SWITCHER — COMPLETE
============================

- CompanyProvider.tsx: stores active company in React context + localStorage
  key "freightos-active-company". Default: "freight-forwarding".
- Two companies: "freight-forwarding" (Freight Forwarding) and "import-export"
  (Import / Export / Trading).
- Switching company: updates sidebar nav, dashboard KPIs, and module tiles
  instantly without page reload.
- AppLayout.tsx: FREIGHT_NAV vs TRADING_NAV arrays switch based on isFreight.
- DashboardPage.tsx: freightKpis vs tradingKpis strip, FREIGHT_MODULES vs
  TRADING_MODULES tiles — both fully company-specific.
- All routes (/trading/_ and /freight/_) are always registered regardless of
  active company — no route guards. Both companies can access either flow.

=====================================================
SIDEBAR NAVIGATION — COMPLETE
==============================

FREIGHT FORWARDING company nav:
Main → Dashboard, Account Management
Operations → Freight Operations, New Inquiry, Packing List, Bill of Lading
Sales → Proforma Invoice, Sales Overview (soon)
Finance → Finance (soon)
Marketing → Marketing (soon)

IMPORT / EXPORT (Trading) company nav:
Main → Dashboard, Account Management
Operations → Trading Pipeline, New Inquiry, Deal Confirmation
Sales → Quotation, Proforma Invoice, Purchase Order, Sales Overview (soon)
Finance → Finance (soon)
Marketing → Marketing (soon)

Sidebar is collapsible (icon-only mode). State persisted in localStorage.
Active section header highlighted in blue.

=====================================================
DASHBOARD — COMPLETE
====================

- KPI strip is company-aware:
  Freight: Total Shipments, In Transit, Completed, Inquiries (live from store)
  Trading: Inquiries, Quoted, Deals Confirmed, Completed (live from store)
- Module tile grid is company-aware:
  Freight: Account Management, Freight Operations, Finance, Sales, Marketing
  Trading: Account Management, Trading Pipeline, Finance, Sales, Marketing
  Tiles link to their respective routes. Finance/Marketing show "Soon" badge.

=====================================================
TRADING MODULE — COMPLETE
==========================

Store: src/modules/trading/store/tradingStore.ts
Types: src/modules/trading/types.ts
Seed: src/modules/trading/data/seed.ts

State: inquiries[], quotations[], purchaseOrders[], deals[]

All 6 workflow steps implemented end-to-end:

STEP 1 — TRADING INQUIRY
Page: /trading/inquiry/new and /trading/inquiry/:id (TradingInquiryPage.tsx)

- New form: Buyer, Contact Person, Email, Phone, Product, Quantity, Unit,
  Destination Country, Inquiry Date, Notes, Assigned Salesperson
- Auto-generated Inquiry ID (INQ-YYYY-XXX)
- Status: draft → inquiry_received on Submit
- Full audit trail displayed
- WorkflowStepper showing current pipeline stage on every trading page
  Store actions: createInquiry(), submitInquiry()

STEP 2 — QUOTATION
Page: /trading/quotation/new?inquiryId= (QuotationPage.tsx)

- Pre-fills Customer, Product, Quantity from linked inquiry
- Fields: Customer, Product, Quantity, Unit Price, Currency, Incoterms,
  Payment Terms, Valid Until, Remarks, live Total Value
- READ-ONLY VIEW MODE: when a quotation already exists for the inquiry,
  page opens in view mode showing all fields as a record card.
  Edit button switches to form mode. Cancel Edit returns to view mode.
- Status: inquiry_received → quoted
  Store action: createQuotation()

STEP 3 — PROFORMA INVOICE
Page: /trading/pi/new?inquiryId= (TradingProformaInvoicePage.tsx)

- Reuses ProformaInvoiceFormPanel and ProformaInvoicePreview from
  src/modules/sales/components/ — zero duplication.
- Pre-fills from inquiry (buyer, product, quantity, destination) and
  quotation (unit price, incoterms, payment terms, currency).
- Side-by-side form + live preview. Mobile tab switcher (Form / Preview).
- VALIDATION V1: "Issue PI & Continue" button is disabled and a warning
  banner shown if no quotation exists for this inquiry.
- Export PDF button (window.print()).
- Status: quoted → pi_issued
  Store action: issuePIForInquiry()

STEP 4 — PURCHASE ORDER
Page: /trading/po/new?inquiryId= (PurchaseOrderPage.tsx)

- Fields: PO Number (required), PO Date, Customer Notes, File Upload
  (PDF/Word/Image — filename stored, MinIO comment for BE wiring)
- Status: pi_issued → po_received
  Store action: recordPO()

STEP 5 — DEAL CONFIRMATION
Page: /trading/deal/new?inquiryId= (DealConfirmationPage.tsx)

- Shows full deal summary: Buyer, Product, Quantity, Unit Price, Total Value,
  Incoterms, Payment Terms, PO Number, PO Date
- Approve Deal → generates unique DEAL-YYYY-XXX Deal ID, shows confirmed state
- Reject Deal → textarea for reason, navigates back to /trading
- After confirmation: "Proceed to Freight Decision" button triggers Step 6
- Audit trail displayed at bottom
  Store actions: confirmDeal(), rejectDeal()

STEP 6 — FREIGHT DECISION (ShipmentDecisionDialog.tsx)

- Modal shows deal summary and asks: "Will freight be handled by our company?"
- YES path:
  1. Calls createInquiryFromDeal() on freightStore — creates FreightInquiry
     pre-filled with customer, product, origin, destination, fromTradingDealId
  2. Navigates directly to /freight/shipment/new?inquiryId=
     (skips freight quotation and booking — pricing from trade deal)
  3. On the shipment form, Customer/Origin/Destination fields are locked
     (read-only) since they come from the trading deal (V3)
  4. Deal status → shipment_created
- NO path:
  Deal status → trading_completed. Navigate to /trading.
- Dialog wired in both TradingPage.tsx (table actions) and
  DealConfirmationPage.tsx (confirmed deal state).
  Store action: handleFreightDecision()

TRADING LIST PAGE (/trading — TradingPage.tsx)

- KPI cards: Total Inquiries, Received, Quoted, Deals Confirmed (live)
- Table columns: Inquiry ID, Date (createdAt), Buyer, Product, Qty,
  Destination, Salesperson, Status, Actions
- Search bar: filters by buyer, product, or inquiry ID
- Status filter dropdown: filters by any TradingStatus value
- Row click → /trading/inquiry/:id
- Action buttons per status: Quote / Issue PI / Record PO / Confirm Deal /
  Freight Decision — all context-sensitive

=====================================================
FREIGHT MODULE — COMPLETE
==========================

Store: src/modules/freight/store/freightStore.ts
Types: src/modules/freight/types.ts
Seed: src/modules/freight/data/seed.ts
Validation: src/modules/freight/lib/validation.ts

State: inquiries[], quotations[], bookings[], shipments[]

Two entry paths:

PATH 1 — From Trading Deal
Triggered by Step 6 YES decision in trading workflow.
Creates FreightInquiry with fromTradingDealId set.
Navigates directly to shipment creation form (quotation/booking skipped).
Customer, Origin, Destination locked read-only on shipment form.

PATH 2 — Manual (External Client)
Page: /freight/inquiry/new (FreightInquiryPage.tsx)
Fields: Customer, Origin, Destination, Mode (Sea/Air/Land), Commodity,
Weight, Volume, Remarks
Store action: createInquiry()

FREIGHT LIST PAGE (/freight — FreightPage.tsx)
TWO TABS:

- Shipments tab: Shipment ID, Customer, Route, Container, ETD, ETA,
  Doc Progress (progress bar with uploaded/total), Status, Actions
  Row click → /freight/shipment/:id
- Inquiries tab: Inquiry ID, Customer, Commodity, Route, Mode,
  Source (From Deal badge vs Manual badge), Status, Next Step button
  Next Step: Create Quotation / Book Shipment / Create Shipment per status
  KPI cards: Total Shipments, In Transit, Awaiting Docs, Completed (live)
  Search bar filters both tabs.

STEP 2 — FREIGHT QUOTATION
Page: /freight/quotation/new?inquiryId= (FreightQuotationPage.tsx)

- Inquiry summary banner (customer, commodity, route, mode)
- Fields: Carrier Rates, Local Charges, Handling Charges, Customs Charges,
  Margin/Profit, Currency
- Live total calculation
- Status: inquiry → quoted
  Store action: createQuotation()

STEP 3 — BOOKING
Page: /freight/booking/new?inquiryId= (FreightBookingPage.tsx)

- Inquiry summary banner
- Fields: Carrier, Vessel Name / Flight No. (label adapts to Air vs Sea mode),
  Voyage/Flight Number, Scheduled Departure, Booking Reference
- VALIDATION V2: "Confirm Booking" disabled with warning if no quotation
  exists for this inquiry. Link to create quotation shown.
- Field-level red border validation on Carrier and Booking Reference (V7)
- Status: quoted → booked
  Store action: createBooking()

STEP 4 — SHIPMENT CREATION
Page: /freight/shipment/new?inquiryId= (FreightShipmentFormPage.tsx)

- Pre-fills Customer, Origin, Destination from linked inquiry
- PATH 1 LOCK (V3): When inquiry has fromTradingDealId, Customer/Origin/
  Destination render as locked ReadonlyField (non-editable) with lock icon.
  Sky-blue notice banner shown explaining the source trading deal.
  Inquiry selector also disabled.
- Fields: Container Number, ETD, ETA, Origin, Destination, Carrier, Customer
- VALIDATION V7: Field-level red border + inline error on all required fields
  when submitting empty (containerNumber, etd, eta, carrier, customer,
  origin, destination). Errors clear on field change.
- Status: booked → shipment_created
  Store action: createShipment()

STEP 5–9 — SHIPMENT DETAIL
Page: /freight/shipment/:id (ShipmentDetailPage.tsx)

SMART BACK-LINK (F4):
When shipment was created from a trading deal, a sky-blue banner at the top
shows "This shipment was created from Trading Deal DEAL-XXXX" with a
"View Deal" button linking back to /trading/deal/new?inquiryId=...

QUICK SUMMARY BAR:
Always-visible strip showing Carrier, Container, ETD, ETA.

FIVE TABS:

1. LOGISTICS TAB
   - Editable fields: Container Number, Carrier, ETD, ETA
   - Origin/Destination: editable for Path 2, read-only (ReadonlyField) for
     Path 1 (trading deal shipments) — V3 enforcement
   - "Save Changes" button calls updateShipmentLogistics() with success flash
   - LOCKED STATE (V6): All fields become ReadonlyField when status=completed

2. TRACKING TAB
   - Visual vertical timeline: each event shows FreightStatusBadge, user,
     timestamp, and remarks
   - "Update Status" section (hidden when locked):
     Remarks input, then 1-2 next-status buttons in sequence
   - VALIDATION V4: Before advancing to out_for_delivery or delivered,
     checks that commercial_invoice, packing_list, hbl are uploaded.
     Blocking error message shown if any are missing. Advance is blocked.
   - 8 tracking statuses: Cargo Received → At Origin Port → Loaded on Vessel
     → In Transit → Arrived → Customs Clearance → Out for Delivery → Delivered

3. DOCUMENTS TAB
   - CLIENT DOCUMENTS: Commercial Invoice, Packing List, Certificate of
     Origin, Insurance Certificate
   - FORWARDER DOCUMENTS: House Bill of Lading, Shipping Instructions,
     Arrival Notice, Delivery Order, Proof of Delivery (POD)
   - 9 documents total per shipment (all initialized on creation)
   - Each DocumentRow shows: upload status icon, label, version, upload date,
     uploaded-by user (when uploaded)
   - Upload button opens a REAL file picker (input type=file,
     accepts PDF/DOC/DOCX/JPG/PNG). Selected file creates a local object URL
     so the View link works immediately.
   - View button (opens in new tab), Replace button replaces existing file
   - Version tracking: version number increments on each upload
   - Upload/Replace hidden when shipment is locked (V6)

4. FINANCE TAB
   - 4 KPI cards: Freight Invoice (blue), Client Payments (emerald),
     Vendor Charges (rose), Profit (emerald/rose based on value) — all live
   - Record Transactions section (hidden when locked — V6):
     Set Freight Invoice (USD) → setFreightInvoice()
     Record Client Payment (USD) → recordPayment()
     Record Vendor Charge (USD) → recordVendorCharge() ← all 3 wired
   - Outstanding balance amber warning banner when invoice > payments

5. CLOSURE TAB
   - Pre-closure checklist:
     ✓/⚠ Status must be "Delivered"
     ✓/✗ Payments fully cleared (outstanding amount shown in red if not)
     ✓/⚠ Required documents uploaded
   - Blocking error card lists all reasons preventing closure
   - VALIDATION V5: "Close & Archive Shipment" button is DISABLED (not just
     warned) when any checklist item fails. Title tooltip explains why.
   - On close: calls closeShipment() → status = "completed"
   - Locked state shown when already completed (V6)

FULL LOCK (V6):
When shipment.status === "completed": - Logistics tab: all fields become ReadonlyField - Tracking tab: Update Status section hidden - Documents tab: Upload/Replace buttons hidden - Finance tab: Record Transactions section hidden - Closure tab: shows "Shipment Closed — All records locked and archived"

=====================================================
VALIDATION SUMMARY — ALL ENFORCED
===================================

V1 — PI blocked without quotation:
TradingProformaInvoicePage: "Issue PI & Continue" disabled + amber warning
banner with link to create quotation if none exists.

V2 — Booking blocked without freight quotation:
FreightBookingPage: "Confirm Booking" disabled + amber warning banner
with link to create quotation if none exists.

V3 — Path 1 fields locked (from trading deal):
FreightShipmentFormPage: Customer/Origin/Destination are ReadonlyField.
ShipmentDetailPage Logistics tab: Origin/Destination are ReadonlyField.
Both show explanatory locked notice banners.

V4 — Status advance blocked without mandatory documents:
ShipmentDetailPage Tracking tab: advancing to out_for_delivery or delivered
blocked if commercial_invoice, packing_list, or hbl not uploaded.
Error message lists missing document names.

V5 — Closure blocked with outstanding payments:
ShipmentDetailPage Closure tab: Close button disabled when any blockers exist
(outstanding payments, status not delivered, missing docs).

V6 — Full read-only when completed:
ShipmentDetailPage: all write actions hidden/disabled when status=completed.

V7 — Field-level red border validation:
FreightShipmentFormPage: all required fields get red border + inline error.
FreightBookingPage: Carrier and Booking Reference get red border + inline error.
Both clear on field change.

=====================================================
OPERATIONS MODULE
=================

Pages: /operations (OperationsPage), /operations/packing-list, /operations/bill-of-lading
Standalone document generators — not integrated into the freight workflow yet.
Packing List: form + preview (PackingListPage)
Bill of Lading: form + preview (BillOfLadingPage)
These appear in the Freight company sidebar under Operations.

=====================================================
SALES MODULE
============

Pages: /sales (SalesPage), /sales/proforma-invoice (ProformaInvoicePage)
Standalone standalone PI generator — reused by TradingProformaInvoicePage.
Components in src/modules/sales/components/:
ProformaInvoiceForm.tsx — reusable form panel
ProformaInvoicePreview.tsx — live document preview
These appear in both company sidebars under Sales.

=====================================================
ACCOUNTS MODULE — COMPLETE
===========================

Page: /accounts (AccountsPage)
Full user management: Users table, Create/Edit/Delete user dialogs,
Roles panel, Permissions dialog, Audit log table, Status pills.
Appears in both company sidebars under Main.

=====================================================
FINANCE / MARKETING MODULES
============================

Pages exist (FinancePage.tsx, MarketingPage.tsx) but are placeholder "Coming Soon" screens.
Shown as "Soon" in sidebar. Finance tile links to /finance (not yet wired in nav).

=====================================================
AUTH — COMPLETE
===============

AuthProvider.tsx: JWT-based auth with token expiry watcher (30s interval).
Login page at /login. ProtectedRoute and GuestRoute guards in place.
User avatar initials displayed in sidebar footer and top header.
Logout clears token and redirects to /login.

=====================================================
DOCUMENTS STRUCTURE
===================

Every FreightShipment is initialized with 9 documents:
Client: commercial_invoice, packing_list, coo, insurance
Forwarder: hbl, shipping_instructions, arrival_notice, delivery_order, pod

Validation gates:

- To advance to out_for_delivery / delivered:
  commercial_invoice, packing_list, hbl must be uploaded
- To close shipment:
  commercial_invoice, packing_list, hbl, delivery_order must be uploaded

=====================================================
KNOWN GAPS / FUTURE WORK
=========================

1. No real backend — all data is Zustand in-memory. BE integration points
   are commented throughout with specific API endpoints.

2. File uploads use local object URLs (URL.createObjectURL). Production needs
   MinIO/S3 integration via POST /api/v1/documents/upload.

3. Finance module is a placeholder. Freight finance is handled inside
   ShipmentDetailPage finance tab, not a standalone finance dashboard.

4. Operations module (Packing List, Bill of Lading) is standalone and not yet
   linked to specific shipment records.

5. Sales overview page is a "Soon" placeholder for both companies.

6. Quotation view mode in trading: existing quotations show in read-only view.
   Edit mode re-submits as a new quotation (creates duplicate). BE should
   implement PUT /api/v1/trading/quotations/:id for updates.

7. No pagination on any list view — will need BE-side pagination when data grows.

8. No role-based route guards beyond authenticated/unauthenticated. The accounts
   module has roles/permissions defined but they are not yet enforced on routes.
