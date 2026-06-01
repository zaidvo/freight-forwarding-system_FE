// src/modules/sales/types.ts

export type ProformaLineItem = {
  id: string;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
};

export type ProformaInvoiceForm = {
  piNumber: string;
  date: string;
  validUntil: string;
  sellerName: string;
  sellerAddress: string;
  sellerContact: string;
  buyerName: string;
  buyerAddress: string;
  buyerContact: string;
  portOfLoading: string;
  portOfDischarge: string;
  incoterms: string;
  paymentTerms: string;
  currency: "USD" | "PKR" | "EUR" | "GBP";
  items: ProformaLineItem[];
  freightCharges: string;
  insuranceCharges: string;
  otherCharges: string;
  bankDetails: string;
  notes: string;
};
