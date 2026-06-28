// src/modules/freight/types.ts

export type FreightMode = "Air" | "Sea" | "Land";

export type FreightStatus =
  | "draft"
  | "inquiry"
  | "quoted"
  | "booked"
  | "shipment_created"
  | "cargo_received"
  | "at_origin_port"
  | "loaded_on_vessel"
  | "in_transit"
  | "arrived_at_destination"
  | "customs_clearance"
  | "out_for_delivery"
  | "delivered"
  | "completed";

export type TrackingEvent = {
  status: FreightStatus;
  timestamp: string;
  user: string;
  remarks: string;
};

export type FreightDocument = {
  id: string;
  type:
    | "commercial_invoice"
    | "packing_list"
    | "coo"
    | "insurance"
    | "hbl"
    | "shipping_instructions"
    | "arrival_notice"
    | "delivery_order"
    | "pod";
  label: string;
  fileUrl?: string; // BE: MinIO URL from POST /api/v1/documents/upload
  uploadedAt?: string;
  uploadedBy?: string;
  version: number;
};

// ─── Step 1: Freight Inquiry ─────────────────────────────────────
export type FreightInquiry = {
  id: string; // e.g. FI-2025-001
  customer: string;
  origin: string;
  destination: string;
  mode: FreightMode;
  commodity: string;
  weight: number;
  volume: number;
  remarks: string;
  status: FreightStatus;
  fromTradingDealId?: string; // set when auto-created from trading
  timeline: TrackingEvent[];
  createdAt: string;
};

// ─── Step 2: Freight Quotation ───────────────────────────────────
export type FreightQuotation = {
  id: string;
  inquiryId: string;
  carrierRates: number;
  localCharges: number;
  handlingCharges: number;
  customsCharges: number;
  margin: number;
  totalPrice: number;
  currency: "USD" | "PKR" | "EUR";
  status: FreightStatus;
  createdAt: string;
};

// ─── Step 3: Booking ─────────────────────────────────────────────
export type Booking = {
  id: string;
  inquiryId: string;
  carrier: string;
  vesselFlight: string;
  voyageNumber: string;
  schedule: string;
  bookingReference: string;
  status: FreightStatus;
  createdAt: string;
};

// ─── Step 4: Shipment ────────────────────────────────────────────
export type FreightShipment = {
  id: string; // e.g. SHP-2025-001
  inquiryId: string;
  bookingId?: string;
  containerNumber: string;
  etd: string;
  eta: string;
  origin: string;
  destination: string;
  carrier: string;
  customer: string;
  status: FreightStatus;
  documents: FreightDocument[];
  timeline: TrackingEvent[];
  // Finance
  freightInvoiceAmount?: number;
  clientPayments: number;
  vendorCharges: number;
  createdAt: string;
};
