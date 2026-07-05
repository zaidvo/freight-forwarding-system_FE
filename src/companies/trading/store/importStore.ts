// src/companies/trading/store/importStore.ts
//
// Zustand store for the Trading Import Module.
// Manages the entire import shipment lifecycle with 6 document types.
// Currently uses in-memory state. Ready for backend integration.

import { create } from "zustand";
import type {
  ImportShipment,
  DraftBL,
  HouseBL,
  MasterBL,
  ArrivalNotice,
  DeliveryOrder,
  ImportClearingInvoice,
  ContainerRow,
  ChargeLine,
  DocumentStatus,
  ShipmentStage,
  PdfAttachment,
} from "../types/importTypes";

// ─── Helpers ─────────────────────────────────────────────────────

const now = () => new Date().toISOString();
const currentUser = "Current User";

function makeAudit() {
  return { createdBy: currentUser, createdDate: now() };
}

let shipmentCounter = 0;
let draftBlCounter = 0;
let hblCounter = 0;
let mblCounter = 0;
let anCounter = 0;
let doCounter = 0;
let invCounter = 0;
let containerCounter = 0;
let chargeCounter = 0;

function genId(prefix: string, counter: { value: number }): string {
  counter.value += 1;
  return `${prefix}-${String(counter.value).padStart(5, "0")}`;
}

const shipmentId = { value: shipmentCounter };
const draftBlId = { value: draftBlCounter };
const hblId = { value: hblCounter };
const mblId = { value: mblCounter };
const anId = { value: anCounter };
const doId = { value: doCounter };
const invId = { value: invCounter };

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

// Number to words (simplified)
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
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
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
    const g = groups[i];
    if (g === 0) continue;
    const h = Math.floor(g / 100);
    const t = g % 100;
    let s = "";
    if (h > 0) s += ones[h] + " Hundred";
    if (t > 0) {
      if (h > 0) s += " and ";
      if (t < 20) {
        s += ones[t];
      } else {
        s += tens[Math.floor(t / 10)];
        if (t % 10 > 0) s += "-" + ones[t % 10];
      }
    }
    if (scales[i]) s += " " + scales[i];
    parts.push(s);
  }

  const dec = Math.round((Math.abs(n) - intPart) * 100);
  let result = parts.join(", ");
  if (dec > 0) {
    result += ` and ${dec}/100`;
  }
  return result + " Only";
}

// ─── Seed Data ───────────────────────────────────────────────────

