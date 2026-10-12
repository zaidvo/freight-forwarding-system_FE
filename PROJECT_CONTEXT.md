# PROJECT_CONTEXT.md
# B2B Global Supplies — Frontend Project Context

**Single source of truth for project context. Updated: October 2026.**
**This file supersedes all previous markdown files (context.md, audit_report.md, for aadil to read .md, src/README.md, src/prompt.md).**

---

## 1. Project Overview

B2B Global Supplies is a multi-company ERP / operations management system. It serves two distinct internal company workflows:

1. **Freight Forwarding** — Manages the logistics lifecycle: inquiries, quotations, bookings, shipments, cargo tracking, documents, finance, and closure.
2. **Trading (Import/Export)** — Manages trading sales pipeline (inquiry → quotation → PI → PO) and a separate Import Shipments document management workflow (Draft BL → HBL → MBL → clearing invoice → payment receipt → detention invoice).

Both companies share authentication, account management, and the sidebar layout. Users can switch between companies via a top-header dropdown.

---

## 2. Tech Stack

| Area             | Technology                                           |
|------------------|------------------------------------------------------|
| Framework        | React 19 + TypeScript 6                              |
| Bundler          | Vite 8                                               |
| Routing          | React Router 7                                       |
| State Management | Zustand 5 (Freight & Trading sales stores are in-memory; Import store is API-backed) |
| Styling          | Tailwind CSS 3 + clsx + tailwind-merge               |
| Icons            | lucide-react                                         |
| PDF Generation   | jsPDF 4 (client-side PDF output)                     |
| PDF Rendering    | pdfjs-dist 6 (for uploaded PDF preview)              |
| HTTP Client      | Native `fetch` via shared `apiRequest` helper        |
| Auth             | JWT stored in localStorage (`freighterp_access_token`) |

---

## 3. Environment

```
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Set in `.env`. Used by `src/shared/services/api.ts` as the base for all backend calls. Falls back to `http://127.0.0.1:8000/api/v1` if the env variable is absent.

---

## 4. Folder Structure

```
/
├── public/
│   ├── b2b-favicon.svg
│   ├── b2b-logo.pdf
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── App.tsx                        # Renders <AppRoutes />
│   ├── main.tsx                       # React DOM entry
│   ├── index.css                      # Global Tailwind base
│   ├── assets/
│   ├── app/
│   │   ├── providers/
│   │   │   ├── AuthProvider.tsx       # JWT auth context
│   │   │   └── CompanyProvider.tsx    # Company switcher context
│   │   ├── layout/
│   │   │   └── AppLayout.tsx          # Sidebar + header shell
│   │   ├── routes/
│   │   │   ├── AppRoutes.tsx          # All route definitions
│   │   │   ├── Login.tsx              # Login page
│   │   │   ├── ProtectedRoute.tsx     # Auth guard
│   │   │   ├── GuestRoute.tsx         # Redirect if logged in
│   │   │   └── ModuleAccessRoute.tsx  # Permission guard
│   │   └── dashboard/
│   │       ├── pages/DashboardPage.tsx
│   │       ├── data/modules.ts        # FREIGHT_MODULES / TRADING_MODULES
│   │       └── components/ModuleTile.tsx
│   ├── companies/
│   │   ├── freight/
│   │   │   ├── types.ts
│   │   │   ├── store/freightStore.ts
│   │   │   ├── lib/validation.ts
│   │   │   ├── data/seed.ts
│   │   │   ├── components/FreightStatusBadge.tsx
│   │   │   └── pages/
│   │   │       ├── FreightPage.tsx
│   │   │       ├── FreightInquiryPage.tsx
│   │   │       ├── FreightQuotationPage.tsx
│   │   │       ├── FreightBookingPage.tsx
│   │   │       ├── FreightShipmentFormPage.tsx
│   │   │       └── ShipmentDetailPage.tsx
│   │   └── trading/
│   │       ├── types.ts               # Trading sales pipeline types
│   │       ├── types/importTypes.ts   # Import module types
│   │       ├── store/tradingStore.ts
│   │       ├── store/importStore.ts
│   │       ├── services/tradingImportService.ts  # API calls for import module
│   │       ├── utils/pdfGenerator.ts  # jsPDF PDF generators
│   │       ├── data/seed.ts
│   │       ├── components/
│   │       │   ├── StatusBadge.tsx
│   │       │   ├── WorkflowStepper.tsx
│   │       │   └── import/
│   │       │       ├── WorkflowTimeline.tsx
│   │       │       ├── DraftBLForm.tsx
│   │       │       ├── HouseBLForm.tsx
│   │       │       ├── MasterBLForm.tsx
│   │       │       ├── ImportClearingInvoiceForm.tsx
│   │       │       ├── PaymentReceiptForm.tsx
│   │       │       ├── DetentionInvoiceForm.tsx
│   │       │       ├── PdfUploadSection.tsx
│   │       │       ├── DocumentStatusBadge.tsx
│   │       │       ├── ContainerTable.tsx
│   │       │       ├── ChargesTable.tsx
│   │       │       └── NewImportDialog.tsx
│   │       └── pages/
│   │           ├── TradingPage.tsx
│   │           ├── TradingInquiryPage.tsx
│   │           ├── QuotationPage.tsx
│   │           ├── TradingProformaInvoicePage.tsx
│   │           ├── PurchaseOrderPage.tsx
│   │           ├── ImportListPage.tsx
│   │           └── ImportWorkspacePage.tsx
│   ├── modules/
│   │   ├── accounts/
│   │   │   ├── types.ts
│   │   │   ├── hooks/                 # Custom hooks for accounts
│   │   │   ├── pages/AccountsPage.tsx
│   │   │   └── components/
│   │   │       ├── UsersTable.tsx
│   │   │       ├── RolesPanel.tsx
│   │   │       ├── AuditLogTable.tsx
│   │   │       ├── CreateUserDialog.tsx
│   │   │       ├── EditUserDialog.tsx
│   │   │       ├── DeleteUserDialog.tsx
│   │   │       ├── PermissionsDialog.tsx
│   │   │       ├── ActionBadge.tsx
│   │   │       └── StatusPill.tsx
│   │   ├── sales/
│   │   │   ├── types.ts
│   │   │   ├── pages/
│   │   │   │   ├── SalesPage.tsx
│   │   │   │   └── ProformaInvoicePage.tsx
│   │   │   ├── components/
│   │   │   │   ├── ProformaInvoiceForm.tsx   # Reusable form panel
│   │   │   │   └── ProformaInvoicePreview.tsx # Live preview
│   │   │   └── data/seed.ts
│   │   └── operations/
│   │       ├── types.ts
│   │       ├── pages/
│   │       │   ├── OperationsPage.tsx
│   │       │   ├── PackingListPage.tsx
│   │       │   └── BillOfLadingPage.tsx
│   │       ├── components/
│   │       │   ├── PackingListForm.tsx
│   │       │   ├── PackingListPreview.tsx
│   │       │   ├── BillOfLadingForm.tsx
│   │       │   └── BillOfLadingPreview.tsx
│   │       └── data/seed.ts
│   └── shared/
│       ├── components/
│       │   ├── BrandLogo.tsx
│       │   ├── SaveFeedback.tsx
│       │   └── ui/
│       │       ├── Button.tsx
│       │       ├── Input.tsx
│       │       ├── Select.tsx
│       │       ├── Label.tsx
│       │       ├── Dialog.tsx
│       │       └── Checkbox.tsx
│       ├── services/
│       │   ├── api.ts                 # Base fetch, token management, types
│       │   ├── authService.ts         # login/logout/getMe/getMyAccess
│       │   ├── userService.ts         # listUsers/createUser/updateUser/deactivateUser
│       │   ├── groupService.ts        # listGroups/createGroup/updateGroup/deleteGroup/updateUserGroups
│       │   ├── moduleService.ts       # listModules
│       │   └── activityLogService.ts  # listActivityLogs (pagination + category filter)
│       └── lib/
│           └── utils.ts               # cn() helper (clsx + tailwind-merge)
```

