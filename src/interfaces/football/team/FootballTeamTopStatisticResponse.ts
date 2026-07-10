export interface Country {
  uuid: string;
  sm_id: number;
  name: string;
  fifa_name: string;
  image_path: string;
}

export interface StatisticType {
  uuid: string;
  name: string;
  code: string;
  developer_name: string;
  stat_group: string;
}

/** How to render `TeamValue.main`. */
export type StatValueFormat =
  | "integer"
  | "decimal"
  | "percentage"
  | "rating"
  | "minutes";

/**
 * Flat breakdown row. `key` is a stable snake_case identifier; nested levels
 * use dots ("home.average", "over_2_5.matches") and histogram buckets are
 * ranges ("0-15" … "75-90"). `percentage` is paired only when the row has one.
 */
export interface StatDetail {
  key: string;
  value: number | string | null;
  percentage: number | null;
}

/** Player referenced by a stat. Nullable when not in our catalog. */
export interface StatPlayer {
  uuid: string | null;
  sm_id: number;
  display_name: string | null;
  image_path: string | null;
}

/**
 * Player row inside a stat value. `key` says what the row represents
 * (most_carded_player, highest_rated_player, most_appearances,
 * most_minutes_played, most_substituted, most_injured, national_team_player).
 * `meta` carries extras per stat: {in, out} for most_substituted,
 * {team} for national_team_player.
 */
export interface StatPlayerRow {
  key: string;
  value: number | null;
  meta: Record<string, unknown> | null;
  player: StatPlayer;
}

/**
 * Standardized envelope every statistic arrives in. `main` is the headline
 * figure the ranking is sorted by (null = breakdown-only stat, those teams
 * come last); `text` is a textual headline (only MOST_SCORED_HALF uses it).
 */
export interface TeamValue {
  main: number | null;
  format: StatValueFormat;
  text: string | null;
  details: StatDetail[];
  players: StatPlayerRow[];
}

export interface Team {
  uuid: string;
  sm_id: number;
  name: string;
  short_code: string;
  image_path: string;
  founded: number | null;
  country: Country;
  value: TeamValue;
}

export interface Statistic {
  type: StatisticType;
  teams: Team[];
}

export interface FootballTeamTopStatisticResponse {
  stat_group: string;
  statistics: Statistic[];
}
