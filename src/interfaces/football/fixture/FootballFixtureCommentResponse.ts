export interface FootballFixtureCommentResponse {
  comment: string;
  minute: number;
  extra_minute: number | null;
  is_goal: boolean;
  is_important: boolean;
  order: number;
}
