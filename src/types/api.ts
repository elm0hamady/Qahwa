// Mirrors apps/game and apps/bank serializers exactly. Keep in sync with backend.

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ---- Auth ----
export interface TokenPair {
  access: string;
  refresh: string;
}

export interface RegisterInput {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface MessageResponse {
  message: string;
}

// ---- Bank (question bank) ----
export interface Topic {
  id: number;
  category: string;
  name: string;
}

// ---- Game ----
export type SessionStatus = "in_progress" | "finished";

export interface Player {
  id: number;
  name: string;
}

export interface SessionTopic {
  id: number;
  name: string;
}

export interface Session {
  id: string; // uuid (public_id)
  status: SessionStatus;
  created_at: string;
  topics: SessionTopic[];
  players: Player[];
}

export type QuestionState = "locked" | "opened" | "judged";

export interface QuestionMedia {
  type: "image" | "video" | "audio";
  url: string;
}

export interface SessionQuestion {
  id: string; // uuid (public_id)
  topic: string;
  difficulity: 100 | 300 | 500;
  player: string; // assigned player name — display only, NOT unique (two
  // players can share a name); always match on player_id instead.
  player_id: number;
  state: QuestionState;
  text: string | null; // null while locked
  media: QuestionMedia | null;
  session_finished?: boolean; // only present on judge response
}

export interface ScoreboardEntry {
  player_id: number;
  player_name: string;
  score: number;
}

// The answer is intentionally never included in the question/session-questions
// responses — it's only revealed on demand via a dedicated endpoint, after the
// question has been opened. See features/game/api.ts::revealAnswer.
export interface RevealedAnswer {
  text: string | null;
  media: QuestionMedia | null;
}

// ---- Requests ----
export interface StartSessionInput {
  player1_name: string;
  player2_name: string;
  topic_ids: number[]; // exactly 4
}

export interface JudgeQuestionInput {
  winner_player_id?: number | null;
}

export interface AdjustScoreInput {
  amount: 100 | -100;
}

export interface AdjustScoreResponse {
  id: number;
  name: string;
  manual_adjustment: number;
}

// ---- Errors ----
export interface ApiErrorShape {
  status: number;
  message: string;
  fieldErrors?: Record<string, string[]>;
  raw?: unknown;
}
