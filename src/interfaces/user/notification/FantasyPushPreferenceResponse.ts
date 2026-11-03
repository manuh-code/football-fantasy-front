// One fantasy push notification the user can turn on or off, as returned by
// GET /user/notification/fantasy.
//
// These are the three notifications that go to whoever OWNS a player (a starter's
// goals/cards, a starter's injury or suspension, and the round-deadline reminder),
// as opposed to the per-favorite-team match events of TeamNotificationEventResponse.
export interface FantasyPushPreferenceResponse {
    // Machine code, sent back in the update payload: "player_events" | "sidelined" | "lineup_reminder".
    type: string;
    // Already-localized label from the backend (e.g. "Goles, penales y expulsiones").
    name: string;
    // Already-localized one-line explanation of when the notification is sent.
    description: string;
    // Whether the user currently receives it. No stored choice means enabled.
    enabled: boolean;
}
