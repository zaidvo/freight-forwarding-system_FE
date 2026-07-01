You are a Senior React TypeScript Developer and Code Auditor working on a freight forwarding ERP called FreightOS. Your task is to audit the existing codebase and verify how much of the specified requirements are already implemented versus what is missing or incomplete.

Scan the entire src directory recursively including all modules, components, pages, stores, types, routes, and providers. Then evaluate the implementation status of every requirement listed below.

For each requirement report one of three states. DONE means it is fully implemented and working. PARTIAL means it exists but is incomplete, broken, or missing key parts. MISSING means it does not exist at all in the codebase.

After evaluating each item provide a percentage completion estimate for each of the two modules separately and an overall system completion percentage. Then list a prioritized action plan of what needs to be built next.

TRADING MODULE REQUIREMENTS TO VERIFY

Check whether a list view page exists for Trading that shows all inquiries in a table with columns for Order Reference, Creation Date, Customer Name, Product, and Status with search and filter functionality.

Check whether clicking a row in the trading list navigates to a dedicated form view page for that specific inquiry record showing all its existing data in a readable and editable format.

Check whether the trading form view has a status breadcrumb or workflow stepper showing the current pipeline stage such as Inquiry, Quoted, PI Issued, PO Received, Deal Confirmed.

Check whether dynamic action buttons appear on the form view based on the current status of the record. For example when status is inquiry received a Generate Quotation button appears, when status is quoted a Generate PI button appears, when status is pi issued a Record PO button appears, when status is po received a Confirm Deal button appears, and when status is deal confirmed a freight decision dialog appears.

Check whether the Quotation form view exists as a standalone page or section that loads and displays an existing quotation record linked to an inquiry.

Check whether the Proforma Invoice step is integrated into the trading workflow and reuses the existing sales ProformaInvoicePage component rather than being a separate disconnected page.

Check whether the Purchase Order form view exists and allows recording a PO number, PO date, customer notes, and attachment linked to an inquiry.

Check whether the Deal Confirmation page exists with approve and reject actions that generate a unique Deal ID on approval.

Check whether the Step 6 freight decision dialog exists with YES and NO options, where YES automatically creates a freight shipment draft with pre-filled data from the trading deal and navigates to the freight module, and NO marks the deal as trading completed.

Check whether the Zustand trading store exists with actions for all six steps including createInquiry, submitInquiry, createQuotation, issuePIForInquiry, recordPO, confirmDeal, rejectDeal, and handleFreightDecision.

FREIGHT MODULE REQUIREMENTS TO VERIFY

Check whether a list view page exists for Freight that shows all shipments in a table with columns for Shipment ID, Customer, Route, Container Number, ETD, ETA, Document progress, and Status with search functionality.

Check whether clicking a shipment row navigates to a dedicated shipment form view with full detail.

Check whether the freight form view has a tabbed interface with at minimum a Logistics tab, a Documents tab, and a Finance tab.

Check whether a smart button appears at the top of the freight form view when the shipment was auto-created from a trading deal, and whether clicking it navigates back to the original trading deal record.

Check whether Path 1 exists where a confirmed trading deal with freight decision YES automatically creates a freight inquiry or shipment draft with pre-filled client, product, quantity, origin, and destination data.

Check whether Path 2 exists as a manual freight inquiry creation form for external clients.

Check whether the freight quotation step exists allowing operations to enter carrier rates, local charges, handling charges, customs charges, margin, and total price.

Check whether the booking step exists allowing entry of carrier, vessel or flight, voyage number, schedule, and booking reference with a confirm booking action.

Check whether the shipment creation form exists collecting container number, ETD, ETA, origin, destination, carrier, and customer.

Check whether the documents tab exists listing all eight required documents split into client documents and forwarder documents with upload, view, replace, and version tracking per document.

Check whether the tracking tab exists showing a visual timeline of all cargo movement status events with timestamps, user names, and remarks, and whether it allows updating to the next status.

Check whether the finance tab exists showing freight invoice amount, client payments, vendor charges, and profit metric cards with inputs to record transactions.

Check whether the shipment closure tab or section exists with a pre-closure checklist and a close and archive action.

Check whether the Zustand freight store exists with actions for all nine steps.

SYSTEM VALIDATION REQUIREMENTS TO VERIFY

Check whether the system blocks generating a Proforma Invoice if no approved quotation exists for that inquiry.

