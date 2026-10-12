// src/modules/indenting/services/indentingService.ts

import { apiRequest } from "@/shared/services/api";
import type {
  IndentingCommissionPayment,
  IndentingCommissionPaymentCreatePayload,
  IndentingDeal,
  IndentingDealCreatePayload,
  IndentingDealStatus,
  IndentingDealUpdatePayload,
  IndentingParty,
  IndentingPartyCreatePayload,
  IndentingPartyStatus,
  IndentingPartySuggest,
  IndentingPartyUpdatePayload,
  IndentingSummaryResponse,
  PaginatedResponse,
} from "../types";

export const indentingService = {
  // ─── Parties ─────────────────────────────────────────────────────────────
  async listParties(params?: {
    q?: string;
    status?: IndentingPartyStatus;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<IndentingParty>> {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.set("q", params.q);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.page_size) searchParams.set("page_size", params.page_size.toString());

    const qs = searchParams.toString();
    return apiRequest<PaginatedResponse<IndentingParty>>(
      `/indenting/parties${qs ? `?${qs}` : ""}`
    );
  },

  async suggestParties(q?: string): Promise<IndentingPartySuggest[]> {
    const searchParams = new URLSearchParams();
    if (q) searchParams.set("q", q);
    const qs = searchParams.toString();
    return apiRequest<IndentingPartySuggest[]>(
      `/indenting/parties/suggest${qs ? `?${qs}` : ""}`
    );
  },

  async getParty(id: number): Promise<IndentingParty> {
    return apiRequest<IndentingParty>(`/indenting/parties/${id}`);
  },

  async createParty(payload: IndentingPartyCreatePayload): Promise<IndentingParty> {
    return apiRequest<IndentingParty>("/indenting/parties", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateParty(
    id: number,
    payload: IndentingPartyUpdatePayload
  ): Promise<IndentingParty> {
    return apiRequest<IndentingParty>(`/indenting/parties/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deactivateParty(id: number): Promise<IndentingParty> {
    return apiRequest<IndentingParty>(`/indenting/parties/${id}/deactivate`, {
      method: "PATCH",
    });
  },

  async activateParty(id: number): Promise<IndentingParty> {
    return apiRequest<IndentingParty>(`/indenting/parties/${id}/activate`, {
      method: "PATCH",
    });
  },

  // ─── Deals ───────────────────────────────────────────────────────────────
  async listDeals(params?: {
    q?: string;
    status?: IndentingDealStatus;
    party_id?: number;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<IndentingDeal>> {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.set("q", params.q);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.party_id) searchParams.set("party_id", params.party_id.toString());
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.page_size) searchParams.set("page_size", params.page_size.toString());

    const qs = searchParams.toString();
    return apiRequest<PaginatedResponse<IndentingDeal>>(
      `/indenting/deals${qs ? `?${qs}` : ""}`
    );
  },

  async getDeal(id: number): Promise<IndentingDeal> {
    return apiRequest<IndentingDeal>(`/indenting/deals/${id}`);
  },

  async createDeal(payload: IndentingDealCreatePayload): Promise<IndentingDeal> {
    return apiRequest<IndentingDeal>("/indenting/deals", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateDeal(
    id: number,
    payload: IndentingDealUpdatePayload
  ): Promise<IndentingDeal> {
    return apiRequest<IndentingDeal>(`/indenting/deals/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async updateDealStatus(
    id: number,
    status: IndentingDealStatus
  ): Promise<IndentingDeal> {
    return apiRequest<IndentingDeal>(`/indenting/deals/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  // ─── Payments ────────────────────────────────────────────────────────────
  async listPayments(dealId: number): Promise<IndentingCommissionPayment[]> {
    return apiRequest<IndentingCommissionPayment[]>(
      `/indenting/deals/${dealId}/payments`
    );
  },

  async addPayment(
    dealId: number,
    payload: IndentingCommissionPaymentCreatePayload
  ): Promise<IndentingDeal> {
    return apiRequest<IndentingDeal>(`/indenting/deals/${dealId}/payments`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async deletePayment(dealId: number, paymentId: number): Promise<IndentingDeal> {
    return apiRequest<IndentingDeal>(
      `/indenting/deals/${dealId}/payments/${paymentId}`,
      {
        method: "DELETE",
      }
    );
  },

  // ─── Summary ─────────────────────────────────────────────────────────────
  async getSummary(): Promise<IndentingSummaryResponse> {
    return apiRequest<IndentingSummaryResponse>("/indenting/summary");
  },
};
