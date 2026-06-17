// src/modules/freight/store/freightStore.ts
//
// BE integration: Replace each action with apiRequest() calls.
// Pattern same as tradingStore.ts

import { create } from "zustand";
import type {
  FreightInquiry,
  FreightQuotation,
  Booking,
  FreightShipment,
  FreightStatus,
  TrackingEvent,
  FreightDocument,
} from "../types";
import {
  SEED_FREIGHT_INQUIRIES,
  SEED_SHIPMENTS,
  generateFreightInquiryId,
  generateShipmentId,
} from "../data/seed";

type FreightStore = {
  inquiries: FreightInquiry[];
  quotations: FreightQuotation[];
  bookings: Booking[];
  shipments: FreightShipment[];

  // Step 1
  createInquiry: (
    data: Omit<FreightInquiry, "id" | "status" | "timeline" | "createdAt">
  ) => FreightInquiry;

  // Auto-create from trading deal
  createInquiryFromDeal: (deal: {
    customer: string;
    product: string;
    quantity: number;
    origin: string;
    destination: string;
    tradingDealId: string;
  }) => FreightInquiry;

  // Step 2
  createQuotation: (
    data: Omit<FreightQuotation, "id" | "status" | "createdAt">
  ) => FreightQuotation;

  // Step 3
  createBooking: (
    data: Omit<Booking, "id" | "status" | "createdAt">
  ) => Booking;

  // Step 4
  createShipment: (
    data: Omit<
      FreightShipment,
      | "id"
      | "status"
      | "documents"
      | "timeline"
      | "clientPayments"
      | "vendorCharges"
      | "createdAt"
    >
  ) => FreightShipment;

  // Step 5 — Documents
  uploadDocument: (
    shipmentId: string,
    docType: FreightDocument["type"],
    fileUrl: string
  ) => void;

  // Step 6 — Tracking
  updateTrackingStatus: (
    shipmentId: string,
    status: FreightStatus,
    remarks: string
  ) => void;

  // Step 7 — Finance
  recordPayment: (shipmentId: string, amount: number) => void;
  recordVendorCharge: (shipmentId: string, amount: number) => void;
  setFreightInvoice: (shipmentId: string, amount: number) => void;

  // Step 9 — Closure
  closeShipment: (shipmentId: string) => void;
};

const now = () => new Date().toISOString();
const trackEvent = (
  status: FreightStatus,
  remarks: string,
  user = "Current User"
): TrackingEvent => ({
  status,
  timestamp: now(),
  user,
  remarks,
});

const INITIAL_DOCS: FreightDocument[] = [
  {
    id: "d1",
    type: "commercial_invoice",
    label: "Commercial Invoice",
    version: 0,
  },
  { id: "d2", type: "packing_list", label: "Packing List", version: 0 },
  { id: "d3", type: "coo", label: "Certificate of Origin", version: 0 },
  { id: "d4", type: "insurance", label: "Insurance Certificate", version: 0 },
  { id: "d5", type: "hbl", label: "House Bill of Lading", version: 0 },
  {
    id: "d6",
    type: "shipping_instructions",
    label: "Shipping Instructions",
    version: 0,
  },
  { id: "d7", type: "arrival_notice", label: "Arrival Notice", version: 0 },
  { id: "d8", type: "delivery_order", label: "Delivery Order", version: 0 },
];

