// src/companies/trading/store/importStore.ts
//
// API-backed store for the Trading Import Module.

import { create } from "zustand";
import type {
  ImportShipment,
  DraftBL,
  HouseBL,
  MasterBL,
  ArrivalNotice,
  DeliveryOrder,
  ImportClearingInvoice,
  ImportPaymentReceipt,
  DetentionInvoice,
  ContainerRow,
  ChargeLine,
  DocumentStatus,
  PdfAttachment,
} from "../types/importTypes";
import {
  createImportRecord,
  listImportRecords,
  saveImportForm,
  saveFreightInvoice,
  createPaymentReceipt as createPaymentReceiptApi,
  saveDetentionInvoice as saveDetentionInvoiceApi,
  uploadImportPdf,
  type ImportDocKey,
} from "../services/tradingImportService";

const now = () => new Date().toISOString();
const currentUser = "Current User";

function makeAudit() {
  return { createdBy: currentUser, createdDate: now() };
}

let containerCounter = 0;
let chargeCounter = 0;

export function generateContainerId(): string {
  containerCounter += 1;
  return `cnt-${containerCounter}`;
}

export function generateChargeId(): string {
  chargeCounter += 1;
  return `chg-${chargeCounter}`;
}

export function emptyContainer(): ContainerRow {
  return {
    id: generateContainerId(),
    containerNo: "",
    size: "20'",
    sealNo: "",
    packages: 0,
    grossWeight: 0,
    netWeight: 0,
    cbm: 0,
  };
}

export function defaultChargeLines(): ChargeLine[] {
  const names: readonly string[] = [
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
  ];
  return names.map((name) => ({
    id: generateChargeId(),
    chargeName: name,
    rate: 0,
    quantity: 1,
    amount: 0,
  }));
}

export function numberToWords(n: number): string {
  if (n === 0) return "Zero";
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const scales = ["", "Thousand", "Million", "Billion"];

  const intPart = Math.floor(Math.abs(n));
  if (intPart === 0) return "Zero";

  const groups: number[] = [];
  let remaining = intPart;
  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const group = groups[i];
    if (group === 0) continue;
    const hundreds = Math.floor(group / 100);
    const tail = group % 100;
    let text = "";
    if (hundreds > 0) text += `${ones[hundreds]} Hundred`;
    if (tail > 0) {
      if (hundreds > 0) text += " and ";
      if (tail < 20) {
        text += ones[tail];
      } else {
        text += tens[Math.floor(tail / 10)];
        if (tail % 10 > 0) text += `-${ones[tail % 10]}`;
      }
    }
    if (scales[i]) text += ` ${scales[i]}`;
    parts.push(text);
  }

  const decimals = Math.round((Math.abs(n) - intPart) * 100);
  let result = parts.join(", ");
  if (decimals > 0) result += ` and ${decimals}/100`;
  return `${result} Only`;
}

