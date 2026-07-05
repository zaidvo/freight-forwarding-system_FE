// src/companies/trading/types/importTypes.ts
//
// Type definitions for the Trading Import Module.
// Covers all 6 document types in the import shipment lifecycle.

// ─── Enums & Shared Types ────────────────────────────────────────

export type DocumentStatus = "draft" | "pending_approval" | "approved" | "cancelled";

export type ShipmentStatus = "new" | "in_progress" | "completed" | "cancelled";

export type ShipmentStage =
  | "Created"
  | "Draft BL"
  | "HBL Created"
  | "MBL Created"
  | "Freight Invoice"
  | "Payment Receipt"
  | "Detention Invoice"
  | "Invoice Generated"
  | "Completed";

export type AuditRecord = {
  createdBy: string;
  createdDate: string;
  modifiedBy?: string;
  modifiedDate?: string;
  approvedBy?: string;
  approvedDate?: string;
};

export type ContainerRow = {
  id: string;
  containerNo: string;
  size: string; // 20' / 40' / 40'HC / 45'
  sealNo: string;
  packages: number;
  grossWeight: number;
  netWeight: number;
  cbm: number;
};

export type ChargeLine = {
  id: string;
  chargeName: string;
  rate: number;
  quantity: number;
  amount: number;
};

export type PdfAttachment = {
  fileName: string;
  fileSize: number;
  blobUrl: string;
  uploadedAt: string;
  uploadedBy: string;
};

// ─── Document 1: Draft BL ────────────────────────────────────────

export type DraftBL = {
  id: string;
  shipmentId: string;
  status: DocumentStatus;
  audit: AuditRecord;

  draftBlNo: string;
  bookingNo: string;
  vessel: string;
  voyage: string;
  pol: string; // Port of Loading
  pod: string; // Port of Discharge
  placeOfDelivery: string;

  shipper: string;
  consignee: string;
  notifyParty: string;

  cargoDescription: string;
  hsCode: string;

  packages: number;
  grossWeight: number;
  netWeight: number;
  cbm: number;

  containers: ContainerRow[];

  freightTerms: string;
  draftDate: string;
  onBoardDate: string;

  pdf?: PdfAttachment;
};

// ─── Document 2: House BL ────────────────────────────────────────

export type HouseBL = {
  id: string;
  shipmentId: string;
  status: DocumentStatus;
  audit: AuditRecord;

  hblNumber: string;
  bookingNumber: string;
  serviceContract: string;

  placeOfReceipt: string;
  pol: string;
  pod: string;
  placeOfDelivery: string;

  vessel: string;
  voyage: string;

  shipper: string;
  consignee: string;
  notifyParty: string;
  deliveryAgent: string;

  marksAndNumbers: string;
  cargoDescription: string;

  containers: ContainerRow[];

  packages: number;
  grossWeight: number;
  netWeight: number;
  cbm: number;

  freightTerms: string;

  placeOfIssue: string;
  issueDate: string;
  onBoardDate: string;

  pdf?: PdfAttachment;
};

// ─── Document 3: Master BL ───────────────────────────────────────

export type MasterBL = {
  id: string;
  shipmentId: string;
  status: DocumentStatus;
  audit: AuditRecord;

  shippingLine: string;
  mblNumber: string;
  bookingNumber: string;

  placeOfReceipt: string;
  pol: string;
  pod: string;
  placeOfDelivery: string;

  vessel: string;
  voyage: string;

  shipper: string;
  consignee: string;
  notifyParty: string;

  forwarderReference: string;

  cargoDescription: string;

  containers: ContainerRow[];

  packages: number;
  grossWeight: number;
  cbm: number;

  freightTerms: string;
  freightCharges: string;

  countryOfOrigin: string;

  placeOfIssue: string;
  issueDate: string;
  onBoardDate: string;

  pdf?: PdfAttachment;
};

// ─── Document 4: Arrival Notice ──────────────────────────────────

