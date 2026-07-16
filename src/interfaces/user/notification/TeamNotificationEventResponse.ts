// One configurable match-event notification for a favorite team, as returned by
// GET /user/favorite/teams/{teamUuid}/notification/events.
export interface TeamNotificationEventResponse {
    // Machine code of the event, sent back in the update payload (e.g. "GOAL", "REDCARD").
    event: string;
    // Human-readable, already-localized label from the backend (e.g. "Gol").
    name: string;
    // Whether the user currently receives push notifications for this event.
    enabled: boolean;
}