const SEED_SHIPMENTS: ImportShipment[] = [
  {
    id: "imp-seed-1",
    referenceNo: "IMP-00001",
    createdDate: "2026-07-01T10:00:00Z",
    expectedArrivalDate: "2026-07-20",
    customer: "ABC Traders",
    salesperson: "Ali Hassan",
    company: "Global Imports Ltd",
    remarks: "Bulk rice shipment from Thailand",
    status: "in_progress",
    currentStage: "HBL Created",
    draftBL: {
      id: "dbl-seed-1",
      shipmentId: "imp-seed-1",
      status: "approved",
      audit: {
        createdBy: "Ali Hassan",
        createdDate: "2026-07-01T11:00:00Z",
        approvedBy: "Manager",
        approvedDate: "2026-07-01T14:00:00Z",
      },
      draftBlNo: "DBL-00001",
      bookingNo: "BKG-2026-001",
      vessel: "EVER GIVEN",
      voyage: "V.024E",
      pol: "Bangkok, Thailand",
      pod: "Karachi, Pakistan",
      placeOfDelivery: "Karachi Port",
      shipper: "Thai Rice Export Co.",
      consignee: "ABC Traders",
      notifyParty: "ABC Traders - Karachi Office",
      cargoDescription: "White Rice Premium Grade",
      hsCode: "1006.30",
      packages: 500,
      grossWeight: 25000,
      netWeight: 24500,
      cbm: 45,
      containers: [
        {
          id: "cnt-s1",
          containerNo: "MSCU1234567",
          size: "40'",
          sealNo: "SL-001",
          packages: 250,
          grossWeight: 12500,
          netWeight: 12250,
          cbm: 22.5,
        },
        {
          id: "cnt-s2",
          containerNo: "MSCU7654321",
          size: "40'",
          sealNo: "SL-002",
          packages: 250,
          grossWeight: 12500,
          netWeight: 12250,
          cbm: 22.5,
        },
      ],
      freightTerms: "Prepaid",
      draftDate: "2026-07-01",
      onBoardDate: "2026-07-05",
    },
    houseBL: {
      id: "hbl-seed-1",
      shipmentId: "imp-seed-1",
      status: "approved",
      audit: {
        createdBy: "Ali Hassan",
        createdDate: "2026-07-02T09:00:00Z",
        approvedBy: "Manager",
        approvedDate: "2026-07-02T12:00:00Z",
      },
      hblNumber: "HBL-00001",
      bookingNumber: "BKG-2026-001",
      serviceContract: "SC-2026-TH-PK",
      placeOfReceipt: "Bangkok Warehouse",
      pol: "Bangkok, Thailand",
      pod: "Karachi, Pakistan",
      placeOfDelivery: "Karachi Port",
      vessel: "EVER GIVEN",
      voyage: "V.024E",
      shipper: "Thai Rice Export Co.",
      consignee: "ABC Traders",
      notifyParty: "ABC Traders - Karachi Office",
      deliveryAgent: "Karachi Clearing Services",
      marksAndNumbers: "ABC-TH-2026",
      cargoDescription: "White Rice Premium Grade",
      containers: [
        {
          id: "cnt-s1",
          containerNo: "MSCU1234567",
          size: "40'",
          sealNo: "SL-001",
          packages: 250,
          grossWeight: 12500,
          netWeight: 12250,
          cbm: 22.5,
        },
        {
          id: "cnt-s2",
          containerNo: "MSCU7654321",
          size: "40'",
          sealNo: "SL-002",
          packages: 250,
          grossWeight: 12500,
          netWeight: 12250,
          cbm: 22.5,
        },
      ],
      packages: 500,
      grossWeight: 25000,
      netWeight: 24500,
      cbm: 45,
      freightTerms: "Prepaid",
      placeOfIssue: "Bangkok",
      issueDate: "2026-07-02",
      onBoardDate: "2026-07-05",
    },
    masterBL: null,
    arrivalNotice: null,
    deliveryOrder: null,
    clearingInvoice: null,
  },
  {
    id: "imp-seed-2",
    referenceNo: "IMP-00002",
    createdDate: "2026-07-03T08:00:00Z",
    expectedArrivalDate: "2026-07-25",
    customer: "XYZ Industries",
    salesperson: "Sara Khan",
    company: "Global Imports Ltd",
    remarks: "Machinery parts from China",
    status: "new",
    currentStage: "Created",
    draftBL: null,
    houseBL: null,
    masterBL: null,
    arrivalNotice: null,
    deliveryOrder: null,
    clearingInvoice: null,
  },
];

// ─── Store ───────────────────────────────────────────────────────

type ImportStore = {
  shipments: ImportShipment[];

  // Shipment CRUD
  createShipment: (data: {
    customer: string;
    salesperson: string;
    company: string;
    expectedArrivalDate: string;
    remarks: string;
  }) => ImportShipment;

  deleteShipment: (id: string) => void;

  // Document operations
  saveDraftBL: (shipmentId: string, data: Omit<DraftBL, "id" | "shipmentId" | "status" | "audit">) => void;
  saveHouseBL: (shipmentId: string, data: Omit<HouseBL, "id" | "shipmentId" | "status" | "audit">) => void;
  saveMasterBL: (shipmentId: string, data: Omit<MasterBL, "id" | "shipmentId" | "status" | "audit">) => void;
  saveArrivalNotice: (shipmentId: string, data: Omit<ArrivalNotice, "id" | "shipmentId" | "status" | "audit">) => void;
  saveDeliveryOrder: (shipmentId: string, data: Omit<DeliveryOrder, "id" | "shipmentId" | "status" | "audit">) => void;
  saveClearingInvoice: (shipmentId: string, data: Omit<ImportClearingInvoice, "id" | "shipmentId" | "status" | "audit">) => void;

  // Status management
  updateDocumentStatus: (
    shipmentId: string,
    docType: "draftBL" | "houseBL" | "masterBL" | "arrivalNotice" | "deliveryOrder" | "clearingInvoice",
    status: DocumentStatus
  ) => void;

  // PDF
  attachPdf: (
    shipmentId: string,
    docType: "draftBL" | "houseBL" | "masterBL",
    pdf: PdfAttachment
  ) => void;

  // Lookup helpers
  getShipment: (id: string) => ImportShipment | undefined;
};