---

## 5. Application Architecture

### Entry Point
`src/main.tsx` → `App.tsx` → `AppRoutes.tsx`

Provider wrapping order: `<BrowserRouter>` → `<AuthProvider>` → `<CompanyProvider>` → Routes

### Route Guards
- **ProtectedRoute** — redirects to `/login` if not authenticated; shows spinner while loading.
- **GuestRoute** — redirects to `/` if already authenticated (wraps `/login`).
- **ModuleAccessRoute** — checks `hasModuleAccess(moduleSlug)` from `AuthProvider`. Each module has a slug (`account-management`, `operations`, `sales`). If the user's group does not have access, the route silently redirects (no explicit 403 page currently).

### Company Switcher
`CompanyProvider` stores `activeCompanyId` in React state + `localStorage` (key: `freightos-active-company`). Two company IDs: `freight-forwarding` and `import-export`. A third + fourth workspace ("Customers", "Indenting") appear in the switcher as "coming soon" and are non-functional.

Switching company changes:
- Sidebar nav (FREIGHT_NAV vs TRADING_NAV)
- Dashboard module tiles (FREIGHT_MODULES vs TRADING_MODULES)
- SalesPage sub-modules
- OperationsPage sub-modules

Routes are **not** company-gated — all routes are always accessible regardless of active company.

### Auth Flow
`AuthProvider` on mount calls `getMe()` (GET `/auth/me`) with the stored JWT. If valid and user is `active`, also calls `getMyAccess()` (GET `/auth/me/access`) to get `modules: string[]`. Module slugs are stored in state. Token expiry is checked every 30 seconds via `isTokenExpired()` (JWT payload decode, no library). Auto-logout on expiry.

Login calls POST `/auth/login`, stores JWT, then calls `/auth/me/access`. Logout calls POST `/auth/logout`, then clears local token.

---

## 6. Routing Map

```
/                               DashboardPage
/login                          LoginPage (GuestRoute)

/accounts                       AccountsPage               [account-management]

/operations                     OperationsPage             [operations]
/operations/packing-list        PackingListPage            [operations]
/operations/bill-of-lading      BillOfLadingPage           [operations]

/freight                        FreightPage                [operations]
/freight/inquiry/new            FreightInquiryPage         [operations]
/freight/quotation/new          FreightQuotationPage       [operations]
/freight/booking/new            FreightBookingPage         [operations]
/freight/shipment/new           FreightShipmentFormPage    [operations]
/freight/shipment/:id           ShipmentDetailPage         [operations]

/trading                        TradingPage                [operations]
/trading/inquiry/new            TradingInquiryPage         [operations]
/trading/inquiry/:id            TradingInquiryPage         [operations]

/sales                          SalesPage                  [sales]
/sales/proforma-invoice         ProformaInvoicePage        [sales]
/trading/quotation/new          QuotationPage              [sales]
/trading/quotation/:id          QuotationPage              [sales]
/trading/pi/new                 TradingProformaInvoicePage [sales]
/trading/pi/:id                 TradingProformaInvoicePage [sales]
/trading/po/new                 PurchaseOrderPage          [sales]
/trading/po/:id                 PurchaseOrderPage          [sales]

/trading/imports                ImportListPage             [sales]
/trading/imports/:id            ImportWorkspacePage        [sales]
/trading/imports/:id/draft-bl   DraftBLForm                [sales]
/trading/imports/:id/hbl        HouseBLForm                [sales]
/trading/imports/:id/mbl        MasterBLForm               [sales]
/trading/imports/:id/invoice    ImportClearingInvoiceForm  [sales]
/trading/imports/:id/payment-receipt  PaymentReceiptForm   [sales]
/trading/imports/:id/detention-invoice  DetentionInvoiceForm [sales]

*                               → Navigate to /
```

