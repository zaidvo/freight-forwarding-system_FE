// src/modules/freight/data/seed.ts
//
// BE integration:
//   GET /api/v1/freight/inquiries   → replace SEED_FREIGHT_INQUIRIES
//   GET /api/v1/freight/shipments   → replace SEED_SHIPMENTS
//   POST /api/v1/freight/inquiries  → replace createFreightInquiry()
//   PATCH /api/v1/freight/shipments/:id/status → replace updateShipmentStatus()

import type {
  FreightInquiry,
  FreightShipment,
  FreightDocument,
} from "../types";

const now = new Date().toISOString();
const today = now.split("T")[0];
const year = new Date().getFullYear();

export const SEED_FREIGHT_INQUIRIES: FreightInquiry[] = [
  {
    id: `FI-${year}-001`,
    customer: "Al-Razi Pharma Ltd",
    origin: "Karachi, Pakistan",
    destination: "Dubai, UAE",
    mode: "Air",
    commodity: "Pharmaceutical Products",
    weight: 500,
    volume: 3.2,
    remarks: "Temp-controlled required.",
    status: "quoted",
    timeline: [
      {
        status: "inquiry",
        timestamp: now,
        user: "Omar Farooq",
        remarks: "Inquiry received",
      },
      {
        status: "quoted",
        timestamp: now,
        user: "Omar Farooq",
        remarks: "Quotation sent to client",
      },
    ],
    createdAt: now,
  },
  {
    id: `FI-${year}-002`,
    customer: "Dubai Commodities Co.",
    origin: "Port Qasim, Pakistan",
    destination: "Jebel Ali, UAE",
    mode: "Sea",
    commodity: "Surgical Instruments",
    weight: 12000,
    volume: 28.5,
    remarks: "From Trading Deal DEAL-2025-001",
    status: "in_transit",
    fromTradingDealId: "DEAL-2025-001",
    timeline: [
      {
        status: "inquiry",
        timestamp: now,
        user: "System",
        remarks: "Auto-created from trading deal DEAL-2025-001",
      },
      {
        status: "booked",
        timestamp: now,
        user: "Omar Farooq",
        remarks: "Booked with MSC Lines",
      },
      {
        status: "shipment_created",
        timestamp: now,
        user: "Omar Farooq",
        remarks: "Shipment SHP-2025-001 created",
      },
      {
        status: "cargo_received",
        timestamp: now,
        user: "Hina Siddiqui",
        remarks: "Cargo received at warehouse",
      },
      {
        status: "loaded_on_vessel",
        timestamp: now,
        user: "Hina Siddiqui",
        remarks: "Loaded on MSC Danit",
      },
      {
        status: "in_transit",
        timestamp: now,
        user: "System",
        remarks: "Vessel departed",
      },
    ],
    createdAt: now,
  },
];

const EMPTY_DOCS: FreightDocument[] = [
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
  { id: "d9", type: "pod", label: "Proof of Delivery", version: 0 },
];

export const SEED_SHIPMENTS: FreightShipment[] = [
  {
    id: `SHP-${year}-001`,
    inquiryId: `FI-${year}-002`,
    containerNumber: "MSCU1234567",
    etd: today,
    eta: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    origin: "Port Qasim, Pakistan",
    destination: "Jebel Ali, UAE",
    carrier: "MSC Lines",
    customer: "Dubai Commodities Co.",
    status: "in_transit",
    documents: EMPTY_DOCS.map((d) =>
      d.type === "commercial_invoice" || d.type === "packing_list"
        ? {
            ...d,
            fileUrl: "#",
            uploadedAt: now,
            uploadedBy: "Omar Farooq",
            version: 1,
          }
        : d,
    ),
    timeline: [
      {
        status: "cargo_received",
        timestamp: now,
        user: "Hina Siddiqui",
        remarks: "Cargo at warehouse",
      },
      {
        status: "loaded_on_vessel",
        timestamp: now,
        user: "Hina Siddiqui",
        remarks: "Loaded on MSC Danit",
      },
      {
        status: "in_transit",
        timestamp: now,
        user: "System",
        remarks: "Vessel departed Port Qasim",
      },
    ],
    freightInvoiceAmount: 4500,
    clientPayments: 2000,
    vendorCharges: 2800,
    createdAt: now,
  },
];

// Status display config
export const FREIGHT_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  inquiry: "Inquiry",
  quoted: "Quoted",
  booked: "Booked",
  shipment_created: "Shipment Created",
  cargo_received: "Cargo Received",
  at_origin_port: "At Origin Port",
  loaded_on_vessel: "Loaded on Vessel",
  in_transit: "In Transit",
  arrived_at_destination: "Arrived",
  customs_clearance: "Customs Clearance",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  completed: "Completed",
};

export const FREIGHT_STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-500",
  inquiry: "bg-blue-50 text-blue-600",
  quoted: "bg-amber-50 text-amber-600",
  booked: "bg-purple-50 text-purple-600",
  shipment_created: "bg-sky-50 text-sky-600",
  cargo_received: "bg-orange-50 text-orange-600",
  at_origin_port: "bg-orange-50 text-orange-700",
  loaded_on_vessel: "bg-indigo-50 text-indigo-600",
  in_transit: "bg-blue-50 text-blue-700",
  arrived_at_destination: "bg-teal-50 text-teal-600",
  customs_clearance: "bg-yellow-50 text-yellow-700",
  out_for_delivery: "bg-emerald-50 text-emerald-600",
  delivered: "bg-emerald-50 text-emerald-700",
  completed: "bg-green-50 text-green-700",
};

export const TRACKING_SEQUENCE: string[] = [
  "cargo_received",
  "at_origin_port",
  "loaded_on_vessel",
  "in_transit",
  "arrived_at_destination",
  "customs_clearance",
  "out_for_delivery",
  "delivered",
];

// Auto ID generator — BE will assign real IDs
export const generateFreightInquiryId = () =>
  `FI-${year}-${String(Math.floor(Math.random() * 900) + 100)}`;
export const generateShipmentId = () =>
  `SHP-${year}-${String(Math.floor(Math.random() * 900) + 100)}`;
