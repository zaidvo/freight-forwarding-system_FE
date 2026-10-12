export type CustomerRole =
  | "customer"
  | "shipper"
  | "consignee"
  | "clearing_agent";

export type CustomerStatus = "active" | "inactive";

export type Customer = {
  id: number;
  code: string;
  name: string;
  normalized_name: string;
  contact_person: string | null;
  city: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  country: string | null;
  tax_id: string | null;
  notes: string | null;
  status: CustomerStatus;
  roles: CustomerRole[];
  created_by: number | null;
  created_at: string;
  updated_at: string;
};

export type CustomerSuggestion = Pick<
  Customer,
  | "id"
  | "code"
  | "name"
  | "contact_person"
  | "city"
  | "email"
  | "phone"
  | "address"
  | "country"
  | "roles"
  | "status"
>;

export type CustomerListResponse = {
  items: Customer[];
  page: number;
  page_size: number;
  total: number;
};

export type CustomerInput = {
  name: string;
  contact_person?: string;
  city?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  tax_id?: string;
  notes?: string;
  roles: CustomerRole[];
};
