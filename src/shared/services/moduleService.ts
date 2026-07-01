import { apiRequest, type BackendModule } from "./api";

export function listModules() {
  return apiRequest<BackendModule[]>("/modules");
}
