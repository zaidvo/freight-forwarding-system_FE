// src/modules/trading/data/seed.ts
//
// All data here is mock/seed for FE-only testing.
//
// BE integration:
//   GET  /api/v1/trading/inquiries        → replace SEED_INQUIRIES
//   GET  /api/v1/trading/quotations       → replace SEED_QUOTATIONS
//   GET  /api/v1/trading/purchase-orders  → replace SEED_PURCHASE_ORDERS
//   GET  /api/v1/trading/deals            → replace SEED_DEALS
//   POST /api/v1/trading/inquiries        → replace createInquiry()
//   PATCH /api/v1/trading/inquiries/:id/submit → replace submitInquiry()
//   etc. — every mutation maps to a REST endpoint

import type { TradingInquiry, Quotation, PurchaseOrder, Deal } from "../types";

const now = new Date().toISOString();
const today = now.split("T")[0];

export const SEED_INQUIRIES: TradingInquiry[] = [
  {
    id: "TI-2025-001",
    buyer: "Global Traders LLC",
    contactPerson: "Ahmed Khan",
    email: "ahmed@globaltraders.com",
    phone: "+92 321 1234567",
    product: "Cotton Yarn",
    quantity: 500,
    unit: "MT",
    destinationCountry: "Germany",
    inquiryDate: today,
    notes: "Urgent shipment required before end of month.",
    assignedSalesperson: "Ali Hassan",
    status: "inquiry_received",
    auditTrail: [
      { timestamp: now, user: "Ali Hassan", action: "Inquiry submitted" },
    ],
    createdAt: now,
  },
  {
    id: "TI-2025-002",
    buyer: "Euro Imports GmbH",
    contactPerson: "Hans Müller",
    email: "hans@euroimports.de",
    phone: "+49 30 9876543",
    product: "Rice (Basmati)",
    quantity: 1000,
    unit: "MT",
    destinationCountry: "Netherlands",
    inquiryDate: today,
    notes: "Long-term supply contract possible.",
    assignedSalesperson: "Sara Khan",
    status: "quoted",
    auditTrail: [
      { timestamp: now, user: "Sara Khan", action: "Inquiry submitted" },
      { timestamp: now, user: "Sara Khan", action: "Quotation generated" },
    ],
    createdAt: now,
  },
  {
    id: "TI-2025-003",
    buyer: "Dubai Commodities Co.",
    contactPerson: "Yousuf Al-Rashid",
    email: "yousuf@dubaicommodities.ae",
    phone: "+971 50 3456789",
    product: "Surgical Instruments",
    quantity: 10000,
    unit: "PCS",
    destinationCountry: "UAE",
    inquiryDate: today,
    notes: "Medical grade required.",
    assignedSalesperson: "Omar Farooq",
    status: "deal_confirmed",
    auditTrail: [
      { timestamp: now, user: "Omar Farooq", action: "Inquiry submitted" },
      { timestamp: now, user: "Omar Farooq", action: "Quotation generated" },
      { timestamp: now, user: "Omar Farooq", action: "PI issued" },
      { timestamp: now, user: "Manager", action: "Deal confirmed" },
    ],
    createdAt: now,
  },
];

export const SEED_QUOTATIONS: Quotation[] = [
  {
    id: "QT-2025-001",
    inquiryId: "TI-2025-002",
    customer: "Euro Imports GmbH",
    product: "Rice (Basmati)",
    quantity: 1000,
    unitPrice: 850,
    currency: "USD",
    incoterms: "FOB",
    paymentTerms: "50% advance, 50% against B/L copy",
    validUntil: "2025-08-31",
    remarks: "Price valid for 30 days.",
    status: "quoted",
    auditTrail: [
      { timestamp: now, user: "Sara Khan", action: "Quotation generated" },
    ],
    createdAt: now,
  },
];

export const SEED_PURCHASE_ORDERS: PurchaseOrder[] = [];

export const SEED_DEALS: Deal[] = [
  {
    id: "DEAL-2025-001",
    inquiryId: "TI-2025-003",
    poId: "PO-2025-001",
    customer: "Dubai Commodities Co.",
    product: "Surgical Instruments",
    quantity: 10000,
    totalValue: 250000,
    currency: "USD",
    status: "deal_confirmed",
    auditTrail: [{ timestamp: now, user: "Manager", action: "Deal approved" }],
    createdAt: now,
  },
];

// ─── Status label map ─────────────────────────────────────────────
export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  inquiry_received: "Inquiry Received",
  quoted: "Quoted",
  pi_issued: "PI Issued",
  po_received: "PO Received",
  deal_confirmed: "Deal Confirmed",
  shipment_created: "Shipment Created",
  trading_completed: "Trading Completed",
};

export const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-500",
  inquiry_received: "bg-blue-50 text-blue-600",
  quoted: "bg-amber-50 text-amber-600",
  pi_issued: "bg-purple-50 text-purple-600",
  po_received: "bg-orange-50 text-orange-600",
  deal_confirmed: "bg-emerald-50 text-emerald-600",
  shipment_created: "bg-sky-50 text-sky-600",
  trading_completed: "bg-green-50 text-green-700",
};

// ─── Auto ID generators ──────────────────────────────────────────
// BE integration: IDs will be assigned server-side; remove these
const year = new Date().getFullYear();
export const generateInquiryId = () =>
  `TI-${year}-${String(Math.floor(Math.random() * 900) + 100)}`;
export const generateQuotationId = () =>
  `QT-${year}-${String(Math.floor(Math.random() * 900) + 100)}`;
export const generatePIId = () =>
  `PI-${year}-${String(Math.floor(Math.random() * 900) + 100)}`;
export const generatePOId = () =>
  `PO-${year}-${String(Math.floor(Math.random() * 900) + 100)}`;
export const generateDealId = () =>
  `DEAL-${year}-${String(Math.floor(Math.random() * 900) + 100)}`;
