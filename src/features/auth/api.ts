import { apiClient } from "@/lib/apiClient";
import type { MessageResponse, RegisterInput, TokenPair } from "@/types/api";

export interface LoginPayload {
  username: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<TokenPair> {
  const { data } = await apiClient.post<TokenPair>("/token/", payload);
  return data;
}

export async function register(payload: RegisterInput): Promise<MessageResponse> {
  const { data } = await apiClient.post<MessageResponse>("/register/", payload);
  return data;
}

// GET on purpose — this mirrors the backend's activation link, which is a
// plain clickable URL (uid + token in the path), not a form submission.
export async function verifyEmail(uid: string, token: string): Promise<MessageResponse> {
  const { data } = await apiClient.get<MessageResponse>(`/verify-email/${uid}/${token}/`);
  return data;
}