Module slugs in brackets `[slug]` are what `ModuleAccessRoute` checks.

---

## 7. Sidebar Navigation

### Freight Forwarding (`freight-forwarding`)
- **Main**: Dashboard `/`, Account Management `/accounts`
- **Operations**: Freight Operations `/freight`, New Inquiry `/freight/inquiry/new`, Packing List `/operations/packing-list`, Bill of Lading `/operations/bill-of-lading`
- **Sales**: Proforma Invoice `/sales/proforma-invoice`

### Trading (`import-export`)
- **Main**: Dashboard `/`, Account Management `/accounts`
- **Operations**: Trading Pipeline `/trading`, New Inquiry `/trading/inquiry/new`
- **Sales**: Import Shipments `/trading/imports`, Quotation `/trading/quotation/new`, Proforma Invoice `/trading/pi/new`, Purchase Order `/trading/po/new`

Sidebar items are filtered by `hasModuleAccess(moduleSlug)` — items without access are hidden. Sidebar is collapsible (state persisted to `freightos-sidebar-collapsed` in localStorage).

---

## 8. Dashboard

`DashboardPage.tsx` displays:
- A welcome section with company-aware title
- A module tile grid filtered by the user's module access

**FREIGHT_MODULES** (shown for Freight Forwarding):
- Account Management → `/accounts` (slug: `account-management`)
- Freight Operations → `/freight` (slug: `operations`)
- Sales → `/sales` (slug: `sales`)

**TRADING_MODULES** (shown for Trading):
- Account Management → `/accounts` (slug: `account-management`)
- Trading Pipeline → `/trading` (slug: `trading`) ← Note: slug is `trading` but there is no `ModuleAccessRoute` for slug `trading`; this module will not show if backend doesn't grant it
- Sales → `/sales` (slug: `sales`)

There are NO KPI cards on the dashboard page. The old KPI strip was removed — the current page only shows module tiles.

---

## 9. Account Management Module

**Route:** `/accounts` | **Module slug:** `account-management`
**Backend:** Fully API-backed — no in-memory seed.

### Tabs
1. **Users** — Table of all users. Columns: Name, Email, Role, Status, Last Active, Groups, Actions.
   - Create user: `POST /users`
   - Edit user (name, email, status, password): `PUT /users/:id`
   - Deactivate user: `DELETE /users/:id`
   - Search by name/email, filter by status (all / active / inactive)
2. **Groups (Roles)** — Roles panel. Groups map to module access.
   - Create/Edit/Delete groups: `/groups` endpoints
   - Assign users to groups: `PUT /groups/users/:userId`
   - Groups have `module_ids[]` controlling which modules members can access
3. **Audit Log** — Activity log table.
   - `GET /activity-logs` with pagination and category filter (`important` / `auth` / `users` / `all`)
   - Columns: Actor, Action badge, Description, IP, Timestamp

### Export
AccountsPage has a jsPDF export button that generates a PDF of the users table.

### Access Control
Only `root` role users see the "Create User" button and can deactivate other users. Non-root users can only edit their own profile (partially — the UI shows edit for all users regardless of role check; this is a known gap).

---

## 10. Freight Forwarding Workflow

**Store:** `src/companies/freight/store/freightStore.ts` (Zustand, in-memory)
**Types:** `src/companies/freight/types.ts`
**Validation:** `src/companies/freight/lib/validation.ts`

All freight state is in-memory Zustand. Backend integration endpoints are commented throughout but not wired.

### Data Model

```typescript
FreightInquiry: {
  id: string,          // FI-YYYY-NNN
  customer, origin, destination, mode: "Air"|"Sea"|"Land",
  commodity, weight, volume, remarks,
  status: FreightStatus,
  fromTradingDealId?: string,   // set when auto-created from trading deal
  timeline: TrackingEvent[],
  createdAt: string
}

FreightQuotation: {
  id: string,          // FQ-{timestamp}
  inquiryId, carrierRates, localCharges, handlingCharges, customsCharges, margin,
  totalPrice, currency: "USD"|"PKR"|"EUR",
  status, createdAt
}

Booking: {
  id: string,          // BK-{timestamp}
  inquiryId, carrier, vesselFlight, voyageNumber, schedule, bookingReference,
  status, createdAt
}

FreightShipment: {
  id: string,          // SHP-YYYY-NNN
  inquiryId, bookingId?,
  containerNumber, etd, eta, origin, destination, carrier, customer,
  status: FreightStatus,
  documents: FreightDocument[],  // 9 docs initialized on creation
  timeline: TrackingEvent[],
  freightInvoiceAmount?, clientPayments, vendorCharges,
  createdAt
}
```

