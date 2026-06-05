// Team statistics expose a very heterogeneous, deeply-nested `value` per stat
// type. Some are flat ({ total }), most wrap the headline under `all`
// ({ all: { count, average } }), and a few are distributions
// ({ "0-15": { count }, ... }) or contain arrays (most_injured_players).
// This picks a single representative scalar to rank/display each team.

const HEADLINE_KEYS = ["count", "total", "value", "scored"];

const toNumber = (v: unknown): number | null => {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const n = Number.parseFloat(v.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

// Representative number from a leaf group like { count, average, percentage }.
const leafNumber = (obj: unknown): number | null => {
  const direct = toNumber(obj);
  if (direct !== null) return direct;
  if (!isObject(obj)) return null;
  for (const k of HEADLINE_KEYS) {
    const n = toNumber(obj[k]);
    if (n !== null) return n;
  }
  // Fallback: first numeric own-property (covers flat stats like PENALTIES:
  // { scored, missed, conversion_rate } → scored).
  for (const k of Object.keys(obj)) {
    const n = toNumber(obj[k]);
    if (n !== null) return n;
  }
  return null;
};

/**
 * Extract the headline scalar for a team's stat value, handling the nested
 * shapes the API returns. Priority:
 *  1. `value.all` headline (GOALS, WIN, BTTS, CLEANSHEET, …)
 *  2. top-level headline (flat { count|total|value })
 *  3. array properties → sum of item scalars (MOST_INJURED_PLAYERS)
 *  4. distribution objects → sum of per-bucket counts (SCORING_MINUTES,
 *     NUMBER_OF_GOALS via `matches.count`, …)
 */
export const extractTeamStatValue = (value: unknown): number | null => {
  const direct = toNumber(value);
  if (direct !== null) return direct;
  if (!isObject(value)) return null;

  // 1. value.all headline
  if (value.all !== undefined) {
    const n = leafNumber(value.all);
    if (n !== null) return n;
  }

  // 2. top-level headline
  const top = leafNumber(value);
  if (top !== null) return top;

  // 3. array properties → sum of item scalars
  for (const k of Object.keys(value)) {
    const arr = value[k];
    if (Array.isArray(arr)) {
      let sum = 0;
      let found = false;
      for (const item of arr) {
        const n = leafNumber(item);
        if (n !== null) {
          sum += n;
          found = true;
        }
      }
      if (found) return sum;
    }
  }

  // 4. distribution objects → sum a representative count per entry
  let sum = 0;
  let found = false;
  for (const k of Object.keys(value)) {
    const entry = value[k];
    if (!isObject(entry)) continue;
    let n = toNumber(entry.count);
    if (n === null) {
      const matches = entry.matches;
      if (isObject(matches)) n = toNumber(matches.count);
    }
    if (n === null) n = leafNumber(entry);
    if (n !== null) {
      sum += n;
      found = true;
    }
  }
  if (found) return sum;

  return null;
};

/** Display string: integer as-is, decimals to 2 places, null → "-". */
export const formatTeamStatValue = (value: unknown): string => {
  const n = extractTeamStatValue(value);
  if (n === null) return "-";
  return n % 1 === 0 ? String(n) : n.toFixed(2);
};
