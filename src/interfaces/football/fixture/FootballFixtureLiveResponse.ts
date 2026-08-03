import type { FootballLiveClockResponse } from "./FootballLiveClockResponse";
import type { FootballStateResponse } from "../state/FootballStateResponse";
import type { ScoreResponse } from "./ScoreResponse";

/**
 * Compact "what changed during the match" payload broadcast by the API on the
 * `live-fixtures` channel every ~10s while a match is in play.
 *
 * It deliberately carries only the fields that move (state, score, clock) — no
 * kickoff dates, which are timezone-dependent and fixed — so a single message
 * serves every connected viewer regardless of timezone.
 */
export interface FootballFixtureLiveResponse {
  uuid: string;
  state: FootballStateResponse | null;
  is_inplay: boolean;
  is_finished: boolean;
  live_clock: FootballLiveClockResponse | null;
  result_info: string | null;
  scores: ScoreResponse[];
  /** Running score keyed by side, e.g. `{ home: 2, away: 1 }`. */
  current_scores: Partial<Record<"home" | "away", number>>;
}
