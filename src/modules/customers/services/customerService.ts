import { apiRequest } from "@/shared/services/api";
import type {
  Customer,
  CustomerInput,
  CustomerListResponse,
  CustomerRole,
  CustomerStatus,
  CustomerSuggestion,
} from "../types";

export type CustomerListParams = {
  q?: string;
  role?: CustomerRole | "";
  status?: CustomerStatus | "";
  page?: number;
  pageSize?: number;
};

function queryString(params: CustomerListParams) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.role) search.set("role", params.role);
  if (params.status) search.set("status", params.status);
  search.set("page", String(params.page ?? 1));
  search.set("page_size", String(params.pageSize ?? 25));
  return search.toString();
}

export function listCustomers(params: CustomerListParams = {}) {
  return apiRequest<CustomerListResponse>(`/customers?${queryString(params)}`);
}

export function suggestCustomers(q: string) {
  return apiRequest<CustomerSuggestion[]>(`/customers/suggest?q=${encodeURIComponent(q)}`);
}

export function checkCustomerDuplicates(name: string, customerId?: number) {
  return apiRequest<Customer[]>("/customers/check-duplicates", {
    method: "POST",
    body: JSON.stringify({ name, customer_id: customerId }),
  });
}

export function createCustomer(payload: CustomerInput) {
  return apiRequest<Customer>("/customers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCustomer(id: number) {
  return apiRequest<Customer>(`/customers/${id}`);
}

export function updateCustomer(id: number, payload: Partial<CustomerInput>) {
  return apiRequest<Customer>(`/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function setCustomerStatus(id: number, active: boolean) {
  return apiRequest<Customer>(`/customers/${id}/${active ? "activate" : "deactivate"}`, {
    method: "PATCH",
  });
}
