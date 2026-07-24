import { apiRequest, type BackendActivityLog } from "./api";

export type ActivityLogCategory = "important" | "account" | "security" | "auth" | "all";

export type ActivityLogPage = {
  items: BackendActivityLog[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  category: ActivityLogCategory;
};

type ListActivityLogsOptions = {
  page?: number;
  pageSize?: number;
  category?: ActivityLogCategory;
};

export function listActivityLogs({
  page = 1,
  pageSize = 10,
  category = "important",
}: ListActivityLogsOptions = {}) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    category,
  });

  return apiRequest<ActivityLogPage>(`/activity-logs?${params.toString()}`);
}
