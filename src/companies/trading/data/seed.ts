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


export const SEED_INQUIRIES: TradingInquiry[] = [];

export const SEED_QUOTATIONS: Quotation[] = [];

export const SEED_PURCHASE_ORDERS: PurchaseOrder[] = [];

export const SEED_DEALS: Deal[] = [];

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


