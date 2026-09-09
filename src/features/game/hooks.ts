import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adjustPlayerScore,
  fetchScoreboard,
  fetchSessionQuestions,
  judgeQuestion,
  openQuestion,
  revealAnswer,
} from "./api";
import type { JudgeQuestionInput, ScoreboardEntry, SessionQuestion } from "@/types/api";
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

    // We can't know the real question text ahead of the server response
    // (that's intentional — it stops a host from reading answers via
    // devtools before opening them), but we CAN flag the token as
    // "opened" immediately so the board reacts the instant it's clicked.
    onMutate: async (questionId) => {
      await queryClient.cancelQueries({ queryKey: questionsKey });
      const previous = queryClient.getQueryData<SessionQuestion[]>(questionsKey);

      if (previous) {
        queryClient.setQueryData<SessionQuestion[]>(
          questionsKey,
          previous.map((q) => (q.id === questionId ? { ...q, state: "opened" } : q))
        );
      }

      return { previous };
    },

    onError: (_err, _questionId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(questionsKey, context.previous);
      }
    },

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

    // We already know the question's point value client-side, so judging
    // can update the board AND the score immediately, instead of waiting
    // on the request and then a full refetch of both.
    onMutate: async ({ questionId, payload }) => {
      await queryClient.cancelQueries({ queryKey: questionsKey });
      await queryClient.cancelQueries({ queryKey: scoreboardKey });

      const previousQuestions = queryClient.getQueryData<SessionQuestion[]>(questionsKey);
      const previousScoreboard = queryClient.getQueryData<ScoreboardEntry[]>(scoreboardKey);
      const judgedQuestion = previousQuestions?.find((q) => q.id === questionId);

      if (previousQuestions) {
        queryClient.setQueryData<SessionQuestion[]>(
          questionsKey,
          previousQuestions.map((q) => (q.id === questionId ? { ...q, state: "judged" } : q))
        );
      }

      if (previousScoreboard && judgedQuestion && payload.winner_player_id) {
        queryClient.setQueryData<ScoreboardEntry[]>(
          scoreboardKey,
          previousScoreboard.map((entry) =>
            entry.player_id === payload.winner_player_id
              ? { ...entry, score: entry.score + judgedQuestion.difficulity }
              : entry
          )
        );
      }

      return { previousQuestions, previousScoreboard };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousQuestions) {
        queryClient.setQueryData(questionsKey, context.previousQuestions);
      }
      if (context?.previousScoreboard) {
        queryClient.setQueryData(scoreboardKey, context.previousScoreboard);
      }
    },

    onSuccess: (result) => {
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

    onMutate: async ({ playerId, amount }) => {
      await queryClient.cancelQueries({ queryKey: scoreboardKey });
      const previous = queryClient.getQueryData<ScoreboardEntry[]>(scoreboardKey);

      if (previous) {
        queryClient.setQueryData<ScoreboardEntry[]>(
          scoreboardKey,
          previous.map((entry) =>
            entry.player_id === playerId ? { ...entry, score: entry.score + amount } : entry
          )
        );
      }

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(scoreboardKey, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: scoreboardKey });
    },
  });
}