### FreightStatus Values (tracking sequence)
`draft → inquiry → quoted → booked → shipment_created → cargo_received → at_origin_port → loaded_on_vessel → in_transit → arrived_at_destination → customs_clearance → out_for_delivery → delivered → completed`

### Workflow Steps

**Step 1 — Freight Inquiry** (`/freight/inquiry/new`)
- Manual creation for external clients (Path 2)
- Fields: Customer, Origin, Destination, Mode, Commodity, Weight, Volume, Remarks
- Store: `createInquiry()`

**Auto-create from Trading Deal (Path 1)**
- `createInquiryFromDeal()` creates a FreightInquiry with `fromTradingDealId` set
- Currently called from the old trading pipeline flow; the trading store no longer has `handleFreightDecision` so this path is only triggered manually

**Step 2 — Freight Quotation** (`/freight/quotation/new?inquiryId=`)
- Fields: Carrier Rates, Local Charges, Handling Charges, Customs Charges, Margin, Currency
- Live total calculation
- Store: `createQuotation()` → updates inquiry status to `quoted`

**Step 3 — Booking** (`/freight/booking/new?inquiryId=`)
- **V2 (Implemented):** Confirm Booking button is disabled + amber warning shown if no quotation exists for the inquiry
- Fields: Carrier\*, Booking Reference\*, Vessel/Flight Name, Voyage Number, Scheduled Departure
- **V7 (Implemented):** Red border + inline error on Carrier and Booking Reference when empty
- Store: `createBooking()` → updates inquiry status to `booked`

**Step 4 — Create Shipment** (`/freight/shipment/new?inquiryId=`)
- Pre-fills from linked inquiry
- **V3 (Implemented):** If inquiry has `fromTradingDealId`, Customer/Origin/Destination render as `ReadonlyField` (non-editable) with lock icon and sky-blue notice banner
- Inquiry selector is disabled for Path 1 shipments
- **V7 (Implemented):** Full field-level red border + inline error on submit for all required fields: containerNumber, etd, eta, carrier, customer, origin, destination
- Store: `createShipment()` → initializes 9 documents, tracking timeline, finance fields

**Steps 5–9 — Shipment Detail** (`/freight/shipment/:id`)

5 tabs:

**Logistics Tab**
- Editable: Container Number, Carrier, ETD, ETA
- Origin/Destination: editable for Path 2, `ReadonlyField` for Path 1 (V3)
- Save Changes calls `updateShipmentLogistics()`; shows "Saved" flash on success
- All fields become `ReadonlyField` when `status === completed` (V6)

**Tracking Tab**
- Visual vertical timeline: each event shows `FreightStatusBadge`, user, timestamp, remarks
- Update Status section (hidden when locked V6): remarks input + next 1–2 status buttons
- **V4 (Implemented):** Before advancing to `out_for_delivery` or `delivered`, checks `commercial_invoice`, `packing_list`, `hbl` are uploaded. Blocking error message shown if any missing.
- Tracking statuses advance in order per `TRACKING_SEQUENCE`

**Documents Tab**
- **Client Documents:** Commercial Invoice, Packing List, Certificate of Origin, Insurance Certificate
- **Forwarder Documents:** HBL, Shipping Instructions, Arrival Notice, Delivery Order, Proof of Delivery (POD)
- Each row: upload status icon, label, version, upload date + uploader when uploaded
- Upload button: opens real `<input type=file>` picker (PDF/DOC/DOCX/JPG/PNG). Creates `URL.createObjectURL()` for local "View" link.
- Replace button replaces existing file. Version increments on each upload.
- Upload/Replace hidden when locked (V6)

**Finance Tab**
- 4 KPI cards: Freight Invoice (blue), Client Payments (emerald), Vendor Charges (rose), Profit (emerald/rose)
- Record Transactions section (hidden when locked V6):
  - Set Freight Invoice (USD): `setFreightInvoice()`
  - Record Client Payment (USD): `recordPayment()`
  - Record Vendor Charge (USD): `recordVendorCharge()`
- Amber outstanding balance warning when `freightInvoiceAmount > clientPayments`

**Closure Tab**
- Pre-closure checklist: Status (must be Delivered), Payments (must be cleared), Documents
- **V5 (Implemented):** Close button is `disabled` when any checklist item fails; `canCloseShipment()` validation used
- All blocking reasons listed in rose error card
- On close: `closeShipment()` → status = `completed`
- Locked state shown when already completed (V6)

**Smart Back-link (Implemented)**
When `linkedInquiry.fromTradingDealId` exists, a sky-blue banner shows at top of ShipmentDetailPage: "This shipment was created from Trading Deal DEAL-XXXX" with a "View Trading Pipeline" button navigating to `/trading`.

### Validation Summary
| Code | Description | Status |
|------|-------------|--------|
| V2 | Booking blocked without freight quotation | **Implemented** |
| V3 | Path 1 fields (customer/origin/destination) locked | **Implemented** |
| V4 | Status advance to delivery blocked without required docs | **Implemented** |
| V5 | Closure blocked with outstanding payments | **Implemented** (hard block) |
| V6 | Full read-only when status=completed | **Implemented** |
| V7 | Field-level red border + inline error on submit | **Implemented** (shipment form + booking) |

---

## 11. Trading Sales Pipeline

**Store:** `src/companies/trading/store/tradingStore.ts` (Zustand, in-memory)
**Types:** `src/companies/trading/types.ts`

All trading pipeline state is in-memory Zustand. Backend integration endpoints are commented but not wired.

