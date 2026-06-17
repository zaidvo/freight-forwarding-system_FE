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
  Deal,
  AuditEntry,
  TradingStatus,
} from "../types";
import {
  SEED_INQUIRIES,
  SEED_QUOTATIONS,
  SEED_PURCHASE_ORDERS,
  SEED_DEALS,
  generateInquiryId,
  generateQuotationId,
  generatePOId,
  generateDealId,
  generatePIId,
} from "../data/seed";

type TradingStore = {
  inquiries: TradingInquiry[];
  quotations: Quotation[];
  purchaseOrders: PurchaseOrder[];
  deals: Deal[];

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

  // Step 5
  confirmDeal: (poId: string, inquiryId: string) => Deal;
  rejectDeal: (poId: string, reason: string) => void;

  // Step 6
  handleFreightDecision: (dealId: string, freightByUs: boolean) => void;

  // Audit
  appendAudit: (
    recordType: "inquiry" | "deal",
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

export const useTradingStore = create<TradingStore>((set, get) => ({
  inquiries: SEED_INQUIRIES,
  quotations: SEED_QUOTATIONS,
  purchaseOrders: SEED_PURCHASE_ORDERS,
  deals: SEED_DEALS,

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

  // ── Step 5 ──────────────────────────────────────────────────────
  confirmDeal: (poId, inquiryId) => {
    const { inquiries, purchaseOrders } = get();
    const inq = inquiries.find((i) => i.id === inquiryId)!;
    const po = purchaseOrders.find((p) => p.id === poId);
    const quotation = get().quotations.find((q) => q.inquiryId === inquiryId);

    const deal: Deal = {
      id: generateDealId(),
      inquiryId,
      poId: po?.id ?? poId,
      customer: inq.buyer,
      product: inq.product,
      quantity: inq.quantity,
      totalValue: (quotation?.unitPrice ?? 0) * inq.quantity,
      currency: quotation?.currency ?? "USD",
      status: "deal_confirmed",
      auditTrail: [audit("Deal confirmed")],
      createdAt: now(),
    };
    // BE: POST /api/v1/trading/deals
    set((s) => ({
      deals: [deal, ...s.deals],
      inquiries: s.inquiries.map((i) =>
        i.id === inquiryId
          ? {
              ...i,
              status: "deal_confirmed" as TradingStatus,
              auditTrail: [...i.auditTrail, audit("Deal confirmed")],
            }
          : i
      ),
    }));
    return deal;
  },

  rejectDeal: (poId, reason) => {
    // BE: PATCH /api/v1/trading/deals/:id/reject
    const po = get().purchaseOrders.find((p) => p.id === poId);
    if (!po) return;
    set((s) => ({
      inquiries: s.inquiries.map((i) =>
        i.id === po.inquiryId
          ? {
              ...i,
              auditTrail: [...i.auditTrail, audit(`Deal rejected: ${reason}`)],
            }
          : i
      ),
    }));
  },

  // ── Step 6 ──────────────────────────────────────────────────────
  handleFreightDecision: (dealId, freightByUs) => {
    const status: TradingStatus = freightByUs
      ? "shipment_created"
      : "trading_completed";
    const action = freightByUs
      ? "Freight shipment created"
      : "Trading completed (external freight)";
    // BE: PATCH /api/v1/trading/deals/:id/freight-decision
    // If freightByUs: BE creates freight shipment draft and returns shipment ID
    set((s) => ({
      deals: s.deals.map((d) =>
        d.id === dealId
          ? {
              ...d,
              status,
              freightHandledByUs: freightByUs,
              auditTrail: [...d.auditTrail, audit(action)],
            }
          : d
      ),
    }));
  },

  // ── Audit helper ────────────────────────────────────────────────
  appendAudit: (recordType, id, entry) => {
    const full: AuditEntry = { ...entry, timestamp: now() };
    if (recordType === "inquiry") {
      set((s) => ({
        inquiries: s.inquiries.map((i) =>
          i.id === id ? { ...i, auditTrail: [...i.auditTrail, full] } : i
        ),
      }));
    } else {
      set((s) => ({
        deals: s.deals.map((d) =>
          d.id === id ? { ...d, auditTrail: [...d.auditTrail, full] } : d
        ),
      }));
    }
  },
}));
