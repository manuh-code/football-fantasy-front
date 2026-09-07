import type { FantasyFootballPlayer } from "@/interfaces/user/fantasy/FantasyFootballPlayersResponse";
import type { FantasyLeagueFormationResponse } from "@/interfaces/fantasy/leagues/FantasyLeagueFormationResponse";

/**
 * Las reglas de los huecos de la alineación, en un solo sitio.
 *
 * Vivían repartidas entre `StartersTable.vue`, `BenchTable.vue` y
 * `SwapPlayerDrawer.vue`, cada una con su propio filtro: quién puede ocupar un
 * hueco se decidía tres veces y ya empezaban a discrepar. El móvil tiene esto
 * mismo en `LineupBoard.kt` (con tests), así que los nombres se mantienen a
 * propósito parecidos — es el mismo contrato en dos clientes.
 */

/** Los `developer_name` de las cuatro líneas del campo. */
export const LINE_POSITIONS = ["GOALKEEPER", "DEFENDER", "MIDFIELDER", "ATTACKER"] as const;

/** Códigos de hueco que no son una posición de fútbol. */
export const FLEX = "FLEX";
export const BENCH = "BENCH";

/** Un jugador del banquillo: ni titular ni flex, y con ficha que mover. */
function isBenched(player: FantasyFootballPlayer): boolean {
    return !player.is_starter && !player.is_flex && !!player.football_player;
}

/**
 * Si al jugador todavía se le puede tocar.
 *
 * **El partido manda, no los puntos.** Desde el pitido inicial de SU encuentro
 * —y para siempre después, también con el partido terminado— ese jugador no
 * entra al once, no baja al banquillo y no sale de la plantilla: sus puntos ya
 * están hechos o haciéndose, así que moverlo después sería alinear sabiendo el
 * resultado. Eso es lo que significa `in_play` en el API (su helper devuelve
 * `true` tanto para un partido en juego como para uno acabado), no "está
 * rodando ahora mismo".
 */
export function canMoveInLineup(player: FantasyFootballPlayer): boolean {
    return !player.in_play;
}

/**
 * Quién puede subir de la banca a un hueco del once.
 *
 * El flex admite todo menos porteros —regla clásica del fantasy, y la que
 * aplica el API— y una línea solo admite su posición. Los que ya tienen el
 * partido empezado quedan fuera (ver [canMoveInLineup]).
 */
export function benchCandidatesFor(
    players: FantasyFootballPlayer[],
    slotPosition: string,
    slotIsFlex = false,
): FantasyFootballPlayer[] {
    return players.filter((player) => {
        if (!canMoveInLineup(player) || !isBenched(player)) return false;
        if (slotIsFlex || slotPosition === FLEX) {
            return player.position?.developer_name !== "GOALKEEPER";
        }
        return player.position?.developer_name === slotPosition;
    });
}

/**
 * Quién puede ocupar un hueco del banquillo: los titulares de esa posición, más
 * cualquier flex.
 *
 * Es el gesto de sentar a alguien, y por eso solo lo pelean titulares: traer a
 * otro suplente no cambiaría nada. `BENCH` sin posición (un hueco sin contexto)
 * los admite a todos.
 */
export function starterCandidatesForBench(
    players: FantasyFootballPlayer[],
    slotPosition: string,
    targetPlayer: FantasyFootballPlayer | null,
): FantasyFootballPlayer[] {
    return players.filter((player) => {
        if (!canMoveInLineup(player)) return false;
        if (!player.is_starter && !player.is_flex) return false;
        if (targetPlayer && player.football_player?.uuid === targetPlayer.football_player?.uuid) return false;
        if (slotPosition === BENCH) return true;
        return player.position?.developer_name === slotPosition || player.is_flex;
    });
}

/** Cuántas fichas caben en total: titulares + flex + banca. */
export function rosterCapacity(formation: FantasyLeagueFormationResponse | null): number {
    if (!formation) return 0;
    return (
        (formation.goalkeeper?.starter ?? 0) +
        (formation.defender?.starter ?? 0) +
        (formation.midfielder?.starter ?? 0) +
        (formation.attacker?.starter ?? 0) +
        (formation.flex ?? 0) +
        (formation.bench ?? 0)
    );
}

/**
 * Si ya no cabe nadie más.
 *
 * Sin formación no se puede afirmar que esté llena: se responde que no, que es
 * lo que deja seguir trabajando (el API tiene la última palabra de todos modos).
 */
export function isRosterFull(
    players: FantasyFootballPlayer[],
    formation: FantasyLeagueFormationResponse | null,
): boolean {
    if (!formation) return false;
    return players.filter((p) => !!p.football_player).length >= rosterCapacity(formation);
}

/** Cuántos huecos hay de un tipo, según la formación. */
function capacityOf(
    formation: FantasyLeagueFormationResponse,
    slot: { isStarter: boolean; isFlex: boolean; position?: string | null },
): number {
    if (!slot.isStarter) return formation.bench ?? 0;
    if (slot.isFlex) return formation.flex ?? 0;

    switch (slot.position) {
        case "GOALKEEPER": return formation.goalkeeper?.starter ?? 0;
        case "DEFENDER": return formation.defender?.starter ?? 0;
        case "MIDFIELDER": return formation.midfielder?.starter ?? 0;
        case "ATTACKER": return formation.attacker?.starter ?? 0;
        default: return 0;
    }
}

/** Cuántos jugadores ocupan ya ese tipo de hueco. */
function occupancyOf(
    players: FantasyFootballPlayer[],
    slot: { isStarter: boolean; isFlex: boolean; position?: string | null },
): number {
    if (!slot.isStarter) return players.filter(isBenched).length;
    if (slot.isFlex) return players.filter((p) => p.is_flex).length;
    return players.filter(
        (p) => p.is_starter && !p.is_flex && p.position?.developer_name === slot.position,
    ).length;
}

/**
 * Si queda sitio para uno más en ese tipo de hueco.
 *
 * Es la copia en cliente de `FantasyDraftService::ensureSlotIsAvailable`: sirve
 * para no ofrecer un botón que el servidor va a rechazar, no para sustituir esa
 * comprobación. Una posición desconocida (o sin formación cargada) se da por
 * buena y se deja decidir al API.
 */
export function hasRoomForSlot(
    players: FantasyFootballPlayer[],
    formation: FantasyLeagueFormationResponse | null,
    slot: { isStarter: boolean; isFlex: boolean; position?: string | null },
): boolean {
    if (!formation) return true;
    if (isRosterFull(players, formation)) return false;
    if (slot.isStarter && !slot.isFlex && !LINE_POSITIONS.includes(slot.position as never)) return true;

    return occupancyOf(players, slot) < capacityOf(formation, slot);
}