### Data Model

```typescript
TradingInquiry: {
  id: string,          // TI-YYYY-NNN (generated)
  buyer, contactPerson, email, phone, product, quantity, unit,
  destinationCountry, inquiryDate, notes, assignedSalesperson,
  status: TradingStatus,
  auditTrail: AuditEntry[],
  createdAt
}

Quotation: {
  id: string,          // QT-YYYY-NNN
  inquiryId, customer, product, quantity, unitPrice,
  currency: "USD"|"PKR"|"EUR"|"GBP",
  incoterms, paymentTerms, validUntil, remarks,
  status, auditTrail, createdAt
}

PurchaseOrder: {
  id: string,          // PO-YYYY-NNN
  piId, inquiryId, poNumber, poDate, attachmentUrl?, customerNotes,
  status, auditTrail, createdAt
}
```

### TradingStatus Values
`draft → inquiry_received → quoted → pi_issued → po_received`

**Note:** The pipeline previously had `deal_confirmed`, `shipment_created`, and `trading_completed` statuses along with DealConfirmationPage and ShipmentDecisionDialog. These have been **removed**. The current pipeline ends at `po_received`. The `TradingStatus` type still includes the old values but they are never set by any store action.

### Workflow Steps

**TradingPage** (`/trading`)
- KPI cards: Total Inquiries, Received, Quoted, PO Received
- Table: Inquiry ID, Date, Buyer, Product, Qty, Destination, Salesperson, Status, Actions
- Search: filters by buyer, product, or inquiry ID
- Status filter: dropdown with all TradingStatus values
- Row click → `/trading/inquiry/:id`
- Context-sensitive action buttons: Quote / Issue PI / Record PO per status

**Step 1 — Trading Inquiry** (`/trading/inquiry/new`, `/trading/inquiry/:id`)
- New/Edit form: Buyer, Contact Person, Email, Phone, Product, Quantity, Unit, Destination Country, Inquiry Date, Notes, Assigned Salesperson
- Auto-generated ID (TI-YYYY-XXX)
- WorkflowStepper showing current pipeline stage
- Audit trail displayed
- Store: `createInquiry()`, `submitInquiry()` (draft → inquiry_received)

**Step 2 — Quotation** (`/trading/quotation/new?inquiryId=`)
- Pre-fills Customer, Product, Quantity from linked inquiry
- Fields: Customer, Product, Quantity, Unit Price, Currency, Incoterms, Payment Terms, Valid Until, Remarks, live Total Value
- If a quotation already exists for the inquiry, fields are pre-filled from it (form re-submission creates a new quotation; no update/edit path)
- **V1 (Implemented):** "Issue PI & Continue" disabled + amber warning if no quotation exists (enforced in TradingProformaInvoicePage)
- Store: `createQuotation()` → inquiry status → `quoted`

**Step 3 — Proforma Invoice** (`/trading/pi/new?inquiryId=`)
- Reuses `ProformaInvoiceForm` and `ProformaInvoicePreview` from `src/modules/sales/components/` — no duplication
- Pre-fills from inquiry (buyer, product, quantity, destination) and quotation (unit price, incoterms, payment terms, currency)
- Side-by-side form + live preview
- **V1 (Implemented):** If no quotation exists, "Issue PI & Continue" is disabled with amber warning banner
- PDF export via `window.print()`
- Store: `issuePIForInquiry()` → inquiry status → `pi_issued`

**Step 4 — Purchase Order** (`/trading/po/new?inquiryId=`)
- Fields: PO Number (required), PO Date, Customer Notes, File Upload (PDF/Word/Image — filename stored)
- Store: `recordPO()` → inquiry status → `po_received`

**Pipeline ends at po_received.** No Deal Confirmation or Freight Decision steps exist in the current codebase.

### Validation Summary
| Code | Description | Status |
|------|-------------|--------|
| V1 | PI blocked without quotation | **Implemented** |

---

## 12. Trading Import Module

**Store:** `src/companies/trading/store/importStore.ts` (Zustand, **API-backed**)
**Service:** `src/companies/trading/services/tradingImportService.ts`
**Types:** `src/companies/trading/types/importTypes.ts`
**Routes:** Under `/trading/imports/*` — protected by `sales` module slug

This is a fully independent module from the trading sales pipeline. It manages import shipment files with a 6-document workflow.

### Backend API Endpoints (all under `/api/v1/trading-import/sales/records`)
| Method | Path | Purpose |
|--------|------|---------|
| GET    | `/records` | List all import records |
| POST   | `/records` | Create new import record |
| GET    | `/records/:id` | Get single record |
| PUT    | `/records/:id/forms/:docType` | Save/update a BL form (draft_bl, house_bl, master_bl) |
| PUT    | `/records/:id/freight-invoice` | Save clearing invoice |
| POST   | `/records/:id/payment-receipts` | Create payment receipt |
| PUT    | `/records/:id/detention-invoice` | Save detention invoice |
| POST   | `/records/:id/documents/:docType/upload` | Upload PDF attachment (multipart) |
| GET    | `/records/:id/documents/:docType/download` | Download PDF |

### Data Model (ImportShipment)

