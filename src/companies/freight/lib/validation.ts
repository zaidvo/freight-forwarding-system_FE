// src/modules/freight/lib/validation.ts
//
// Centralised validation rules for the freight workflow.
// All guards live here so pages stay thin and rules are testable.

import type { FreightShipment, FreightDocument } from "../types";

// ─── Document types required before specific status transitions ───
const DOCS_REQUIRED_FOR_DELIVERY: FreightDocument["type"][] = [
  "commercial_invoice",
  "packing_list",
  "hbl",
];

const DOCS_REQUIRED_FOR_CLOSURE: FreightDocument["type"][] = [
  "commercial_invoice",
  "packing_list",
  "hbl",
  "delivery_order",
];

// ─── Helpers ──────────────────────────────────────────────────────

/** Returns which of the required doc types are still missing (no fileUrl). */
export function getMissingDocs(
  documents: FreightDocument[],
  required: FreightDocument["type"][],
): string[] {
  return required
    .filter((type) => {
      const doc = documents.find((d) => d.type === type);
      return !doc?.fileUrl;
    })
    .map((type) => {
      const doc = documents.find((d) => d.type === type);
      return doc?.label ?? type;
    });
}

/**
 * V4 — Block advancing to out_for_delivery / delivered if mandatory
 * client docs are not uploaded.
 */
export function canAdvanceToDelivery(shipment: FreightShipment): {
  ok: boolean;
  missing: string[];
} {
  const missing = getMissingDocs(
    shipment.documents,
    DOCS_REQUIRED_FOR_DELIVERY,
  );
  return { ok: missing.length === 0, missing };
}

/**
 * V5 — Block closure if there are outstanding payments.
 * V4 partial — also checks closure-required docs.
 */
export function canCloseShipment(shipment: FreightShipment): {
  ok: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  const outstanding =
    (shipment.freightInvoiceAmount ?? 0) - shipment.clientPayments;
  if (outstanding > 0) {
    reasons.push(
      `Outstanding payment of USD ${outstanding.toLocaleString()} must be cleared.`,
    );
  }

  const missingDocs = getMissingDocs(
    shipment.documents,
    DOCS_REQUIRED_FOR_CLOSURE,
  );
  if (missingDocs.length > 0) {
    reasons.push(`Missing documents: ${missingDocs.join(", ")}.`);
  }

  if (shipment.status !== "delivered") {
    reasons.push(`Shipment must be in "Delivered" status before closing.`);
  }

  return { ok: reasons.length === 0, reasons };
}

/**
 * V6 — Statuses at which the shipment becomes fully read-only.
 */
export function isShipmentLocked(shipment: FreightShipment): boolean {
  return shipment.status === "completed";
}

/**
 * V7 — Field-level validation for the shipment creation form.
 * Returns a map of fieldName → error message (only for invalid fields).
 */
export type ShipmentFormErrors = Partial<{
  containerNumber: string;
  etd: string;
  eta: string;
  carrier: string;
  customer: string;
  origin: string;
  destination: string;
  inquiryId: string;
}>;

export function validateShipmentForm(form: {
  containerNumber: string;
  etd: string;
  eta: string;
  carrier: string;
  customer: string;
  origin: string;
  destination: string;
  inquiryId: string;
}): ShipmentFormErrors {
  const errors: ShipmentFormErrors = {};
  if (!form.containerNumber.trim())
    errors.containerNumber = "Container number is required.";
  if (!form.etd) errors.etd = "ETD is required.";
  if (!form.eta) errors.eta = "ETA is required.";
  if (!form.carrier.trim()) errors.carrier = "Carrier is required.";
  if (!form.customer.trim()) errors.customer = "Customer is required.";
  if (!form.origin.trim()) errors.origin = "Origin is required.";
  if (!form.destination.trim()) errors.destination = "Destination is required.";
  return errors;
}

/**
 * V7 — Field-level validation for the booking form.
 */
export type BookingFormErrors = Partial<{
  carrier: string;
  bookingReference: string;
}>;

export function validateBookingForm(form: {
  carrier: string;
  bookingReference: string;
}): BookingFormErrors {
  const errors: BookingFormErrors = {};
  if (!form.carrier.trim()) errors.carrier = "Carrier is required.";
  if (!form.bookingReference.trim())
    errors.bookingReference = "Booking reference is required.";
  return errors;
}

// ─── Statuses that gate on delivery docs ─────────────────────────
export const DELIVERY_GATED_STATUSES = new Set([
  "out_for_delivery",
  "delivered",
]);
