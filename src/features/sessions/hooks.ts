import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { abandonCurrentSession, createSession, fetchCurrentSession } from "./api";
import type { StartSessionInput } from "@/types/api";

export const currentSessionKey = ["session", "current"] as const;

export function useCurrentSession(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: currentSessionKey,
    queryFn: fetchCurrentSession,
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 10,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StartSessionInput) => createSession(payload),
    onSuccess: (session) => {
      queryClient.setQueryData(currentSessionKey, session);
    },
  });
}

export function useAbandonSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: abandonCurrentSession,
    onSuccess: () => {
      queryClient.setQueryData(currentSessionKey, null);
      queryClient.removeQueries({ queryKey: ["session-questions"] });
      queryClient.removeQueries({ queryKey: ["scoreboard"] });
    },
  });
}