```typescript
ImportShipment: {
  id: string,
  referenceNo: string,       // auto-generated by backend (IMP-NNNNN)
  createdDate, expectedArrivalDate,
  customer, salesperson, company, remarks,
  status: "new"|"in_progress"|"completed"|"cancelled",
  currentStage: ShipmentStage,   // computed from which docs exist
  draftBL: DraftBL | null,
  houseBL: HouseBL | null,
  masterBL: MasterBL | null,
  arrivalNotice: ArrivalNotice | null,   // local-only (not persisted to BE yet)
  deliveryOrder: DeliveryOrder | null,   // local-only (not persisted to BE yet)
  clearingInvoice: ImportClearingInvoice | null,
  paymentReceipt: ImportPaymentReceipt | null,
  detentionInvoice: DetentionInvoice | null
}
```

### ShipmentStage Progression
`Created → Draft BL → HBL Created → MBL Created → Freight Invoice → Payment Receipt → Detention Invoice → Completed`

### Document Workflow

**Document 1 — Draft BL** (`/trading/imports/:id/draft-bl`)
- Full form: Draft BL No, Booking No, Vessel, Voyage, POL, POD, Place of Delivery, Shipper, Consignee, Notify Party, Cargo Description, HS Code, Packages, Gross/Net Weight, CBM, Container table, Freight Terms, Draft Date, On Board Date
- PDF upload section: upload original received PDF. Stored via backend upload endpoint. View/Download/Replace supported.
- Saved to backend via `PUT /records/:id/forms/draft_bl`

**Document 2 — House BL (HBL)** (`/trading/imports/:id/hbl`)
- Auto-fills matching fields from Draft BL
- Additional fields: HBL Number, Booking Number, Service Contract, Place of Receipt, Delivery Agent, Marks & Numbers, Place of Issue, Issue Date
- PDF upload for original received HBL
- Saved via `PUT /records/:id/forms/house_bl`

**Document 3 — Master BL (MBL)** (`/trading/imports/:id/mbl`)
- Auto-fills matching fields from HBL
- Additional fields: Shipping Line, MBL Number, Forwarder Reference, Freight Charges, Country of Origin
- PDF upload for original received MBL
- Saved via `PUT /records/:id/forms/master_bl`

**Document 4 — Import Clearing Invoice** (`/trading/imports/:id/invoice`)
- Auto-fills: HBL/MBL numbers, container info, shipping line, vessel/voyage, shipper/consignee, cargo description, weights, POL/POD/Destination from HBL/MBL
- Manual: Invoice Number, Invoice Date, Customer, NTN, Clearing Agent, Exchange Rate
- Charges table with preset charge names (THC, EMF, ISPS, LOLO, Documentation, CAFD, ISC, Gate Pass, Security Deposit, Other Charges) — editable Rate/Quantity/Amount per line
- Auto-calculates Subtotal, Total Amount, Grand Total, Amount in Words
- Saved via `PUT /records/:id/freight-invoice`

**Document 5 — Payment Receipt** (`/trading/imports/:id/payment-receipt`)
- Fields: Receipt No, TID, Amount, Currency, Payment Date
- Saved via `POST /records/:id/payment-receipts`

**Document 6 — Detention Invoice** (`/trading/imports/:id/detention-invoice`)
- Fields: Invoice No, Detention Start/End, Free Days, Per Day Amount, Security Deposit, Currency, Manual Fields
- Auto-calculates: Chargeable Days, Detention Amount, Refund Amount
- Saved via `PUT /records/:id/detention-invoice`

**Note:** Arrival Notice and Delivery Order types exist in the type definitions and importStore but are **local-only** (stored only in Zustand, not persisted to backend). They are not shown in the WorkflowTimeline or accessible via routes currently.

### PDF Generation (client-side, jsPDF)
All 6 document types support client-side PDF generation via `src/companies/trading/utils/pdfGenerator.ts`:
- `generateDraftBLPdf(draftBL, shipment)` → Blob
- `generateHouseBLPdf(houseBL, shipment)` → Blob
- `generateMasterBLPdf(masterBL, shipment)` → Blob
- `generateInvoicePdf(clearingInvoice, shipment)` → Blob
- `generateReceiptPdf(paymentReceipt, shipment)` → Blob
- `generateDetentionPdf(detentionInvoice, shipment)` → Blob

ImportWorkspacePage has a "Download All Documents" button that triggers batch download of all completed documents.

### ImportListPage (`/trading/imports`)
- Loads from backend on mount (`loadShipments()`)
- Table: Reference No, Customer, Created, Expected Arrival, Containers, Current Stage, Status
- Search: filters by reference no or customer
- New Import button → `NewImportDialog` → `createShipment()` → navigate to workspace
- Loading/error states displayed

### ImportWorkspacePage (`/trading/imports/:id`)
- Shipment summary header: Salesperson, Containers, Expected Arrival, Status
- Left: `WorkflowTimeline` showing all 6 document cards with status, click to navigate to document form
- Right: Current Stage card + Remarks card
- "Download All Documents" button shown when all 6 documents completed

---

## 13. Operations Module

**Route:** `/operations`, `/operations/packing-list`, `/operations/bill-of-lading`
**Module slug:** `operations`

Company-aware landing page:
- Freight Forwarding: shows tiles for Freight Operations, Packing List, Bill of Lading
- Trading: shows tiles for Trading Pipeline, New Inquiry

**Packing List** (`/operations/packing-list`): Standalone form + live preview. Not linked to any shipment record. Generates a printable document.

**Bill of Lading** (`/operations/bill-of-lading`): Standalone form + live preview. Not linked to any shipment record. Generates a printable document.

These are standalone document generators, not integrated into the Freight shipment workflow.

---

## 14. Sales Module

**Route:** `/sales`, `/sales/proforma-invoice`
**Module slug:** `sales`