Check whether the system blocks booking confirmation if no freight quotation has been issued.

Check whether fields like client, product, and quantity are read-only on the freight form view when the shipment was auto-created from a trading deal via Path 1.

Check whether the system blocks issuing a Delivery Order or transitioning to Delivered status if mandatory documents such as Commercial Invoice, Packing List, House Bill of Lading, and Proof of Delivery have not been uploaded.

Check whether the system shows a warning or blocks shipment closure if there are outstanding payment amounts.

Check whether all fields are locked and records become read-only after a shipment is marked as Completed.

Check whether field-level red highlighting or validation error messages appear when required fields like container number, ETD, or ETA are empty and the user tries to advance the workflow.

COMPANY SWITCHER REQUIREMENTS TO VERIFY

Check whether a CompanyProvider exists that stores the active company in context and localStorage.

Check whether switching company updates the sidebar navigation dynamically showing freight-specific nav items for Freight Forwarding and trading-specific nav items for Import Export.

Check whether the dashboard changes its KPI cards and module tiles based on the active company.

Check whether all trading routes are accessible and all freight routes are accessible regardless of active company since both companies may need cross-access.

OUTPUT FORMAT

Report results in this exact format for each item. State the requirement clearly, mark it as DONE, PARTIAL, or MISSING, and if PARTIAL or MISSING explain specifically what exists and what is absent with file paths where relevant.

After all individual checks provide a module-level summary like Trading Module 70 percent complete and Freight Module 55 percent complete and Overall System 60 percent complete.

Then provide a prioritized action plan numbered from highest to lowest priority listing exactly what needs to be built or fixed with the affected files.

Do not assume anything is implemented without finding it in actual code. Search the files directly and report only what you can confirm exists.

//////////////////////////////////////////////////////////////////////////////

FreightOS — Full Codebase Audit Report
TRADING MODULE REQUIREMENTS
T1. Trading list view page with table columns (Order Ref, Creation Date, Customer, Product, Status) + search/filter → PARTIAL TradingPage.tsx exists with a working search bar and a filterable table. Columns present: Inquiry ID, Buyer, Product, Qty, Destination, Salesperson, Status, Actions. Missing: Creation Date column is absent from the table. Filter by status is not implemented (search only covers buyer/product/ID, no dropdown filter). The required column header is "Customer Name" — the table shows "Buyer" which maps correctly. Overall it's functional but lacks Creation Date and status filter.

T2. Clicking a row navigates to a dedicated form view showing existing data → DONE TradingPage.tsx has onClick={() => navigate('/trading/inquiry/${inq.id}')} on every row. TradingInquiryPage.tsx at /trading/inquiry/:id loads existing data from the store and renders it in fully populated form fields. Audit trail is also shown.

T3. Status breadcrumb / workflow stepper showing current pipeline stage → DONE WorkflowStepper.tsx is implemented with 6 steps (Inquiry → Quotation → Proforma Invoice → Purchase Order → Deal Confirmed → Shipment/Complete). It uses STATUS_ORDER to compute done/active/pending states and renders across all trading pages: TradingInquiryPage, QuotationPage, TradingProformaInvoicePage, PurchaseOrderPage, DealConfirmationPage.

T4. Dynamic action buttons based on current status → DONE Both TradingPage.tsx (table row actions) and TradingInquiryPage.tsx (form header buttons) implement conditional rendering:

inquiry_received → "Generate Quotation" button ✓
quoted → "Issue PI" button ✓
pi_issued → "Record PO" button ✓
po_received → "Confirm Deal" button ✓
deal_confirmed → "Freight Decision" button ✓
T5. Quotation form view as a standalone page loading existing quotation linked to an inquiry → PARTIAL QuotationPage.tsx exists at /trading/quotation/new and /trading/quotation/:id. It pre-fills from inquiry and checks for existing quotation via quotations.find(q => q.inquiryId === inquiryId). However, the :id route renders the same "new" form — there is no true "view existing quotation by quotation ID" behavior. If a quotation already exists for the inquiry it does pre-fill the form, but doesn't show it in a proper read-only view. It's a functional creation form, not a full view-only record page.

T6. Proforma Invoice step reuses sales ProformaInvoicePage components (not duplicated) → DONE TradingProformaInvoicePage.tsx explicitly imports and uses ProformaInvoiceFormPanel from @/modules/sales/components/ProformaInvoiceForm and ProformaInvoicePreview from @/modules/sales/components/ProformaInvoicePreview. Zero duplication. Pre-fills from inquiry + quotation data.

