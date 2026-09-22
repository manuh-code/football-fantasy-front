/**
 * `data` del `PUT user/fantasy/football/lineups/{liga}`.
 *
 * El servidor escribe la alineación en la jornada editada y la arrastra a las
 * siguientes que siguen sin cerrar; esta lista son esas otras jornadas. Un API
 * anterior a ese cambio respondía sin `data`, por eso es opcional.
 */
export interface LineupUpdateResponse {
    carried_over_round_uuids?: string[];
}