function computeStage(s: ImportShipment): ShipmentStage {
  if (s.clearingInvoice) return "Invoice Generated";
  if (s.deliveryOrder) return "Delivery Order";
  if (s.arrivalNotice) return "Arrival Notice";
  if (s.masterBL) return "MBL Created";
  if (s.houseBL) return "HBL Created";
  if (s.draftBL) return "Draft BL";
  return "Created";
}

// Initialize counters from seed
shipmentId.value = 2;
draftBlId.value = 1;
hblId.value = 1;

export const useImportStore = create<ImportStore>((set, get) => ({
  shipments: SEED_SHIPMENTS,

  // ── Create Shipment ────────────────────────────────────────────
  createShipment: (data) => {
    const shipment: ImportShipment = {
      id: `imp-${Date.now()}`,
      referenceNo: genId("IMP", shipmentId),
      createdDate: now(),
      expectedArrivalDate: data.expectedArrivalDate,
      customer: data.customer,
      salesperson: data.salesperson,
      company: data.company,
      remarks: data.remarks,
      status: "new",
      currentStage: "Created",
      draftBL: null,
      houseBL: null,
      masterBL: null,
      arrivalNotice: null,
      deliveryOrder: null,
      clearingInvoice: null,
    };
    set((s) => ({ shipments: [shipment, ...s.shipments] }));
    return shipment;
  },

  deleteShipment: (id) => {
    set((s) => ({ shipments: s.shipments.filter((sh) => sh.id !== id) }));
  },

  // ── Save Draft BL ──────────────────────────────────────────────
  saveDraftBL: (shipmentId, data) => {
    set((s) => ({
      shipments: s.shipments.map((sh) => {
        if (sh.id !== shipmentId) return sh;
        const existing = sh.draftBL;
        const doc: DraftBL = {
          ...data,
          id: existing?.id ?? genId("DBL", draftBlId),
          shipmentId,
          status: existing?.status ?? "draft",
          audit: existing
            ? { ...existing.audit, modifiedBy: currentUser, modifiedDate: now() }
            : makeAudit(),
        };
        const updated = { ...sh, draftBL: doc, status: "in_progress" as const };
        updated.currentStage = computeStage(updated);
        return updated;
      }),
    }));
  },

  // ── Save House BL (auto-fill from Draft BL) ────────────────────
  saveHouseBL: (shipmentId, data) => {
    set((s) => ({
      shipments: s.shipments.map((sh) => {
        if (sh.id !== shipmentId) return sh;
        const existing = sh.houseBL;
        const doc: HouseBL = {
          ...data,
          id: existing?.id ?? genId("HBL", hblId),
          shipmentId,
          status: existing?.status ?? "draft",
          audit: existing
            ? { ...existing.audit, modifiedBy: currentUser, modifiedDate: now() }
            : makeAudit(),
        };
        const updated = { ...sh, houseBL: doc };
        updated.currentStage = computeStage(updated);
        return updated;
      }),
    }));
  },

  // ── Save Master BL (auto-fill from House BL) ───────────────────
  saveMasterBL: (shipmentId, data) => {
    set((s) => ({
      shipments: s.shipments.map((sh) => {
        if (sh.id !== shipmentId) return sh;
        const existing = sh.masterBL;
        const doc: MasterBL = {
          ...data,
          id: existing?.id ?? genId("MBL", mblId),
          shipmentId,
          status: existing?.status ?? "draft",
          audit: existing
            ? { ...existing.audit, modifiedBy: currentUser, modifiedDate: now() }
            : makeAudit(),
        };
        const updated = { ...sh, masterBL: doc };
        updated.currentStage = computeStage(updated);
        return updated;
      }),
    }));
  },

  // ── Save Arrival Notice ────────────────────────────────────────
  saveArrivalNotice: (shipmentId, data) => {
    set((s) => ({
      shipments: s.shipments.map((sh) => {
        if (sh.id !== shipmentId) return sh;
        const existing = sh.arrivalNotice;
        const doc: ArrivalNotice = {
          ...data,
          id: existing?.id ?? genId("AN", anId),
          shipmentId,
          status: existing?.status ?? "draft",
          audit: existing
            ? { ...existing.audit, modifiedBy: currentUser, modifiedDate: now() }
            : makeAudit(),
        };
        const updated = { ...sh, arrivalNotice: doc };
        updated.currentStage = computeStage(updated);
        return updated;
      }),
    }));
  },

  // ── Save Delivery Order ────────────────────────────────────────
  saveDeliveryOrder: (shipmentId, data) => {
    set((s) => ({
      shipments: s.shipments.map((sh) => {
        if (sh.id !== shipmentId) return sh;
        const existing = sh.deliveryOrder;
        const doc: DeliveryOrder = {
          ...data,
          id: existing?.id ?? genId("DO", doId),
          shipmentId,
          status: existing?.status ?? "draft",
          audit: existing
            ? { ...existing.audit, modifiedBy: currentUser, modifiedDate: now() }
            : makeAudit(),
        };
        const updated = { ...sh, deliveryOrder: doc };
        updated.currentStage = computeStage(updated);
        return updated;
      }),
    }));
  },

  // ── Save Clearing Invoice ──────────────────────────────────────
  saveClearingInvoice: (shipmentId, data) => {
    set((s) => ({
      shipments: s.shipments.map((sh) => {
        if (sh.id !== shipmentId) return sh;
        const existing = sh.clearingInvoice;
        const doc: ImportClearingInvoice = {
          ...data,
          id: existing?.id ?? genId("INV", invId),
          shipmentId,
          status: existing?.status ?? "draft",
          audit: existing
            ? { ...existing.audit, modifiedBy: currentUser, modifiedDate: now() }
            : makeAudit(),
        };
        const updated = { ...sh, clearingInvoice: doc };
        updated.currentStage = computeStage(updated);
        return updated;
      }),
    }));
  },

  // ── Status management ──────────────────────────────────────────
  updateDocumentStatus: (shipmentId, docType, status) => {
    set((s) => ({
      shipments: s.shipments.map((sh) => {
        if (sh.id !== shipmentId) return sh;
        const doc = sh[docType];
        if (!doc) return sh;
        const updatedDoc = {
          ...doc,
          status,
          audit: {
            ...doc.audit,
            modifiedBy: currentUser,
            modifiedDate: now(),
            ...(status === "approved"
              ? { approvedBy: currentUser, approvedDate: now() }
              : {}),
          },
        };
        const updated = { ...sh, [docType]: updatedDoc };

        // If all 6 docs are approved, mark shipment as completed
        const allDocs = [
          updated.draftBL,
          updated.houseBL,
          updated.masterBL,
          updated.arrivalNotice,
          updated.deliveryOrder,
          updated.clearingInvoice,
        ];
        if (allDocs.every((d) => d && d.status === "approved")) {
          updated.status = "completed";
          updated.currentStage = "Completed";
        } else {
          updated.currentStage = computeStage(updated);
        }

        return updated;
      }),
    }));
  },

  // ── PDF attachment ─────────────────────────────────────────────
  attachPdf: (shipmentId, docType, pdf) => {
    set((s) => ({
      shipments: s.shipments.map((sh) => {
        if (sh.id !== shipmentId) return sh;
        const doc = sh[docType];
        if (!doc) return sh;
        return { ...sh, [docType]: { ...doc, pdf } };
      }),
    }));
  },

  // ── Lookup ─────────────────────────────────────────────────────
  getShipment: (id) => get().shipments.find((s) => s.id === id),
}));
