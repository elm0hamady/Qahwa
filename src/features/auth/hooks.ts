import { useMutation, useQuery } from "@tanstack/react-query";
import { login, register, verifyEmail, type LoginPayload } from "./api";
import { useAuthStore } from "./store";

export function useLogin() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUsername = useAuthStore((s) => s.setUsername);

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (tokens, variables) => {
      setTokens(tokens);
      setUsername(variables.username);
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  return logout;
}

export function useRegister() {
  return useMutation({
    mutationFn: register,
  });
}

export function useVerifyEmail(uid: string | undefined, token: string | undefined) {
  return useQuery({
    queryKey: ["verify-email", uid, token],
    queryFn: () => verifyEmail(uid as string, token as string),
    enabled: Boolean(uid && token),
    retry: false, // an invalid/expired link will never succeed on retry
  });
}