export type ArrivalNotice = {
  id: string;
  shipmentId: string;
  status: DocumentStatus;
  audit: AuditRecord;

  // Auto-fill from HBL/MBL
  hblNo: string;
  mblNo: string;
  bookingNo: string;
  vessel: string;
  voyage: string;
  shippingLine: string;
  containers: ContainerRow[];
  cargoDescription: string;
  packages: number;
  grossWeight: number;
  pol: string;
  pod: string;
  destination: string;
  consignee: string;

  // Manual
  noticeNo: string;
  noticeDate: string;
  eta: string;
  arrivalDate: string;
  storageCharges: number;
  demurrage: number;
  otherCharges: number;
  remarks: string;
};

// ─── Document 5: Delivery Order ──────────────────────────────────

export type DeliveryOrder = {
  id: string;
  shipmentId: string;
  status: DocumentStatus;
  audit: AuditRecord;

  // Auto-fill
  hblNo: string;
  mblNo: string;
  bookingNo: string;
  consignee: string;
  shippingLine: string;
  containers: ContainerRow[];
  cargoDescription: string;
  packages: number;
  grossWeight: number;
  pol: string;
  pod: string;
  destination: string;

  // Manual
  doNumber: string;
  doDate: string;
  releaseDate: string;
  pickupLocation: string;
  warehouse: string;
  chargesPaid: number;
  outstandingAmount: number;
  issuedBy: string;
  approvedBy: string;
};

// ─── Document 6: Import Clearing Invoice ─────────────────────────

export type ImportClearingInvoice = {
  id: string;
  shipmentId: string;
  status: DocumentStatus;
  audit: AuditRecord;

  // Auto-fill
  hblNumber: string;
  mblNumber: string;
  containerNumber: string;
  containerType: string;
  shippingLine: string;
  vessel: string;
  voyage: string;
  shipper: string;
  consignee: string;
  cargoDescription: string;
  grossWeight: number;
  netWeight: number;
  pol: string;
  pod: string;
  destination: string;

  // Manual
  invoiceNumber: string;
  invoiceDate: string;
  customer: string;
  ntn: string;
  clearingAgent: string;
  exchangeRate: number;

  // Charges
  charges: ChargeLine[];
  subtotal: number;
  totalAmount: number;
  grandTotal: number;
  amountInWords: string;
};

// ─── Shipment Master Record ──────────────────────────────────────

export type ImportPaymentReceipt = {
  id: string;
  shipmentId: string;
  status: DocumentStatus;
  audit: AuditRecord;

  receiptNo: string;
  tid: string;
  amount: number;
  currency: string;
  paymentDate: string;
  renderData?: Record<string, unknown>;
};

export type DetentionInvoice = {
  id: string;
  shipmentId: string;
  status: DocumentStatus;
  audit: AuditRecord;

  invoiceNo: string;
  detentionStart: string;
  detentionEnd: string;
  freeDays: number;
  chargeableDays: number;
  perDayAmount: number;
  detentionAmount: number;
  securityDeposit: number;
  refundAmount: number;
  currency: string;
  manualFields: Record<string, unknown>;
  renderData?: Record<string, unknown>;
};
export type ImportShipment = {
  id: string;
  referenceNo: string;
  createdDate: string;
  expectedArrivalDate: string;
  customer: string;
  salesperson: string;
  company: string;
  remarks: string;

  status: ShipmentStatus;
  currentStage: ShipmentStage;

  // Linked documents (null means not created yet)
  draftBL: DraftBL | null;
  houseBL: HouseBL | null;
  masterBL: MasterBL | null;
  arrivalNotice: ArrivalNotice | null;
  deliveryOrder: DeliveryOrder | null;
  clearingInvoice: ImportClearingInvoice | null;
  paymentReceipt: ImportPaymentReceipt | null;
  detentionInvoice: DetentionInvoice | null;
};

// ─── Default charge names for Import Clearing Invoice ────────────

export const DEFAULT_CHARGE_NAMES = [
  "THC",
  "EMF",
  "ISPS",
  "LOLO",
  "Documentation",
  "CAFD",
  "ISC",
  "Gate Pass",
  "Security Deposit",
  "Other Charges",
] as const;
