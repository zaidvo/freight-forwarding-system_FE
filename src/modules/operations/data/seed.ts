// src/modules/operations/data/seed.ts
import type { PackingListForm, BillOfLadingForm } from "../types";

export const EMPTY_PACKING_LIST: PackingListForm = {
  plNumber: `PL-${new Date().getFullYear()}-001`,
  date: new Date().toISOString().split("T")[0],
  shipperName: "",
  shipperAddress: "",
  consigneeName: "",
  consigneeAddress: "",
  vesselFlight: "",
  portOfLoading: "Karachi, Pakistan",
  portOfDischarge: "",
  finalDestination: "",
  hsCode: "",
  marksNumbers: "",
  packages: [
    {
      id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      description: "",
      quantity: "1",
      grossWeight: "",
      netWeight: "",
      length: "",
      width: "",
      height: "",
      unit: "cm",
    },
  ],
  notes: "",
};

export const EMPTY_BILL_OF_LADING: BillOfLadingForm = {
  blNumber: `BL-${new Date().getFullYear()}-001`,
  date: new Date().toISOString().split("T")[0],
  bookingRef: "",
  shipperName: "",
  shipperAddress: "",
  consigneeName: "",
  consigneeAddress: "",
  notifyPartyName: "",
  notifyPartyAddress: "",
  vesselName: "",
  voyageNo: "",
  flag: "Pakistan",
  portOfLoading: "Karachi, Pakistan",
  portOfDischarge: "",
  placeOfReceipt: "",
  placeOfDelivery: "",
  containerNo: "",
  sealNo: "",
  containerType: "20' GP",
  marksNumbers: "",
  description: "",
  hsCode: "",
  grossWeight: "",
  measurement: "",
  noOfPackages: "",
  freightTerms: "prepaid",
  freightAmount: "",
  remarks: "",
};

export const CONTAINER_TYPES = [
  "20' GP",
  "40' GP",
  "40' HC",
  "20' Reefer",
  "40' Reefer",
  "20' OT",
  "40' OT",
  "20' FR",
  "40' FR",
];

export const PAKISTAN_PORTS = [
  "Karachi, Pakistan",
  "Port Qasim, Pakistan",
  "Gwadar, Pakistan",
  "Lahore (KILA), Pakistan",
];
