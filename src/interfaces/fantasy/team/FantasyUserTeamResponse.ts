export interface SvgConfig {
    stars: number;
    starPosition: string;
    texture: string;
    primaryColor: string;
    secondaryColor: string;
    shapeStyle: string;
}

export interface FantasyTeamData {
    uuid: string;
    team_name: string;
    image_path: string | null;
    svg: string;
    svg_config: SvgConfig | null;
    created_at: string;
}