/**
 * Live match clock snapshot (`live_clock`) as sent by the API. Every field is
 * null while the clock isn't running — before kickoff, at half time and once the
 * match has finished — so a non-null `minute` is itself the "match is ticking"
 * signal.
 */
export interface FootballLiveClockResponse {
  minute: number | null;
  minute_and_seconds: string | null;
  added_time: number | null;
}
