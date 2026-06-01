// src/modules/operations/types.ts

export type PackageRow = {
  id: string;
  description: string;
  quantity: string;
  grossWeight: string;
  netWeight: string;
  length: string;
  width: string;
  height: string;
  unit: "cm" | "in";
};

export type PackingListForm = {
  plNumber: string;
  date: string;
  shipperName: string;
  shipperAddress: string;
  consigneeName: string;
  consigneeAddress: string;
  vesselFlight: string;
  portOfLoading: string;
  portOfDischarge: string;
  finalDestination: string;
  hsCode: string;
  marksNumbers: string;
  packages: PackageRow[];
  notes: string;
};

export type BillOfLadingForm = {
  blNumber: string;
  date: string;
  bookingRef: string;
  shipperName: string;
  shipperAddress: string;
  consigneeName: string;
  consigneeAddress: string;
  notifyPartyName: string;
  notifyPartyAddress: string;
  vesselName: string;
  voyageNo: string;
  flag: string;
  portOfLoading: string;
  portOfDischarge: string;
  placeOfReceipt: string;
  placeOfDelivery: string;
  containerNo: string;
  sealNo: string;
  containerType: string;
  marksNumbers: string;
  description: string;
  hsCode: string;
  grossWeight: string;
  measurement: string;
  noOfPackages: string;
  freightTerms: "prepaid" | "collect";
  freightAmount: string;
  remarks: string;
};
