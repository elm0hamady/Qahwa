import { apiClient } from "@/lib/apiClient";
import type { Session, StartSessionInput } from "@/types/api";

export async function createSession(payload: StartSessionInput): Promise<Session> {
  const { data } = await apiClient.post<Session>("/sessions/", payload);
  return data;
}

export async function fetchCurrentSession(): Promise<Session | null> {
  const { data } = await apiClient.get<Session | { session: null }>("/sessions/current/");
  if ("session" in data && data.session === null) return null;
  return data as Session;
}

export async function abandonCurrentSession(): Promise<void> {
  await apiClient.delete("/sessions/current/");
}
