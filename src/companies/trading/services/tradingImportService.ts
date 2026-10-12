import { apiBlobRequest, apiRequest, apiUploadRequest } from "@/shared/services/api";
import type {
  ChargeLine,
  ContainerRow,
  DetentionInvoice,
  DraftBL,
  HouseBL,
  ImportClearingInvoice,
  ImportPaymentReceipt,
  ImportShipment,
  MasterBL,
  PdfAttachment,
} from "../types/importTypes";

export type TradingDocumentType = "draft_bl" | "house_bl" | "master_bl";
export type ImportDocKey = "draftBL" | "houseBL" | "masterBL";

type BackendRecordStatus =
  | "draft"
  | "in_progress"
  | "ready_for_invoice"
  | "invoiced"
  | "paid"
  | "detention";

type BackendDocument = {
  id: number;
  record_id: number;
  document_type: TradingDocumentType;
  original_filename: string;
  stored_filename: string;
  storage_path: string;
  content_type: string | null;
  file_size: number;
  uploaded_by: number | null;
  uploaded_at: string;
  created_at: string;
};

type BackendForm = {
  id: number;
  record_id: number;
  document_type: TradingDocumentType;
  data: Record<string, unknown>;
  canonical_data: Record<string, unknown>;
  completed_by: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type BackendFreightInvoice = {
  id: number;
  record_id: number;
  invoice_no: string | null;
  charges: Array<Record<string, unknown>>;
  manual_fields: Record<string, unknown>;
  render_data: Record<string, unknown>;
  created_by: number | null;
  created_at: string;
  updated_at: string;
};

type BackendPaymentReceipt = {
  id: number;
  record_id: number;
  receipt_no: string | null;
  tid: string;
  amount: number | string;
  currency: string;
  payment_date: string | null;
  render_data: Record<string, unknown>;
  created_by: number | null;
  created_at: string;
};

type BackendDetentionInvoice = {
  id: number;
  record_id: number;
  invoice_no: string | null;
  detention_start: string;
  detention_end: string;
  free_days: number;
  chargeable_days: number;
  per_day_amount: number | string;
  detention_amount: number | string;
  security_deposit: number | string;
  refund_amount: number | string;
  currency: string;
  manual_fields: Record<string, unknown>;
  render_data: Record<string, unknown>;
  created_by: number | null;
  created_at: string;
  updated_at: string;
};

export type BackendImportRecord = {
  id: number;
  reference_no: string | null;
  title: string | null;
  customer: string | null;
  salesperson: string | null;
  company: string | null;
  expected_arrival_date: string | null;
  remarks: string | null;
  status: BackendRecordStatus;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  documents: BackendDocument[];
  forms: BackendForm[];
  freight_invoice?: BackendFreightInvoice | null;
  payment_receipts?: BackendPaymentReceipt[];
  detention_invoice?: BackendDetentionInvoice | null;
};

type CreateRecordPayload = {
  customer: string;
  salesperson: string;
  company: string;
  expectedArrivalDate: string;
  remarks: string;
};

const DOC_KEY_TO_TYPE: Record<ImportDocKey, TradingDocumentType> = {
  draftBL: "draft_bl",
  houseBL: "house_bl",
  masterBL: "master_bl",
};

const TYPE_TO_DOC_KEY: Record<TradingDocumentType, ImportDocKey> = {
  draft_bl: "draftBL",
  house_bl: "houseBL",
  master_bl: "masterBL",
};

export async function listImportRecords(): Promise<ImportShipment[]> {
  const records = await apiRequest<BackendImportRecord[]>("/trading-import/sales/records");
  return records.map(mapRecordToShipment);
}

export async function createImportRecord(payload: CreateRecordPayload): Promise<ImportShipment> {
  const record = await apiRequest<BackendImportRecord>("/trading-import/sales/records", {
    method: "POST",
    body: JSON.stringify({
      customer: payload.customer,
      title: payload.customer,
      salesperson: payload.salesperson,
      company: payload.company,
      expected_arrival_date: payload.expectedArrivalDate || null,
      remarks: payload.remarks,
    }),
  });
  return mapRecordToShipment(record);
}

export async function getImportRecord(recordId: string): Promise<ImportShipment> {
  const record = await apiRequest<BackendImportRecord>(`/trading-import/sales/records/${recordId}`);
  return mapRecordToShipment(record);
}

export async function saveImportForm(
  recordId: string,
  documentType: TradingDocumentType,
  data: Record<string, unknown>,
  completed: boolean,
): Promise<ImportShipment> {
  await apiRequest<BackendForm>(`/trading-import/sales/records/${recordId}/forms/${documentType}`, {
    method: "PUT",
    body: JSON.stringify({ data, completed }),
  });
  return getImportRecord(recordId);
}

export async function saveFreightInvoice(recordId: string, invoice: ImportClearingInvoice): Promise<ImportShipment> {
  await apiRequest<BackendFreightInvoice>(`/trading-import/sales/records/${recordId}/freight-invoice`, {
    method: "PUT",
    body: JSON.stringify({
      invoice_no: invoice.invoiceNumber || null,
      charges: invoice.charges.map((charge) => ({
        code: toChargeCode(charge.chargeName),
        label: charge.chargeName,
        amount: charge.amount || charge.rate * charge.quantity || 0,
        currency: "PKR",
        notes: `Rate: ${charge.rate}; Quantity: ${charge.quantity}`,
      })),
      manual_fields: {
        invoice_no: invoice.invoiceNumber,
        invoice_date: invoice.invoiceDate,
        customer: invoice.customer,
        ntn_no: invoice.ntn,
        clearing_agent: invoice.clearingAgent,
        al_bashar_chal: invoice.clearingAgent,
        exchange_rate: invoice.exchangeRate,
        subtotal: invoice.subtotal,
        total_amount: invoice.totalAmount,
        grand_total: invoice.grandTotal,
        amount_in_words: invoice.amountInWords,
      },
    }),
  });
  return getImportRecord(recordId);
}

export async function createPaymentReceipt(recordId: string, receipt: ImportPaymentReceipt): Promise<ImportShipment> {
  await apiRequest<BackendPaymentReceipt>(`/trading-import/sales/records/${recordId}/payment-receipts`, {
    method: "POST",
    body: JSON.stringify({
      receipt_no: receipt.receiptNo || null,
      tid: receipt.tid,
      amount: receipt.amount,
      currency: receipt.currency || "PKR",
      payment_date: receipt.paymentDate || null,
    }),
  });
  return getImportRecord(recordId);
}

export async function saveDetentionInvoice(recordId: string, invoice: DetentionInvoice): Promise<ImportShipment> {
  await apiRequest<BackendDetentionInvoice>(`/trading-import/sales/records/${recordId}/detention-invoice`, {
    method: "PUT",
    body: JSON.stringify({
      invoice_no: invoice.invoiceNo || null,
      detention_start: invoice.detentionStart,
      detention_end: invoice.detentionEnd,
      free_days: invoice.freeDays,
      per_day_amount: invoice.perDayAmount,
      security_deposit: invoice.securityDeposit,
      currency: invoice.currency || "PKR",
      manual_fields: invoice.manualFields ?? {},
    }),
  });
  return getImportRecord(recordId);
}

export async function uploadImportPdf(
  recordId: string,
  docKey: ImportDocKey,
  file: File,
): Promise<PdfAttachment> {
  const formData = new FormData();
  formData.append("file", file);
  const document = await apiUploadRequest<BackendDocument>(
    `/trading-import/sales/records/${recordId}/documents/${DOC_KEY_TO_TYPE[docKey]}/upload`,
    formData,
  );
  return mapDocumentToPdf(document);
}

export async function downloadImportPdf(recordId: string, docKey: ImportDocKey): Promise<Blob> {
  return apiBlobRequest(
    `/trading-import/sales/records/${recordId}/documents/${DOC_KEY_TO_TYPE[docKey]}/download`,
  );
}

export function mapRecordToShipment(record: BackendImportRecord): ImportShipment {
  const forms = Object.fromEntries(record.forms.map((form) => [form.document_type, form]));
  const documents = Object.fromEntries(record.documents.map((document) => [document.document_type, document]));

  const draftBL = mapDraftBL(record, forms.draft_bl, documents.draft_bl);
  const houseBL = mapHouseBL(record, forms.house_bl, documents.house_bl);
  const masterBL = mapMasterBL(record, forms.master_bl, documents.master_bl);
  const clearingInvoice = mapFreightInvoice(record, record.freight_invoice ?? null, houseBL, masterBL);
  const paymentReceipt = mapPaymentReceipt(record, record.payment_receipts?.at(-1) ?? null);
  const detentionInvoice = mapDetentionInvoice(record, record.detention_invoice ?? null);

  return {
    id: String(record.id),
    referenceNo: record.reference_no ?? `IMP-${String(record.id).padStart(5, "0")}`,
    createdDate: record.created_at,
    expectedArrivalDate: record.expected_arrival_date ?? "",
    customer: record.customer ?? record.title ?? "",
    salesperson: record.salesperson ?? "",
    company: record.company ?? "",
    remarks: record.remarks ?? "",
    status: mapRecordStatus(record.status),
    currentStage: computeStage(Boolean(draftBL), Boolean(houseBL), Boolean(masterBL), record),
    draftBL,
    houseBL,
    masterBL,
    arrivalNotice: null,
    deliveryOrder: null,
    clearingInvoice,
    paymentReceipt,
    detentionInvoice,
  };
}

function mapDraftBL(record: BackendImportRecord, form?: BackendForm, document?: BackendDocument): DraftBL | null {
  if (!form && !document) return null;
  const data = (form?.data ?? {}) as Partial<DraftBL>;
  return {
    id: form ? String(form.id) : `${record.id}-draft-bl`,
    shipmentId: String(record.id),
    status: form?.completed_at ? "pending_approval" : document ? "received" : "draft",
    audit: { createdBy: userDisplayName(), createdDate: form?.created_at ?? document?.created_at ?? record.created_at, modifiedDate: form?.updated_at },
    draftBlNo: data.draftBlNo ?? "",
    bookingNo: data.bookingNo ?? "",
    vessel: data.vessel ?? "",
    voyage: data.voyage ?? "",
    pol: data.pol ?? "",
    pod: data.pod ?? "",
    placeOfDelivery: data.placeOfDelivery ?? "",
    shipper: data.shipper ?? "",
    consignee: data.consignee ?? record.customer ?? "",
    notifyParty: data.notifyParty ?? "",
    cargoDescription: data.cargoDescription ?? "",
    hsCode: data.hsCode ?? "",
    packages: Number(data.packages ?? 0),
    grossWeight: Number(data.grossWeight ?? 0),
    netWeight: Number(data.netWeight ?? 0),
    cbm: Number(data.cbm ?? 0),
    containers: mapContainers(data.containers),
    freightTerms: data.freightTerms ?? "Prepaid",
    draftDate: data.draftDate ?? "",
    onBoardDate: data.onBoardDate ?? "",
    pdf: document ? mapDocumentToPdf(document) : data.pdf,
  };
}

function mapHouseBL(record: BackendImportRecord, form?: BackendForm, document?: BackendDocument): HouseBL | null {
  if (!form && !document) return null;
  const data = (form?.data ?? {}) as Partial<HouseBL>;
  return {
    id: form ? String(form.id) : `${record.id}-house-bl`,
    shipmentId: String(record.id),
    status: form?.completed_at ? "pending_approval" : document ? "received" : "draft",
    audit: { createdBy: userDisplayName(), createdDate: form?.created_at ?? document?.created_at ?? record.created_at, modifiedDate: form?.updated_at },
    hblNumber: data.hblNumber ?? "",
    bookingNumber: data.bookingNumber ?? "",
    serviceContract: data.serviceContract ?? "",
    placeOfReceipt: data.placeOfReceipt ?? "",
    pol: data.pol ?? "",
    pod: data.pod ?? "",
    placeOfDelivery: data.placeOfDelivery ?? "",
    vessel: data.vessel ?? "",
    voyage: data.voyage ?? "",
    shipper: data.shipper ?? "",
    consignee: data.consignee ?? record.customer ?? "",
    notifyParty: data.notifyParty ?? "",
    deliveryAgent: data.deliveryAgent ?? "",
    marksAndNumbers: data.marksAndNumbers ?? "",
    cargoDescription: data.cargoDescription ?? "",
    containers: mapContainers(data.containers),
    packages: Number(data.packages ?? 0),
    grossWeight: Number(data.grossWeight ?? 0),
    netWeight: Number(data.netWeight ?? 0),
    cbm: Number(data.cbm ?? 0),
    freightTerms: data.freightTerms ?? "Prepaid",
    placeOfIssue: data.placeOfIssue ?? "",
    issueDate: data.issueDate ?? "",
    onBoardDate: data.onBoardDate ?? "",
    pdf: document ? mapDocumentToPdf(document) : data.pdf,
  };
}

function mapMasterBL(record: BackendImportRecord, form?: BackendForm, document?: BackendDocument): MasterBL | null {
  if (!form && !document) return null;
  const data = (form?.data ?? {}) as Partial<MasterBL>;
  return {
    id: form ? String(form.id) : `${record.id}-master-bl`,
    shipmentId: String(record.id),
    status: form?.completed_at ? "pending_approval" : document ? "received" : "draft",
    audit: { createdBy: userDisplayName(), createdDate: form?.created_at ?? document?.created_at ?? record.created_at, modifiedDate: form?.updated_at },
    shippingLine: data.shippingLine ?? "",
    mblNumber: data.mblNumber ?? "",
    bookingNumber: data.bookingNumber ?? "",
    placeOfReceipt: data.placeOfReceipt ?? "",
    pol: data.pol ?? "",
    pod: data.pod ?? "",
    placeOfDelivery: data.placeOfDelivery ?? "",
    vessel: data.vessel ?? "",
    voyage: data.voyage ?? "",
    shipper: data.shipper ?? "",
    consignee: data.consignee ?? record.customer ?? "",
    notifyParty: data.notifyParty ?? "",
    forwarderReference: data.forwarderReference ?? "",
    cargoDescription: data.cargoDescription ?? "",
    containers: mapContainers(data.containers),
    packages: Number(data.packages ?? 0),
    grossWeight: Number(data.grossWeight ?? 0),
    cbm: Number(data.cbm ?? 0),
    freightTerms: data.freightTerms ?? "Prepaid",
    freightCharges: data.freightCharges ?? "",
    countryOfOrigin: data.countryOfOrigin ?? "",
    placeOfIssue: data.placeOfIssue ?? "",
    issueDate: data.issueDate ?? "",
    onBoardDate: data.onBoardDate ?? "",
    pdf: document ? mapDocumentToPdf(document) : data.pdf,
  };
}

function mapFreightInvoice(
  record: BackendImportRecord,
  invoice: BackendFreightInvoice | null,
  houseBL: HouseBL | null,
  masterBL: MasterBL | null,
): ImportClearingInvoice | null {
  if (!invoice) return null;
  const source = masterBL ?? houseBL;
  const manual = invoice.manual_fields ?? {};
  const autoFields = ((invoice.render_data?.auto_fields ?? invoice.render_data?.header ?? {}) as Record<string, unknown>);
  const charges = invoice.charges.map((charge, index) => mapChargeLine(charge, index));
  const total = Number(invoice.render_data?.total_amount ?? manual.grand_total ?? charges.reduce((sum, charge) => sum + charge.amount, 0));
  return {
    id: String(invoice.id),
    shipmentId: String(record.id),
    status: "draft",
    audit: { createdBy: userDisplayName(invoice.created_by), createdDate: invoice.created_at, modifiedDate: invoice.updated_at },
    hblNumber: stringValue(autoFields.hbl_no) || houseBL?.hblNumber || "",
    mblNumber: stringValue(autoFields.mbl_no) || masterBL?.mblNumber || "",
    containerNumber: stringValue(autoFields.container_no) || source?.containers?.[0]?.containerNo || "",
    containerType: stringValue(autoFields.container_summary) || source?.containers?.[0]?.size || "",
    shippingLine: stringValue(autoFields.shipping_line) || masterBL?.shippingLine || "",
    vessel: stringValue(autoFields.vessel) || source?.vessel || "",
    voyage: stringValue(autoFields.voyage_no) || source?.voyage || "",
    shipper: stringValue(autoFields.shipper) || source?.shipper || "",
    consignee: stringValue(autoFields.consignee) || source?.consignee || record.customer || "",
    cargoDescription: stringValue(autoFields.goods_description) || source?.cargoDescription || "",
    grossWeight: Number(autoFields.gross_weight ?? source?.grossWeight ?? 0),
    netWeight: Number(autoFields.net_weight ?? ("netWeight" in (source ?? {}) ? (source as HouseBL).netWeight : 0)),
    pol: stringValue(autoFields.pol) || source?.pol || "",
    pod: stringValue(autoFields.pod) || source?.pod || "",
    destination: stringValue(autoFields.destination) || source?.placeOfDelivery || "",
    invoiceNumber: invoice.invoice_no ?? stringValue(manual.invoice_no),
    invoiceDate: stringValue(manual.invoice_date),
    customer: stringValue(manual.customer) || record.customer || "",
    ntn: stringValue(manual.ntn_no),
    clearingAgent: stringValue(manual.al_bashar_chal) || stringValue(manual.clearing_agent),
    exchangeRate: Number(manual.exchange_rate ?? 1),
    charges,
    subtotal: total,
    totalAmount: total,
    grandTotal: total,
    amountInWords: stringValue(manual.amount_in_words),
  };
}

function mapPaymentReceipt(record: BackendImportRecord, receipt: BackendPaymentReceipt | null): ImportPaymentReceipt | null {
  if (!receipt) return null;
  return {
    id: String(receipt.id),
    shipmentId: String(record.id),
    status: "draft",
    audit: { createdBy: userDisplayName(receipt.created_by), createdDate: receipt.created_at },
    receiptNo: receipt.receipt_no ?? "",
    tid: receipt.tid,
    amount: Number(receipt.amount ?? 0),
    currency: receipt.currency,
    paymentDate: receipt.payment_date ?? "",
    renderData: receipt.render_data,
  };
}

function mapDetentionInvoice(record: BackendImportRecord, invoice: BackendDetentionInvoice | null): DetentionInvoice | null {
  if (!invoice) return null;
  return {
    id: String(invoice.id),
    shipmentId: String(record.id),
    status: "draft",
    audit: { createdBy: userDisplayName(invoice.created_by), createdDate: invoice.created_at, modifiedDate: invoice.updated_at },
    invoiceNo: invoice.invoice_no ?? "",
    detentionStart: invoice.detention_start,
    detentionEnd: invoice.detention_end,
    freeDays: invoice.free_days,
    chargeableDays: invoice.chargeable_days,
    perDayAmount: Number(invoice.per_day_amount ?? 0),
    detentionAmount: Number(invoice.detention_amount ?? 0),
    securityDeposit: Number(invoice.security_deposit ?? 0),
    refundAmount: Number(invoice.refund_amount ?? 0),
    currency: invoice.currency,
    manualFields: invoice.manual_fields,
    renderData: invoice.render_data,
  };
}

function mapDocumentToPdf(document: BackendDocument): PdfAttachment {
  return {
    fileName: document.original_filename,
    fileSize: document.file_size,
    blobUrl: "",
    uploadedAt: document.uploaded_at,
    uploadedBy: userDisplayName(document.uploaded_by),
  };
}


function userDisplayName(userId?: number | null) {
  return userId ? "Team member" : "System";
}
function mapChargeLine(charge: Record<string, unknown>, index: number): ChargeLine {
  const notes = stringValue(charge.notes);
  const rateMatch = notes.match(/Rate:\s*([\d.]+)/i);
  const quantityMatch = notes.match(/Quantity:\s*([\d.]+)/i);
  const amount = Number(charge.amount ?? 0);
  const rate = rateMatch ? Number(rateMatch[1]) : amount;
  const quantity = quantityMatch ? Number(quantityMatch[1]) : 1;
  return {
    id: `chg-${index + 1}`,
    chargeName: stringValue(charge.label) || stringValue(charge.code) || "Charge",
    rate,
    quantity,
    amount,
  };
}

function mapContainers(value: unknown): ContainerRow[] {
  if (!Array.isArray(value)) return [];
  return value as ContainerRow[];
}

function mapRecordStatus(status: BackendRecordStatus): ImportShipment["status"] {
  if (status === "draft") return "new";
  if (status === "paid") return "completed";
  return "in_progress";
}

function computeStage(hasDraft: boolean, hasHouse: boolean, hasMaster: boolean, record: BackendImportRecord): ImportShipment["currentStage"] {
  if (record.detention_invoice) return "Detention Invoice";
  if (record.payment_receipts?.length) return "Payment Receipt";
  if (record.freight_invoice) return "Freight Invoice";
  if (hasMaster) return "MBL Created";
  if (hasHouse) return "HBL Created";
  if (hasDraft) return "Draft BL";
  return "Created";
}

function toChargeCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "CHARGE";
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

export { DOC_KEY_TO_TYPE, TYPE_TO_DOC_KEY };
