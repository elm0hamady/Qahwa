import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adjustPlayerScore,
  fetchScoreboard,
  fetchSessionQuestions,
  judgeQuestion,
  openQuestion,
  revealAnswer,
} from "./api";
import type { JudgeQuestionInput, SessionQuestion } from "@/types/api";
import { currentSessionKey } from "@/features/sessions/hooks";

export function useSessionQuestions(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["session-questions", sessionId],
    queryFn: () => fetchSessionQuestions(sessionId as string),
    enabled: Boolean(sessionId),
  });
}

export function useScoreboard(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["scoreboard", sessionId],
    queryFn: () => fetchScoreboard(sessionId as string),
    enabled: Boolean(sessionId),
    staleTime: 1000 * 5,
  });
}

export function useOpenQuestion(sessionId: string | undefined) {
  const queryClient = useQueryClient();
  const questionsKey = ["session-questions", sessionId];

  return useMutation({
    mutationFn: (questionId: string) => openQuestion(questionId),

    onSuccess: (result, questionId) => {
      queryClient.setQueryData<SessionQuestion[]>(questionsKey, (old) =>
        old?.map((q) => (q.id === questionId ? result : q))
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: questionsKey });
    },
  });
}

export function useRevealAnswer() {
  // No cache to update here on purpose — the answer is per-question,
  // fetched on demand, and held locally by whoever asked for it (see
  // GamePage's QuestionModal). Nothing else in the app needs it.
  return useMutation({
    mutationFn: (questionId: string) => revealAnswer(questionId),
  });
}

export function useJudgeQuestion(sessionId: string | undefined) {
  const queryClient = useQueryClient();
  const questionsKey = ["session-questions", sessionId];
  const scoreboardKey = ["scoreboard", sessionId];

  return useMutation({
    mutationFn: ({ questionId, payload }: { questionId: string; payload: JudgeQuestionInput }) =>
      judgeQuestion(questionId, payload),

    onSuccess: (result, { questionId }) => {
      queryClient.setQueryData<SessionQuestion[]>(questionsKey, (old) =>
        old?.map((question) => (question.id === questionId ? result : question))
      );

      if (result.session_finished) {
        queryClient.invalidateQueries({ queryKey: currentSessionKey });
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: questionsKey });
      queryClient.invalidateQueries({ queryKey: scoreboardKey });
    },
  });
}

export function useAdjustScore(sessionId: string | undefined) {
  const queryClient = useQueryClient();
  const scoreboardKey = ["scoreboard", sessionId];

  return useMutation({
    mutationFn: ({ playerId, amount }: { playerId: number; amount: 100 | -100 }) =>
      adjustPlayerScore(playerId, { amount }),

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: scoreboardKey });
    },
  });
}