type ImportStore = {
  shipments: ImportShipment[];
  isLoading: boolean;
  error: string | null;

  loadShipments: () => Promise<void>;

  createShipment: (data: {
    customer: string;
    salesperson: string;
    company: string;
    expectedArrivalDate: string;
    remarks: string;
  }) => Promise<ImportShipment>;

  deleteShipment: (id: string) => void;

  saveDraftBL: (
    shipmentId: string,
    data: Omit<DraftBL, "id" | "shipmentId" | "status" | "audit">,
    completed?: boolean,
  ) => Promise<void>;
  saveHouseBL: (
    shipmentId: string,
    data: Omit<HouseBL, "id" | "shipmentId" | "status" | "audit">,
    completed?: boolean,
  ) => Promise<void>;
  saveMasterBL: (
    shipmentId: string,
    data: Omit<MasterBL, "id" | "shipmentId" | "status" | "audit">,
    completed?: boolean,
  ) => Promise<void>;
  saveArrivalNotice: (shipmentId: string, data: Omit<ArrivalNotice, "id" | "shipmentId" | "status" | "audit">) => void;
  saveDeliveryOrder: (shipmentId: string, data: Omit<DeliveryOrder, "id" | "shipmentId" | "status" | "audit">) => void;
  saveClearingInvoice: (
    shipmentId: string,
    data: Omit<ImportClearingInvoice, "id" | "shipmentId" | "status" | "audit">,
  ) => Promise<void>;
  savePaymentReceipt: (
    shipmentId: string,
    data: Omit<ImportPaymentReceipt, "id" | "shipmentId" | "status" | "audit">,
  ) => Promise<void>;
  saveDetentionInvoice: (
    shipmentId: string,
    data: Omit<DetentionInvoice, "id" | "shipmentId" | "status" | "audit" | "chargeableDays" | "detentionAmount" | "refundAmount" | "renderData">,
  ) => Promise<void>;

  updateDocumentStatus: (
    shipmentId: string,
    docType: "draftBL" | "houseBL" | "masterBL" | "arrivalNotice" | "deliveryOrder" | "clearingInvoice" | "paymentReceipt" | "detentionInvoice",
    status: DocumentStatus,
  ) => void;

  uploadPdf: (shipmentId: string, docType: ImportDocKey, file: File) => Promise<PdfAttachment>;
  attachPdf: (shipmentId: string, docType: ImportDocKey, pdf: PdfAttachment) => void;

  getShipment: (id: string) => ImportShipment | undefined;
};

function replaceShipment(shipments: ImportShipment[], shipment: ImportShipment) {
  const exists = shipments.some((item) => item.id === shipment.id);
  return exists ? shipments.map((item) => (item.id === shipment.id ? shipment : item)) : [shipment, ...shipments];
}

function computeStage(s: ImportShipment): ImportShipment["currentStage"] {
  if (s.detentionInvoice) return "Detention Invoice";
  if (s.paymentReceipt) return "Payment Receipt";
  if (s.clearingInvoice) return "Freight Invoice";
  if (s.masterBL) return "MBL Created";
  if (s.houseBL) return "HBL Created";
  if (s.draftBL) return "Draft BL";
  return "Created";
}