Company-aware landing page:
- Freight Forwarding: shows Proforma Invoice tile only
- Trading: shows Import Shipments, Quotation, Proforma Invoice, Purchase Order tiles

**Standalone Proforma Invoice** (`/sales/proforma-invoice`): The generic proforma invoice generator used directly for Freight company sales. Uses the shared `ProformaInvoiceForm` + `ProformaInvoicePreview` components. PDF export via `window.print()`.

**Reuse in Trading:** `TradingProformaInvoicePage` imports and uses the same `ProformaInvoiceForm` and `ProformaInvoicePreview` components with trading-specific pre-fill logic.

---

## 15. Shared Services (Backend API)

All services call the backend at `VITE_API_BASE_URL`. Auth token added automatically by `apiRequest`.

### api.ts
- `apiRequest<T>(path, options)` — standard JSON request with auth header
- `apiUploadRequest<T>(path, formData)` — multipart/form-data upload
- `apiBlobRequest(path)` — returns Blob (for PDF downloads)
- Token stored at `localStorage.freighterp_access_token`
- Response envelope: `{ success: boolean, message: string, data?: T }`

### Backend endpoints used by FE
| Service | Endpoints |
|---------|-----------|
| authService | POST `/auth/login`, GET `/auth/me`, GET `/auth/me/access`, POST `/auth/logout` |
| userService | GET `/users`, POST `/users`, PUT `/users/:id`, DELETE `/users/:id` |
| groupService | GET `/groups`, POST `/groups`, PUT `/groups/:id`, DELETE `/groups/:id`, PUT `/groups/users/:userId` |
| moduleService | GET `/modules` |
| activityLogService | GET `/activity-logs` (params: page, per_page, category) |
| tradingImportService | Full CRUD for import records — see Section 12 above |

---

## 16. Implemented vs Not Implemented

### Implemented (working in production)

- Authentication (JWT, login, logout, session restore, token expiry watcher)
- Module access enforcement (`ModuleAccessRoute` + sidebar filtering)
- Company switching (sidebar, dashboard tiles, sales/operations pages)
- Account Management: users, groups, audit log — all API-backed
- Freight workflow: all 9 steps (inquiry → quotation → booking → shipment → logistics → tracking → documents → finance → closure)
- All freight validations: V2, V3, V4, V5, V6, V7
- Freight ShipmentDetailPage: 5 tabs, full lock on completion, smart back-link
- Trading sales pipeline: Steps 1–4 (inquiry → quotation → PI → PO), in-memory store
- Trading sales validation: V1 (PI blocked without quotation)
- Trading Import module: full 6-document workflow, all API-backed, PDF generation, batch download
- Operations standalone document generators (Packing List, Bill of Lading)
- Standalone Sales Proforma Invoice

### Partially Implemented

- **Trading Quotation view mode:** Existing quotation pre-fills the form but there is no true read-only view. Re-submitting creates a duplicate quotation. No PUT endpoint for quotation update.
- **Freight document upload:** Uses `URL.createObjectURL()` locally. Not connected to MinIO/S3. Files are lost on page refresh.
- **Arrival Notice & Delivery Order in Import module:** Types and store actions exist but no routes, no WorkflowTimeline display, and no backend persistence for these two documents.
- **ModuleAccessRoute redirect:** Redirects silently (no 403 page or toast). Navigation items are hidden but the redirect destination is not clearly communicated.
- **Dashboard module tiles for Trading:** The `trading` slug tile will not appear unless the backend explicitly grants the `trading` module slug to the user's group. This slug is not used by any `ModuleAccessRoute` in the route tree (trading routes are guarded under `operations` and `sales`), so the tile may not render for most users.

### Not Implemented / Pending

- **Backend persistence for Freight and Trading sales stores.** All data (inquiries, quotations, bookings, shipments, finance) is in-memory Zustand. Refresh = data loss for freight and trading sales.
- **Trading Deal Confirmation and Freight Decision steps.** DealConfirmationPage and ShipmentDecisionDialog were removed. The pipeline currently ends at PO received. Steps 5 and 6 of the original trading workflow do not exist.
- **Finance module.** No finance dashboard, finance-specific pages, or accounting features. Freight finance is handled inline within ShipmentDetailPage.
- **Marketing module.** Not implemented at all — no pages, no routes.
- **Customers workspace and Indenting workspace.** Show as "coming soon" in the company switcher but have no routes or pages.
- **Role-based access enforcement beyond module access.** The `role: "root"|"user"` distinction exists on the User type but is not enforced at the route level. AccountsPage checks `isRoot` for the Create User button, but route access itself is only module-slug based.
- **Pagination on list views.** Freight inquiries, shipments, and trading inquiries all load all records with no pagination. The activity log in AccountsPage does have pagination.
- **Real-time or live tracking integration.** Tracking status updates are manual button clicks stored locally.
- **Quotation update/edit.** Trading quotations can only be created, not edited. Re-creating overwrites (creates duplicate).
- **PO file attachment.** The trading PO records a filename locally but has no backend upload endpoint wired.

---

## 17. Known Issues & Limitations

1. **Data loss on refresh for Freight & Trading sales stores.** Zustand state is in-memory only. All freight shipments, inquiries, quotations, and trading pipeline data created in the current session are lost on page refresh. Only AccountsPage data and Import module data persist (API-backed).

2. **Freight document files lost on refresh.** `URL.createObjectURL()` URLs are session-only. Uploaded freight documents appear to be uploaded but the file reference is lost on refresh.

