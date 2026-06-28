import { apiRequest, type BackendGroup } from "./api";

export type GroupPayload = {
  name: string;
  description?: string | null;
  module_ids: number[];
};

export function listGroups() {
  return apiRequest<BackendGroup[]>("/groups");
}

export function createGroup(payload: GroupPayload) {
  return apiRequest<BackendGroup>("/groups", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateGroup(groupId: number, payload: Partial<GroupPayload>) {
  return apiRequest<BackendGroup>(`/groups/${groupId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteGroup(groupId: number) {
  return apiRequest<unknown>(`/groups/${groupId}`, {
    method: "DELETE",
  });
}

export function updateUserGroups(userId: number, groupIds: number[]) {
  return apiRequest<unknown>(`/groups/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify({ group_ids: groupIds }),
  });
}
