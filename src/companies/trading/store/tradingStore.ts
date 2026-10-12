// src/modules/trading/store/tradingStore.ts
//
// Zustand store for all trading workflow state.
// Currently uses in-memory seed data.
//
// BE integration: Replace each setter with an API call then update state.
// Pattern:
//   async createInquiry(data) {
//     const result = await apiRequest('/trading/inquiries', { method:'POST', body: JSON.stringify(data) })
//     set(state => ({ inquiries: [result, ...state.inquiries] }))
//   }

import { create } from "zustand";
import type {
  TradingInquiry,
  Quotation,
  PurchaseOrder,
  AuditEntry,
  TradingStatus,
} from "../types";
import {
  SEED_INQUIRIES,
  SEED_QUOTATIONS,
  SEED_PURCHASE_ORDERS,
  generateInquiryId,
  generateQuotationId,
  generatePOId,
  generatePIId,
} from "../data/seed";

type TradingStore = {
  inquiries: TradingInquiry[];
  quotations: Quotation[];
  purchaseOrders: PurchaseOrder[];

  // Step 1
  createInquiry: (
    data: Omit<TradingInquiry, "id" | "status" | "auditTrail" | "createdAt">
  ) => TradingInquiry;
  submitInquiry: (id: string) => void;

  // Step 2
  createQuotation: (
    data: Omit<Quotation, "id" | "status" | "auditTrail" | "createdAt">
  ) => Quotation;

  // Step 3 - PI references inquiry + quotation, form handled by sales/ProformaInvoicePage
  issuePIForInquiry: (inquiryId: string) => string; // returns PI id

  // Step 4
  recordPO: (
    data: Omit<PurchaseOrder, "id" | "status" | "auditTrail" | "createdAt">
  ) => PurchaseOrder;

  // Audit
  appendAudit: (
    id: string,
    entry: Omit<AuditEntry, "timestamp">
  ) => void;
};

const now = () => new Date().toISOString();
const audit = (action: string, user = "Current User"): AuditEntry => ({
  timestamp: now(),
  user,
  action,
});

export const useTradingStore = create<TradingStore>((set) => ({
  inquiries: SEED_INQUIRIES,
  quotations: SEED_QUOTATIONS,
  purchaseOrders: SEED_PURCHASE_ORDERS,

  // ── Step 1 ──────────────────────────────────────────────────────
  createInquiry: (data) => {
    const inquiry: TradingInquiry = {
      ...data,
      id: generateInquiryId(),
      status: "draft",
      auditTrail: [audit("Inquiry created")],
      createdAt: now(),
    };
    // BE: POST /api/v1/trading/inquiries
    set((s) => ({ inquiries: [inquiry, ...s.inquiries] }));
    return inquiry;
  },

  submitInquiry: (id) => {
    // BE: PATCH /api/v1/trading/inquiries/:id/submit
    set((s) => ({
      inquiries: s.inquiries.map((inq) =>
        inq.id === id
          ? {
              ...inq,
              status: "inquiry_received" as TradingStatus,
              auditTrail: [...inq.auditTrail, audit("Inquiry submitted")],
            }
          : inq
      ),
    }));
  },

  // ── Step 2 ──────────────────────────────────────────────────────
  createQuotation: (data) => {
    const quotation: Quotation = {
      ...data,
      id: generateQuotationId(),
      status: "quoted",
      auditTrail: [audit("Quotation generated")],
      createdAt: now(),
    };
    // BE: POST /api/v1/trading/quotations
    set((s) => ({
      quotations: [quotation, ...s.quotations],
      inquiries: s.inquiries.map((inq) =>
        inq.id === data.inquiryId
          ? {
              ...inq,
              status: "quoted" as TradingStatus,
              auditTrail: [...inq.auditTrail, audit("Quotation generated")],
            }
          : inq
      ),
    }));
    return quotation;
  },

  // ── Step 3 ──────────────────────────────────────────────────────
  issuePIForInquiry: (inquiryId) => {
    const piId = generatePIId();
    // BE: POST /api/v1/trading/proforma-invoices
    set((s) => ({
      inquiries: s.inquiries.map((inq) =>
        inq.id === inquiryId
          ? {
              ...inq,
              status: "pi_issued" as TradingStatus,
              auditTrail: [...inq.auditTrail, audit(`PI issued: ${piId}`)],
            }
          : inq
      ),
    }));
    return piId;
  },

  // ── Step 4 ──────────────────────────────────────────────────────
  recordPO: (data) => {
    const po: PurchaseOrder = {
      ...data,
      id: generatePOId(),
      status: "po_received",
      auditTrail: [audit("Purchase Order recorded")],
      createdAt: now(),
    };
    // BE: POST /api/v1/trading/purchase-orders
    set((s) => ({
      purchaseOrders: [po, ...s.purchaseOrders],
      inquiries: s.inquiries.map((inq) =>
        inq.id === data.inquiryId
          ? {
              ...inq,
              status: "po_received" as TradingStatus,
              auditTrail: [...inq.auditTrail, audit("PO received")],
            }
          : inq
      ),
    }));
    return po;
  },

  // ── Audit helper ────────────────────────────────────────────────
  appendAudit: (id, entry) => {
    const full: AuditEntry = { ...entry, timestamp: now() };
    set((s) => ({
      inquiries: s.inquiries.map((i) =>
        i.id === id ? { ...i, auditTrail: [...i.auditTrail, full] } : i
      ),
    }));
  },
}));