T7. Purchase Order form with PO number, PO date, customer notes, attachment linked to inquiry → DONE PurchaseOrderPage.tsx is fully implemented: PO Number (required), PO Date, Customer Notes textarea, file upload input (PDF/Word/Image), and linked via ?inquiryId= query param. Store action recordPO() is called and navigates to deal confirmation. File upload is simulated (filename stored, BE comment for MinIO present).

T8. Deal Confirmation page with approve/reject actions generating a unique Deal ID on approval → DONE DealConfirmationPage.tsx fully implements: Deal Summary display (buyer, product, quotation price, PO details), Approve Deal button calling confirmDeal(), Reject Deal button with reason textarea calling rejectDeal(). On approval, generateDealId() creates a unique DEAL-YYYY-XXX ID. Confirmed deal ID is displayed in the UI.

T9. Step 6 freight decision dialog with YES/NO — YES creates freight shipment draft and navigates, NO marks trading completed → PARTIAL ShipmentDecisionDialog.tsx exists and is wired in both TradingPage.tsx and DealConfirmationPage.tsx. YES calls createInquiryFromDeal() on useFreightStore (via getState()) and navigates to /freight/quotation/new?inquiryId=.... NO calls handleFreightDecision(dealId, false) which sets status to trading_completed. What's missing: YES creates a freight inquiry (not a full shipment draft). The requirement says "automatically creates a freight shipment draft with pre-filled data." Currently it only creates a freight inquiry and starts the quotation step — not a pre-filled shipment. Also the navigation from TradingPage.tsx goes to the quotation step, while DealConfirmationPage.tsx also goes to quotation — both skip straight to Step 2 of freight. A draft shipment with pre-filled container/ETD/ETA is never created.

T10. Zustand trading store with all six step actions → DONE tradingStore.ts contains: createInquiry, submitInquiry, createQuotation, issuePIForInquiry, recordPO, confirmDeal, rejectDeal, handleFreightDecision, appendAudit. All 6 steps covered, all required actions present.

FREIGHT MODULE REQUIREMENTS
F1. Freight list view with columns: Shipment ID, Customer, Route, Container, ETD, ETA, Document Progress, Status + search → DONE FreightPage.tsx shows a shipments table with all 8 required columns. Document progress renders as a progress bar with uploaded/total count. Search filters by ID, customer, and container number.

F2. Clicking a shipment row navigates to a dedicated shipment form view → DONE FreightPage.tsx has onClick={() => navigate('/freight/shipment/${shp.id}')} on every row. ShipmentDetailPage.tsx at /freight/shipment/:id loads and displays full shipment data.

F3. Freight form view has tabbed interface with Logistics, Documents, Finance tabs → PARTIAL ShipmentDetailPage.tsx has four tabs: Tracking, Documents, Finance, Closure. Missing: There is no "Logistics" tab. The shipment header shows a static summary (Carrier, Container, ETD, ETA) but there is no dedicated Logistics tab for editing those fields. The requirement specifically names Logistics as a required tab — it's absent.

F4. Smart button at top of freight form when shipment was auto-created from trading deal, navigating back to original deal → MISSING ShipmentDetailPage.tsx does not render any smart button or trading deal link. The FreightInquiry type has fromTradingDealId? field and seed data shows fromTradingDealId: "DEAL-2025-001", but ShipmentDetailPage.tsx never reads this field or renders a back-link. The freight shipment itself (FreightShipment) doesn't even carry fromTradingDealId — it only exists on the inquiry. No smart button exists anywhere in the shipment detail page.

F5. Path 1 — confirmed trading deal with YES auto-creates freight inquiry/shipment with pre-filled data → PARTIAL createInquiryFromDeal() in freightStore.ts creates a FreightInquiry pre-filled with customer, commodity (product), weight (quantity), origin, destination, and fromTradingDealId. This covers the inquiry level. However, a pre-filled shipment draft is not created — the user still has to go through quotation and booking before creating a shipment. The field mapping also has a rough spot: weight is set to deal quantity (e.g. 10000 PCS mapped to KG weight) rather than being a proper cargo weight.