3. **Trading module slug on dashboard.** The Trading Pipeline tile in `TRADING_MODULES` uses slug `trading`, but no `ModuleAccessRoute` in the route tree checks for `trading` as a slug — trading routes are under `operations` and `sales`. If backend groups don't include `trading` slug in module access, the tile won't render even for users who can access `/trading`. This is inconsistent with how the backend grants access.

4. **Trading quotation duplication.** Navigating back to the quotation page for an inquiry that already has a quotation and pressing "Submit" creates a new quotation record. The old one is orphaned in the store.

5. **No 403 / access denied UX.** `ModuleAccessRoute` redirects to `/` silently when access is denied. Users get no feedback about why they can't access a route.

6. **Arrival Notice and Delivery Order in Import workflow are local-only.** `saveArrivalNotice()` and `saveDeliveryOrder()` write to Zustand only. No backend endpoint for these two documents exists or is called. They are not shown in WorkflowTimeline, are not accessible via routes, and don't affect the currentStage computation from the backend.

7. **Import PDF blobs are empty after page load.** `mapDocumentToPdf()` returns `blobUrl: ""` for backend-stored PDFs. There is no download-on-load mechanism — the actual blob URL is only available during the upload session. PDF viewing of previously uploaded BL PDFs requires re-download via the `/download` endpoint.

---

## 18. Important Conventions & Decisions

### Path Aliases
`@/` is aliased to `src/` via Vite config. All imports use this alias.

### ID Generation
- Freight inquiries: `FI-YYYY-NNN` (padded counter)
- Freight shipments: `SHP-YYYY-NNN`
- Trading inquiries: `TI-YYYY-NNN`
- Trading quotations: `QT-YYYY-NNN`
- Trading POs: `PO-YYYY-NNN`
- Trading PIs: `PI-YYYY-NNN`
- Import records: Generated by backend as `IMP-NNNNN` (zero-padded)
- All other freight IDs: `FQ-{timestamp}`, `BK-{timestamp}`

### State Architecture
- Freight workflow → `useFreightStore` (in-memory Zustand)
- Trading sales pipeline → `useTradingStore` (in-memory Zustand)
- Trading imports → `useImportStore` (API-backed Zustand)
- Auth → `useAuth` (React context, API-backed)
- Company selection → `useCompany` (React context, localStorage)
- AccountsPage uses local `useState` with direct API calls (no Zustand store for accounts)

### Component Reuse
- `ProformaInvoiceForm` and `ProformaInvoicePreview` from `src/modules/sales/components/` are reused in both `ProformaInvoicePage` (standalone) and `TradingProformaInvoicePage` (trading pipeline).
- `FreightStatusBadge` from `src/companies/freight/components/` is used in ShipmentDetailPage for both the quick summary and the tracking timeline.
- `ReadonlyField` is a local helper component defined inside `ShipmentDetailPage.tsx` and `FreightShipmentFormPage.tsx` (not shared).

### Validation Logic Location
Freight workflow validation is centralized in `src/companies/freight/lib/validation.ts`:
- `canAdvanceToDelivery(shipment)` → V4
- `canCloseShipment(shipment)` → V5
- `validateShipmentForm(form)` → V7 for shipment creation
- `validateBookingForm(form)` → V7 for booking

### Backend Response Envelope
All backend responses are expected in: `{ success: boolean, message: string, data?: T }`. Error responses may also use FastAPI's `{ detail: string }` format. Both are handled in `apiRequest`.

### Naming Conventions
- Pages: `<EntityName>Page.tsx` (e.g., `FreightPage`, `TradingInquiryPage`)
- Store files: `<domain>Store.ts` (camelCase)
- Service files: `<domain>Service.ts`
- Type files: `types.ts` or `<domain>Types.ts`
- Zustand stores use `create<StoreType>((set, get) => ({...}))`
- Components use default exports

### localStorage Keys
- `freighterp_access_token` — JWT auth token
- `freightos-active-company` — Active company ID
- `freightos-sidebar-collapsed` — Sidebar collapse state

---

## 19. Future Development Constraints

1. **Do not change the import module API contract.** The backend at `/api/v1/trading-import/sales/records/*` is already integrated and in use. The `mapRecordToShipment()` mapper in `tradingImportService.ts` is the critical translation layer between backend snake_case and frontend camelCase types.

2. **Freight store wiring.** When connecting the freight store to the backend, replace each store action with `apiRequest()` calls following the pattern already used in AccountsPage. Backend endpoints are commented throughout `freightStore.ts`.

3. **Trading store wiring.** Same as freight — backend comments exist throughout `tradingStore.ts`.

4. **Trading pipeline step 5 & 6.** Deal Confirmation and Freight Decision were intentionally removed from the current implementation. Rebuilding them requires adding `confirmDeal`, `rejectDeal`, and `handleFreightDecision` back to `tradingStore.ts` and creating `DealConfirmationPage.tsx` and `ShipmentDecisionDialog.tsx`. The data types (`TradingStatus` still has `deal_confirmed`, `shipment_created`, `trading_completed`) are preserved.

5. **Arrival Notice & Delivery Order in Import.** These two documents need backend endpoints before they can be properly persisted. The types, store actions, and form components (`WorkflowTimeline` knows about them) are in place — only backend and routes are missing.

6. **Module slug consistency.** The `trading` slug used in `TRADING_MODULES` is not checked by any `ModuleAccessRoute`. To fix: either add a `ModuleAccessRoute moduleSlug="trading"` wrapping the `/trading/*` routes, or change the tile slug to `operations`.
