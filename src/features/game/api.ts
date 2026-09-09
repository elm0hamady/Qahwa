import { apiClient } from "@/lib/apiClient";
import type {
  AdjustScoreInput,
  AdjustScoreResponse,
  JudgeQuestionInput,
  RevealedAnswer,
  ScoreboardEntry,
  SessionQuestion,
} from "@/types/api";

export async function fetchSessionQuestions(sessionId: string): Promise<SessionQuestion[]> {
  const { data } = await apiClient.get<SessionQuestion[]>(`/sessions/${sessionId}/questions/`);
  return data;
}

export async function openQuestion(questionId: string): Promise<SessionQuestion> {
  const { data } = await apiClient.post<SessionQuestion>(`/session-questions/${questionId}/open/`);
  return data;
}

export async function judgeQuestion(
  questionId: string,
  payload: JudgeQuestionInput
): Promise<SessionQuestion> {
  const { data } = await apiClient.post<SessionQuestion>(
    `/session-questions/${questionId}/judge/`,
    payload
  );
  return data;
}

// Deliberately a separate call from openQuestion — the answer must never sit
// in a network response the host hasn't asked for yet (same reasoning as why
// the question text is withheld until /open/ is called).
export async function revealAnswer(questionId: string): Promise<RevealedAnswer> {
  const { data } = await apiClient.post<RevealedAnswer>(`/session-questions/${questionId}/answer/`);
  return data;
}

export async function adjustPlayerScore(
  playerId: number,
  payload: AdjustScoreInput
): Promise<AdjustScoreResponse> {
  const { data } = await apiClient.post<AdjustScoreResponse>(
    `/players/${playerId}/adjust-score/`,
    payload
  );
  return data;
}

export async function fetchScoreboard(sessionId: string): Promise<ScoreboardEntry[]> {
  const { data } = await apiClient.get<ScoreboardEntry[]>(`/sessions/${sessionId}/scoreboard/`);
  return data;
}
