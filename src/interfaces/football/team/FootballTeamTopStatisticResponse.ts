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

export interface TeamValue {
  [key: string]: any;
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