export const useImportStore = create<ImportStore>((set, get) => ({
  shipments: [],
  isLoading: false,
  error: null,

  loadShipments: async () => {
    set({ isLoading: true, error: null });
    try {
      const shipments = await listImportRecords();
      set({ shipments, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to load import shipments", isLoading: false });
    }
  },

  createShipment: async (data) => {
    const shipment = await createImportRecord(data);
    set((state) => ({ shipments: [shipment, ...state.shipments] }));
    return shipment;
  },

  deleteShipment: (id) => {
    set((state) => ({ shipments: state.shipments.filter((shipment) => shipment.id !== id) }));
  },

  saveDraftBL: async (shipmentId, data, completed = false) => {
    const shipment = await saveImportForm(shipmentId, "draft_bl", data as Record<string, unknown>, completed);
    set((state) => ({ shipments: replaceShipment(state.shipments, shipment) }));
  },

  saveHouseBL: async (shipmentId, data, completed = false) => {
    const shipment = await saveImportForm(shipmentId, "house_bl", data as Record<string, unknown>, completed);
    set((state) => ({ shipments: replaceShipment(state.shipments, shipment) }));
  },

  saveMasterBL: async (shipmentId, data, completed = false) => {
    const shipment = await saveImportForm(shipmentId, "master_bl", data as Record<string, unknown>, completed);
    set((state) => ({ shipments: replaceShipment(state.shipments, shipment) }));
  },

  saveArrivalNotice: (shipmentId, data) => {
    set((state) => ({
      shipments: state.shipments.map((shipment) => {
        if (shipment.id !== shipmentId) return shipment;
        const existing = shipment.arrivalNotice;
        const updated = {
          ...shipment,
          arrivalNotice: {
            ...data,
            id: existing?.id ?? `AN-${Date.now()}`,
            shipmentId,
            status: existing?.status ?? "draft",
            audit: existing ? { ...existing.audit, modifiedBy: currentUser, modifiedDate: now() } : makeAudit(),
          },
        };
        return { ...updated, currentStage: computeStage(updated) };
      }),
    }));
  },

  saveDeliveryOrder: (shipmentId, data) => {
    set((state) => ({
      shipments: state.shipments.map((shipment) => {
        if (shipment.id !== shipmentId) return shipment;
        const existing = shipment.deliveryOrder;
        const updated = {
          ...shipment,
          deliveryOrder: {
            ...data,
            id: existing?.id ?? `DO-${Date.now()}`,
            shipmentId,
            status: existing?.status ?? "draft",
            audit: existing ? { ...existing.audit, modifiedBy: currentUser, modifiedDate: now() } : makeAudit(),
          },
        };
        return { ...updated, currentStage: computeStage(updated) };
      }),
    }));
  },

  saveClearingInvoice: async (shipmentId, data) => {
    const shipment = await saveFreightInvoice(shipmentId, {
      ...data,
      id: `INV-${Date.now()}`,
      shipmentId,
      status: "draft",
      audit: makeAudit(),
    });
    set((state) => ({ shipments: replaceShipment(state.shipments, shipment) }));
  },

  savePaymentReceipt: async (shipmentId, data) => {
    const shipment = await createPaymentReceiptApi(shipmentId, {
      ...data,
      id: `RCP-${Date.now()}`,
      shipmentId,
      status: "draft",
      audit: makeAudit(),
    });
    set((state) => ({ shipments: replaceShipment(state.shipments, shipment) }));
  },

  saveDetentionInvoice: async (shipmentId, data) => {
    const shipment = await saveDetentionInvoiceApi(shipmentId, {
      ...data,
      id: `DET-${Date.now()}`,
      shipmentId,
      status: "draft",
      audit: makeAudit(),
      chargeableDays: 0,
      detentionAmount: 0,
      refundAmount: 0,
    });
    set((state) => ({ shipments: replaceShipment(state.shipments, shipment) }));
  },

  updateDocumentStatus: (shipmentId, docType, status) => {
    set((state) => ({
      shipments: state.shipments.map((shipment) => {
        if (shipment.id !== shipmentId) return shipment;
        const doc = shipment[docType];
        if (!doc) return shipment;
        const updatedDoc = {
          ...doc,
          status,
          audit: {
            ...doc.audit,
            modifiedBy: currentUser,
            modifiedDate: now(),
            ...(status === "approved" ? { approvedBy: currentUser, approvedDate: now() } : {}),
          },
        };
        const updated = { ...shipment, [docType]: updatedDoc };
        const allDocs = [
          updated.draftBL,
          updated.houseBL,
          updated.masterBL,
          updated.clearingInvoice,
          updated.paymentReceipt,
          updated.detentionInvoice,
        ];
        return {
          ...updated,
          status: allDocs.every((item) => item && item.status === "approved") ? "completed" : updated.status,
          currentStage: allDocs.every((item) => item && item.status === "approved") ? "Completed" : computeStage(updated),
        };
      }),
    }));
  },

  uploadPdf: async (shipmentId, docType, file) => {
    const pdf = await uploadImportPdf(shipmentId, docType, file);
    get().attachPdf(shipmentId, docType, pdf);
    return pdf;
  },

  attachPdf: (shipmentId, docType, pdf) => {
    set((state) => ({
      shipments: state.shipments.map((shipment) => {
        if (shipment.id !== shipmentId) return shipment;
        const doc = shipment[docType];
        if (!doc) return shipment;
        return { ...shipment, [docType]: { ...doc, pdf } };
      }),
    }));
  },

  getShipment: (id) => get().shipments.find((shipment) => shipment.id === id),
}));