F6. Path 2 — manual freight inquiry creation form for external clients → DONE FreightInquiryPage.tsx is a complete manual inquiry creation form with customer, origin, destination, mode (Sea/Air/Land), commodity, weight, volume, and remarks. Linked to the store's createInquiry() action.

F7. Freight quotation step with carrier rates, local charges, handling, customs, margin, total → DONE FreightQuotationPage.tsx has all required fields: Carrier Rates, Local Charges, Handling Charges, Customs Charges, Margin/Profit, currency selector, and a live total calculation. Calls createQuotation() and navigates to booking.

F8. Booking step with carrier, vessel/flight, voyage number, schedule, booking reference, confirm action → DONE FreightBookingPage.tsx has all required fields: Carrier, Vessel Name/Flight, Voyage Number, Scheduled Departure, Booking Reference. The "Confirm Booking" button calls createBooking() and navigates to shipment creation.

F9. Shipment creation form collecting container, ETD, ETA, origin, destination, carrier, customer → DONE FreightShipmentFormPage.tsx collects all required fields: Container Number, ETD, ETA, Origin, Destination, Carrier, Customer, and Inquiry link. Pre-fills from linked inquiry.

F10. Documents tab with 8 required documents split into client/forwarder, with upload/view/replace/version tracking → PARTIAL ShipmentDetailPage.tsx documents tab is implemented. It splits into "Client Documents" (commercial_invoice, packing_list, coo, insurance) and "Forwarder Documents" (hbl, shipping_instructions, arrival_notice, delivery_order). Upload/View/Replace buttons exist with version tracking (doc.version, uploadedAt, uploadedBy). Missing: 8 document types defined in the type (FreightDocument) include pod (Proof of Delivery), but the store's INITIAL_DOCS only initializes 8 docs without pod. The seed EMPTY_DOCS also has 8 entries without pod. The type supports it but it's never instantiated on new shipments. Also, actual file picker interaction in the upload button is simulated — handleUpload passes doc but DocumentRow.onUpload just calls a fake URL generator rather than opening a file picker.

F11. Tracking tab with visual timeline of cargo movement events, timestamps, user names, remarks, and status update → DONE ShipmentDetailPage.tsx tracking tab renders a full vertical timeline with FreightStatusBadge, timestamp, user, and remarks per event. The "Update Status" section shows the next 1-2 statuses in sequence with a remarks input. updateTrackingStatus() appends to the timeline and updates shipment status.

F12. Finance tab with invoice amount, client payments, vendor charges, profit metric cards + record transactions → DONE ShipmentDetailPage.tsx finance tab has 4 KPI cards (Freight Invoice, Client Payments, Vendor Charges, Profit). Two inputs: Set Invoice Amount and Record Client Payment. Outstanding balance warning shown when outstanding > 0. setFreightInvoice() and recordPayment() store actions are connected. Minor gap: Vendor charge recording UI exists in the store (recordVendorCharge) but no input field for it appears in the finance tab UI — only client payments are recordable from the UI.

F13. Shipment closure tab with pre-closure checklist and close/archive action → DONE ShipmentDetailPage.tsx closure tab shows a checklist with three checks: status is delivered, all documents uploaded, outstanding payments zero. "Close & Archive Shipment" button calls closeShipment(). Locked state shown when already completed.

F14. Zustand freight store with all nine step actions → PARTIAL freightStore.ts has: createInquiry, createInquiryFromDeal, createQuotation, createBooking, createShipment, uploadDocument, updateTrackingStatus, recordPayment, recordVendorCharge, setFreightInvoice, closeShipment. All 9 steps are covered. Missing: Step 8 (Delivery/Delivery Order issuance) has no dedicated action — it's covered implicitly through updateTrackingStatus to delivered. No explicit issueDeliveryOrder() action. Minor gap but the store is functionally complete.

SYSTEM VALIDATION REQUIREMENTS
V1. System blocks generating PI if no approved quotation exists → MISSING TradingProformaInvoicePage.tsx does not check whether a quotation exists before allowing the form to submit. It reads quotations.find(q => q.inquiryId === inquiryId) to pre-fill data, but the "Issue PI & Continue" button has no guard — it calls issuePIForInquiry() even if quotation is undefined. No blocking UI or validation exists.

V2. System blocks booking confirmation if no freight quotation has been issued → MISSING FreightBookingPage.tsx has no check for an existing quotation. The "Confirm Booking" button only validates that carrier and bookingReference are non-empty. freightStore.createBooking() accepts any inquiryId regardless of whether a quotation exists for it. No guard is present.

