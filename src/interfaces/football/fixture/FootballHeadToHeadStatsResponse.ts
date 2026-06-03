export interface FootballHeadToHeadTeamStat {
  uuid: string;
  sm_id: number;
  name: string;
  wins: number;
}

export interface FootballHeadToHeadStats {
  draws: number;
  teams: FootballHeadToHeadTeamStat[];
}

/**
 * Shape of the `meta` block returned by `/fixtures/head-to-head/{uuid}`.
 * `data` carries the historical fixtures; `meta.stats` the aggregate record.
 */
export interface FootballHeadToHeadMeta {
  stats: FootballHeadToHeadStats;
}
