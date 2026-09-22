/**
 * Initials rules shared by team creation (`FantasyTeamUser.vue`) and team
 * editing (`EditFantasyTeamDrawer.vue`), so the two forms can't drift apart.
 *
 * The API is the authority: `FantasyTeamRequest` validates `initials` with
 * `max:3` and its own `generateInitialsFromName` also cuts at 3, so anything
 * longer is a 422 on save. Mobile applies the same limit
 * (`TeamIdentity.INITIALS_MAX_LENGTH`).
 */

/** Max initials length — `max:3` in the API's `FantasyTeamRequest`. */
export const INITIALS_MAX_LENGTH = 3

/**
 * Suggested initials: the first letter of each word of the team name, capped
 * at `INITIALS_MAX_LENGTH` ("Los Tigres del Norte" -> "LTD").
 */
export const autoInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')
    .slice(0, INITIALS_MAX_LENGTH)
