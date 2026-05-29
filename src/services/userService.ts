import {
  apiRequest,
  type BackendUser,
  type CreateUserPayload,
  type UpdateUserPayload,
} from "./api";

export function listUsers() {
  return apiRequest<BackendUser[]>("/users");
}

export function createUser(payload: CreateUserPayload) {
  return apiRequest<BackendUser>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateUser(userId: number, payload: UpdateUserPayload) {
  return apiRequest<BackendUser>(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deactivateUser(userId: number) {
  return apiRequest<BackendUser>(`/users/${userId}`, {
    method: "DELETE",
  });
}
