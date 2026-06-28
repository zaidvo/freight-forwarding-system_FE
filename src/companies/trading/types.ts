// src/modules/trading/types.ts

// ─── Shared ──────────────────────────────────────────────────────
export type TradingStatus =
  | "draft"
  | "inquiry_received"
  | "quoted"
  | "pi_issued"
  | "po_received"
  | "deal_confirmed"
  | "shipment_created"
  | "trading_completed";

export type AuditEntry = {
  timestamp: string;
  user: string;
  action: string;
  remarks?: string;
};

// ─── Step 1: Trading Inquiry ─────────────────────────────────────
export type TradingInquiry = {
  id: string; // auto-generated e.g. TI-2025-001
  buyer: string;
  contactPerson: string;
  email: string;
  phone: string;
  product: string;
  quantity: number;
  unit: string;
  destinationCountry: string;
  inquiryDate: string;
  notes: string;
  assignedSalesperson: string;
  status: TradingStatus;
  auditTrail: AuditEntry[];
  createdAt: string;
};

// ─── Step 2: Quotation ───────────────────────────────────────────
export type Quotation = {
  id: string; // e.g. QT-2025-001
  inquiryId: string;
  customer: string;
  product: string;
  quantity: number;
  unitPrice: number;
  currency: "USD" | "PKR" | "EUR" | "GBP";
  incoterms: string;
  paymentTerms: string;
  validUntil: string;
  remarks: string;
  status: TradingStatus;
  auditTrail: AuditEntry[];
  createdAt: string;
};

// ─── Step 3: Proforma Invoice ────────────────────────────────────
// Reuses ProformaInvoiceForm from src/modules/sales/types.ts
// PI is generated from Quotation data
export type ProformaInvoiceRef = {
  id: string; // e.g. PI-2025-001
  quotationId: string;
  inquiryId: string;
  status: TradingStatus;
  createdAt: string;
};

// ─── Step 4: Purchase Order ──────────────────────────────────────
export type PurchaseOrder = {
  id: string; // e.g. PO-2025-001
  piId: string;
  inquiryId: string;
  poNumber: string;
  poDate: string;
  attachmentUrl?: string; // BE: MinIO/file storage URL
  customerNotes: string;
  status: TradingStatus;
  auditTrail: AuditEntry[];
  createdAt: string;
};

// ─── Step 5: Deal ────────────────────────────────────────────────
export type Deal = {
  id: string; // e.g. DEAL-2025-001
  inquiryId: string;
  poId: string;
  customer: string;
  product: string;
  quantity: number;
  totalValue: number;
  currency: string;
  status: TradingStatus;
  freightHandledByUs?: boolean; // Step 6 decision
  freightShipmentId?: string; // set if freight path taken
  auditTrail: AuditEntry[];
  createdAt: string;
};

// ─── Pipeline (full record linking all steps) ────────────────────
export type TradingPipeline = {
  inquiry: TradingInquiry;
  quotation?: Quotation;
  piRef?: ProformaInvoiceRef;
  purchaseOrder?: PurchaseOrder;
  deal?: Deal;
};
