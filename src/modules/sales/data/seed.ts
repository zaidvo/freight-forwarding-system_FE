// src/modules/sales/data/seed.ts
import type { ProformaInvoiceForm } from "../types";

export const EMPTY_PROFORMA: ProformaInvoiceForm = {
  piNumber: `PI-${new Date().getFullYear()}-001`,
  date: new Date().toISOString().split("T")[0],
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  sellerName: "",
  sellerAddress: "",
  sellerContact: "",
  buyerName: "",
  buyerAddress: "",
  buyerContact: "",
  portOfLoading: "Karachi, Pakistan",
  portOfDischarge: "",
  incoterms: "FOB",
  paymentTerms: "50% advance, 50% against B/L copy",
  currency: "USD",
  items: [
    {
      id: crypto.randomUUID(),
      description: "",
      quantity: "1",
      unit: "PCS",
      unitPrice: "",
    },
  ],
  freightCharges: "",
  insuranceCharges: "",
  otherCharges: "",
  bankDetails: "",
  notes: "",
};

export const INCOTERMS = [
  "EXW",
  "FCA",
  "CPT",
  "CIP",
  "DAP",
  "DPU",
  "DDP",
  "FAS",
  "FOB",
  "CFR",
  "CIF",
];

export const PAYMENT_TERMS = [
  "100% advance",
  "50% advance, 50% against B/L copy",
  "30% advance, 70% against documents",
  "Letter of Credit (L/C)",
  "Documents against Payment (D/P)",
  "Documents against Acceptance (D/A)",
  "Net 30 days",
  "Net 60 days",
];