V3. Fields like client, product, quantity are read-only on freight form when shipment was auto-created from Path 1 → MISSING FreightShipmentFormPage.tsx pre-fills customer, origin, destination from the linked inquiry when ?inquiryId= is present and the inquiry has fromTradingDealId, but all fields remain editable <Input> components. No readOnly or disabled attributes are applied based on fromTradingDealId. No distinction between Path 1 and Path 2 origin in the UI.

V4. System blocks issuing Delivery Order / transitioning to Delivered if mandatory docs (CI, PL, HBL, POD) not uploaded → MISSING ShipmentDetailPage.tsx tracking tab's "Update Status" section renders buttons for advancing to any next status with no document gate. The updateTrackingStatus() store action also has no validation. There is no check before moving to delivered or out_for_delivery that Commercial Invoice, Packing List, HBL, or Proof of Delivery are uploaded.

V5. System shows warning or blocks closure if outstanding payments exist → PARTIAL ShipmentDetailPage.tsx closure tab shows a checklist item ⚠ Outstanding: USD X when outstanding > 0, and the finance tab shows an amber warning banner for outstanding amounts. However, the "Close & Archive Shipment" button is not disabled when outstanding > 0 — it only shows the visual warning. A user can click through and close with unpaid balance. It warns but does not block.

V6. All fields locked / records read-only after shipment marked Completed → PARTIAL ShipmentDetailPage.tsx uses const isLocked = shipment.status === 'completed'. The closure tab shows a locked state. The "Update Status" section is hidden when isLocked. The documents "Upload/Replace" buttons are hidden when isLocked. The finance "Record Transactions" section is hidden when isLocked. Missing: The shipment summary header fields (Carrier, Container, ETD, ETA) are display-only divs, not inputs — so no issue there. But if a "Logistics" tab existed with editable fields, those would also need locking. The current partial locking is reasonable given what's implemented.

V7. Field-level red highlighting / validation errors for required fields (container, ETD, ETA) when advancing workflow → MISSING FreightShipmentFormPage.tsx has no field-level validation at all — handleCreate() calls createShipment() regardless of whether container number, ETD, or ETA are empty. FreightBookingPage.tsx validates carrier + bookingReference but with a banner error, not field-level highlighting. No red border on individual fields exists anywhere in the freight workflow. TradingInquiryPage.tsx has a banner error for missing buyer/product/email but no field-level highlighting either.

COMPANY SWITCHER REQUIREMENTS
C1. CompanyProvider storing active company in context and localStorage → DONE CompanyProvider.tsx is fully implemented. Uses useState initialized from localStorage.getItem('freightos-active-company'). handleSetCompany() calls localStorage.setItem() before updating state. Exposes activeCompany, setActiveCompanyId, isFreight, isTrading. Wraps entire app via AppRoutes.tsx.

C2. Switching company updates sidebar navigation dynamically → DONE AppLayout.tsx uses const navSections = isFreight ? FREIGHT_NAV : TRADING_NAV. FREIGHT_NAV contains Freight Operations, New Inquiry, Packing List, Bill of Lading under Operations. TRADING_NAV contains Trading Pipeline, New Inquiry, Deal Confirmation under Operations plus Quotation, PI, PO under Sales. The company switcher dropdown in the top header updates setActiveCompanyId() which triggers a re-render of navSections.

C3. Dashboard changes KPI cards and module tiles based on active company → PARTIAL DashboardPage.tsx switches between freightKpis (Total Shipments, In Transit, Completed, Inquiries) and tradingKpis (Inquiries, Quoted, Deals Confirmed, Completed) based on isFreight. Missing: The 5 module tiles (MODULES) are the same fixed array for both companies — Account Management, Operations, Finance, Sales, Marketing. The tiles don't change based on company. Only the KPI strip is dynamic; the tile grid is static.

C4. All trading routes and freight routes accessible regardless of active company → DONE AppRoutes.tsx defines all trading (/trading/_) and freight (/freight/_) routes under the single <ProtectedRoute> wrapper with no company-based guards. There is no conditional route rendering based on activeCompany. Both route trees are always accessible regardless of which company is active in the switcher.

