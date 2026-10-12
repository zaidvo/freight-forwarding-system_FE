// src/modules/indenting/types.ts

export type IndentingPartyStatus = "active" | "inactive";

export type IndentingParty = {
  id: number;
  code: string;
  name: string;
  normalized_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  tax_id: string | null;
  notes: string | null;
  status: IndentingPartyStatus;
  created_by: number | null;
  created_at: string;
  updated_at: string;
};

export type IndentingPartySuggest = {
  id: number;
  code: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
};

export type IndentingPartyCreatePayload = {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tax_id?: string;
  notes?: string;
};

export type IndentingPartyUpdatePayload = Partial<IndentingPartyCreatePayload> & {
  status?: IndentingPartyStatus;
};

export type IndentingDealStatus = "open" | "confirmed" | "closed" | "cancelled";
export type IndentingCommissionType = "percent" | "fixed";
export type IndentingCommissionPayer = "party_a" | "party_b" | "both";
export type IndentingPaymentStatus = "pending" | "partial" | "paid" | "overpaid";

export type IndentingCommissionPayment = {
  id: number;
  deal_id: number;
  amount: number;
  currency: string;
  payment_date: string;
  reference: string | null;
  notes: string | null;
  created_by: number | null;
  created_at: string;
};

export type IndentingCommissionPaymentCreatePayload = {
  amount: number;
  currency: string;
  payment_date: string;
  reference?: string;
  notes?: string;
};

export type IndentingDeal = {
  id: number;
  reference: string;
  party_a_id: number;
  party_b_id: number;
  party_a?: IndentingParty | null;
  party_b?: IndentingParty | null;
  product: string;
  quantity: number;
  unit: string;
  deal_value: number;
  currency: string;
  deal_date: string;
  status: IndentingDealStatus;
  commission_type: IndentingCommissionType;
  commission_rate: number | null;
  commission_amount: number;
  commission_currency: string;
  commission_payer: IndentingCommissionPayer;
  remarks: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;

  // Calculated properties
  payment_status: IndentingPaymentStatus;
  total_paid: number;
  balance_due: number;
  payments: IndentingCommissionPayment[];
};

export type IndentingDealCreatePayload = {
  party_a_id: number;
  party_b_id: number;
  product: string;
  quantity: number;
  unit: string;
  deal_value: number;
  currency: string;
  deal_date: string;
  commission_type: IndentingCommissionType;
  commission_rate?: number;
  commission_amount?: number;
  commission_currency: string;
  commission_payer: IndentingCommissionPayer;
  remarks?: string;
};

export type IndentingDealUpdatePayload = Partial<IndentingDealCreatePayload> & {
  status?: IndentingDealStatus;
};

export type CurrencySummaryItem = {
  currency: string;
  total_deal_value: number;
  expected_commission: number;
  received_commission: number;
  pending_commission: number;
  deal_count: number;
};

export type IndentingSummaryResponse = {
  currencies: CurrencySummaryItem[];
  total_deals: number;
  active_parties: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};