export const useFreightStore = create<FreightStore>((set) => ({
  inquiries: SEED_FREIGHT_INQUIRIES,
  quotations: [],
  bookings: [],
  shipments: SEED_SHIPMENTS,

  // ── Step 1 ──────────────────────────────────────────────────────
  createInquiry: (data) => {
    const inquiry: FreightInquiry = {
      ...data,
      id: generateFreightInquiryId(),
      status: "inquiry",
      timeline: [trackEvent("inquiry", "Inquiry created")],
      createdAt: now(),
    };
    // BE: POST /api/v1/freight/inquiries
    set((s) => ({ inquiries: [inquiry, ...s.inquiries] }));
    return inquiry;
  },

  createInquiryFromDeal: (deal) => {
    const inquiry: FreightInquiry = {
      id: generateFreightInquiryId(),
      customer: deal.customer,
      origin: deal.origin,
      destination: deal.destination,
      mode: "Sea",
      commodity: deal.product,
      weight: deal.quantity,
      volume: 0,
      remarks: `Auto-created from Trading Deal ${deal.tradingDealId}`,
      status: "inquiry",
      fromTradingDealId: deal.tradingDealId,
      timeline: [
        trackEvent(
          "inquiry",
          `Auto-created from Trading Deal ${deal.tradingDealId}`,
          "System"
        ),
      ],
      createdAt: now(),
    };
    // BE: POST /api/v1/freight/inquiries (with source=trading_deal)
    set((s) => ({ inquiries: [inquiry, ...s.inquiries] }));
    return inquiry;
  },

  // ── Step 2 ──────────────────────────────────────────────────────
  createQuotation: (data) => {
    const total =
      data.carrierRates +
      data.localCharges +
      data.handlingCharges +
      data.customsCharges +
      data.margin;
    const quotation: FreightQuotation = {
      ...data,
      id: `FQ-${Date.now()}`,
      totalPrice: total,
      status: "quoted",
      createdAt: now(),
    };
    // BE: POST /api/v1/freight/quotations
    set((s) => ({
      quotations: [quotation, ...s.quotations],
      inquiries: s.inquiries.map((i) =>
        i.id === data.inquiryId
          ? { ...i, status: "quoted" as FreightStatus }
          : i
      ),
    }));
    return quotation;
  },

  // ── Step 3 ──────────────────────────────────────────────────────
  createBooking: (data) => {
    const booking: Booking = {
      ...data,
      id: `BK-${Date.now()}`,
      status: "booked",
      createdAt: now(),
    };
    // BE: POST /api/v1/freight/bookings
    set((s) => ({
      bookings: [booking, ...s.bookings],
      inquiries: s.inquiries.map((i) =>
        i.id === data.inquiryId
          ? { ...i, status: "booked" as FreightStatus }
          : i
      ),
    }));
    return booking;
  },

  // ── Step 4 ──────────────────────────────────────────────────────
  createShipment: (data) => {
    const shipment: FreightShipment = {
      ...data,
      id: generateShipmentId(),
      status: "shipment_created",
      documents: INITIAL_DOCS,
      timeline: [trackEvent("shipment_created", "Shipment record created")],
      clientPayments: 0,
      vendorCharges: 0,
      createdAt: now(),
    };
    // BE: POST /api/v1/freight/shipments
    set((s) => ({
      shipments: [shipment, ...s.shipments],
      inquiries: s.inquiries.map((i) =>
        i.id === data.inquiryId
          ? { ...i, status: "shipment_created" as FreightStatus }
          : i
      ),
    }));
    return shipment;
  },

  // ── Step 5 ──────────────────────────────────────────────────────
  uploadDocument: (shipmentId, docType, fileUrl) => {
    // BE: POST /api/v1/documents/upload → returns MinIO URL
    //     PATCH /api/v1/freight/shipments/:id/documents
    set((s) => ({
      shipments: s.shipments.map((shp) =>
        shp.id === shipmentId
          ? {
              ...shp,
              documents: shp.documents.map((doc) =>
                doc.type === docType
                  ? {
                      ...doc,
                      fileUrl,
                      uploadedAt: now(),
                      uploadedBy: "Current User",
                      version: doc.version + 1,
                    }
                  : doc
              ),
            }
          : shp
      ),
    }));
  },

  // ── Step 6 ──────────────────────────────────────────────────────
  updateTrackingStatus: (shipmentId, status, remarks) => {
    // BE: PATCH /api/v1/freight/shipments/:id/status
    set((s) => ({
      shipments: s.shipments.map((shp) =>
        shp.id === shipmentId
          ? {
              ...shp,
              status,
              timeline: [...shp.timeline, trackEvent(status, remarks)],
            }
          : shp
      ),
      inquiries: s.inquiries.map((i) =>
        s.shipments.find((shp) => shp.id === shipmentId)?.inquiryId === i.id
          ? { ...i, status }
          : i
      ),
    }));
  },

  // ── Step 7 ──────────────────────────────────────────────────────
  recordPayment: (shipmentId, amount) => {
    // BE: POST /api/v1/freight/shipments/:id/payments
    set((s) => ({
      shipments: s.shipments.map((shp) =>
        shp.id === shipmentId
          ? { ...shp, clientPayments: shp.clientPayments + amount }
          : shp
      ),
    }));
  },

  recordVendorCharge: (shipmentId, amount) => {
    // BE: POST /api/v1/freight/shipments/:id/vendor-charges
    set((s) => ({
      shipments: s.shipments.map((shp) =>
        shp.id === shipmentId
          ? { ...shp, vendorCharges: shp.vendorCharges + amount }
          : shp
      ),
    }));
  },

  setFreightInvoice: (shipmentId, amount) => {
    // BE: POST /api/v1/freight/shipments/:id/invoice
    set((s) => ({
      shipments: s.shipments.map((shp) =>
        shp.id === shipmentId ? { ...shp, freightInvoiceAmount: amount } : shp
      ),
    }));
  },

  // ── Step 9 ──────────────────────────────────────────────────────
  closeShipment: (shipmentId) => {
    // BE: PATCH /api/v1/freight/shipments/:id/close
    set((s) => ({
      shipments: s.shipments.map((shp) =>
        shp.id === shipmentId
          ? {
              ...shp,
              status: "completed" as FreightStatus,
              timeline: [
                ...shp.timeline,
                trackEvent("completed", "Shipment closed and archived"),
              ],
            }
          : shp
      ),
    }));
  },
}));