MODULE-LEVEL SUMMARY
Trading Module — 82% complete
All 6 workflow pages exist and are wired together with navigation. The Zustand store has all required actions. The PI-reuse-from-sales pattern works. The main gaps are: no PI gate validation (V1), quotation view-only page is incomplete, and Step 6's YES path creates an inquiry draft rather than a shipment draft.

Freight Module — 71% complete
All 9 workflow steps have dedicated pages. The list view, shipment detail, documents tab, tracking tab, finance tab, and closure tab are all functional. Main gaps are: no Logistics tab in shipment detail, no smart back-link to trading deal, no field-level validation, no document gate before status advances, and vendor charge recording is missing from the UI.

System Validation — 10% complete
This is the most critically underbuilt area. Of 7 validation requirements, zero are fully implemented. Two have partial visual hints (closure warning, locked state on completed) but no actual enforcement. The five outright missing validations are all business-critical workflow guards.

Company Switcher — 82% complete
Provider, localStorage persistence, sidebar switching, and cross-company route access are all done. The only gap is the dashboard module tiles not being company-specific.

Overall System — 65% complete
PRIORITIZED ACTION PLAN

1. Add Logistics tab to ShipmentDetailPage (Freight F3) ShipmentDetailPage.tsx — Add a 5th tab "Logistics" (insert before Tracking) that shows editable fields for Container Number, Carrier, ETD, ETA, Origin, Destination with save-to-store action. This is a structural gap in the most-used page.

2. Implement document gate before status transitions (Validation V4) ShipmentDetailPage.tsx — Before allowing transition to out_for_delivery or delivered, check that commercial_invoice, packing_list, hbl docs have fileUrl. Show a blocking error. Also gate delivery_order issuance similarly. This is core compliance logic.

3. Block PI issuance if no quotation exists (Validation V1) TradingProformaInvoicePage.tsx — If quotation is undefined, disable the "Issue PI & Continue" button and show a warning: "A quotation must be generated first." Simple guard with no architectural changes needed.

4. Block freight booking if no quotation exists (Validation V2) FreightBookingPage.tsx — Check quotations.find(q => q.inquiryId === inquiryId). If none found, disable "Confirm Booking" and show a banner. Simple lookup against the store.

5. Add smart back-link button on ShipmentDetailPage when fromTradingDealId exists (Freight F4) ShipmentDetailPage.tsx + FreightShipment type — Propagate fromTradingDealId from the freight inquiry to the shipment record during createShipment(). Render a banner/button at the top of the detail page linking back to /trading/deal/:inquiryId.

6. Make client/product/quantity fields read-only on freight form for Path 1 shipments (Validation V3) FreightShipmentFormPage.tsx — Detect fromTradingDealId on the linked inquiry. When present, render Customer, Origin, Destination as <div> display values rather than <Input> elements.

7. Enforce shipment closure blocking when outstanding payments exist (Validation V5) ShipmentDetailPage.tsx — The warning already exists. Add disabled={outstanding > 0} to the "Close & Archive" button. Optionally show a tooltip explaining why it's disabled.

8. Add field-level red border validation (Validation V7) FreightShipmentFormPage.tsx and FreightBookingPage.tsx — On submit attempt, check required fields and add border-rose-400 ring-rose-100 classes to empty required inputs. Convert current banner errors to per-field inline errors where possible.

9. Improve Step 6 YES path to navigate to a pre-filled shipment form instead of quotation (Trading T9) DealConfirmationPage.tsx / TradingPage.tsx — After createInquiryFromDeal(), either auto-create a booking + shipment draft (preferred) or at minimum navigate to /freight/shipment/new?inquiryId= skipping quotation/booking since the trade deal already contains pricing. This requires a createInquiryAndShipmentFromDeal() store composite action.

10. Add Creation Date column to trading list table (Trading T1) TradingPage.tsx — Add a Created column rendering new Date(inq.createdAt).toLocaleDateString(). Also add a Status filter dropdown alongside the search bar using the STATUS_LABELS map.

11. Add company-specific module tiles to dashboard (Company Switcher C3) DashboardPage.tsx + modules.ts — Either define two tile arrays (freight-specific and trading-specific) or add a company property to ModuleDef and filter on render. Currently both companies see identical tiles.

12. Add vendor charge recording input to finance tab (Freight F12 minor gap) ShipmentDetailPage.tsx finance tab — Add a third input section "Record Vendor Charge" that calls recordVendorCharge(shipment.id, amount). The store action already exists; the UI input is just missing
