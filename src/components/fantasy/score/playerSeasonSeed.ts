import type { CountryResponse } from "@/interfaces/country/CountryResponse";
import type { FantasyPlayerDraftResponse } from "@/interfaces/fantasy/draft/FantasyPlayerDraftResponse";
import type { FantasyFootballPlayer } from "@/interfaces/user/fantasy/FantasyFootballPlayersResponse";

/**
 * Lo que el cajón de temporada puede pintar **antes** de que llegue la
 * respuesta: quién es y —si se abrió desde una fila de Jugadores o del draft—
 * los mismos total, promedio y partidos que ya enseñaba esa fila.
 *
 * El cajón se abre desde tres sitios con tres formas de jugador distintas
 * (fila de Jugadores, fila del pool del draft, jugador de la alineación); esta
 * es la forma común, para que el cajón no tenga que conocer las tres.
 */
export interface PlayerSeasonSeed {
    uuid: string;
    name: string;
    imagePath: string | null;
    positionDev: string | null;
    teamImage: string | null;
    teamShortCode: string | null;
    country: CountryResponse | null;
    /** Null cuando quien abre no los conoce (Mi equipo solo sabe la jornada). */
    totalPoints: number | null;
    averagePoints: number | null;
    totalFixtures: number | null;
}

/** Fila de Jugadores o del pool del draft: trae los números de la temporada. */
export function seedFromDraftPlayer(player: FantasyPlayerDraftResponse): PlayerSeasonSeed {
    return {
        uuid: player.player.uuid,
        name: player.player.display_name,
        imagePath: player.player.image_path || null,
        positionDev: player.position?.developer_name ?? player.player.position?.developer_name ?? null,
        teamImage: player.team?.image_path || null,
        teamShortCode: player.team?.short_code || null,
        country: player.player.country ?? null,
        totalPoints: Number(player.total_points) || 0,
        averagePoints: Number(player.average_points) || 0,
        totalFixtures: Number(player.total_fixtures) || 0,
    };
}

/**
 * Jugador de la alineación (Mi equipo). Sus `fantasy_points` son de UNA
 * jornada, así que no sirven de adelanto para la temporada: van en null.
 */
export function seedFromLineupPlayer(player: FantasyFootballPlayer): PlayerSeasonSeed | null {
    const footballPlayer = player.football_player;
    if (!footballPlayer?.uuid) return null;

    return {
        uuid: footballPlayer.uuid,
        name: footballPlayer.display_name,
        imagePath: footballPlayer.image_path || null,
        positionDev: player.position?.developer_name ?? footballPlayer.position?.developer_name ?? null,
        teamImage: player.team?.image_path || null,
        teamShortCode: player.team?.short_code || null,
        country: footballPlayer.country ?? player.country ?? null,
        totalPoints: null,
        averagePoints: null,
        totalFixtures: null,
    };
}
