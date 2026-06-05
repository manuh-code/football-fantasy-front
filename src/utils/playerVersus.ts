// Pure helpers to turn a FootballPlayerVersusResponse into chart-ready data.
// The API returns dynamic stat maps (StatValue), so values are coerced to a
// single comparable number (primary = `total`, fallback = first numeric entry).

import type {
  PlayerVersusData,
  StatValue,
} from "@/interfaces/football/player/FootballPlayerVersusResponse";

export interface FlatStat {
  key: string;
  label: string;
  value: number | null;
}

export interface FlatStatGroup {
  group: string;
  stats: FlatStat[];
}

export interface ComparisonStat {
  key: string;
  label: string;
  a: number | null;
  b: number | null;
}

export interface ComparisonGroup {
  group: string;
  stats: ComparisonStat[];
}

export interface RadarData {
  labels: string[];
  valuesA: number[];
  valuesB: number[];
}

/** Coerce any StatValue scalar into a finite number, or null. */
const toNumber = (v: unknown): number | null => {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

/** Primary comparable number for a stat: prefer `total`, else first numeric. */
const primaryValue = (value: StatValue): number | null => {
  if (value.total !== undefined) {
    const n = toNumber(value.total);
    if (n !== null) return n;
  }
  for (const key of Object.keys(value)) {
    const n = toNumber(value[key]);
    if (n !== null) return n;
  }
  return null;
};

/**
 * Flatten one player's statistics into ordered groups of { key, label, value }.
 * Picks the entry matching `seasonUuid` (fallback: first), preserving API order.
 */
export const flattenPlayerStats = (
  data: PlayerVersusData | null | undefined,
  seasonUuid?: string,
): FlatStatGroup[] => {
  const list = data?.statistics;
  if (!list?.length) return [];
  const stat =
    (seasonUuid && list.find((s) => s.season?.uuid === seasonUuid)) || list[0];
  if (!stat?.details) return [];
  return stat.details.map((detail) => ({
    group: detail.stat_group,
    stats: (detail.stats ?? []).map((s) => ({
      key: s.type.code || s.type.developer_name || s.type.name,
      label: s.type.name,
      value: primaryValue(s.value),
    })),
  }));
};

/**
 * Intersection of both players' stats (by key), grouped by stat_group and
 * ordered as player A returns them. Rows where both values are null are dropped.
 */
export const buildComparison = (
  aGroups: FlatStatGroup[],
  bGroups: FlatStatGroup[],
): ComparisonGroup[] => {
  const bByKey = new Map<string, FlatStat>();
  for (const g of bGroups) for (const s of g.stats) bByKey.set(s.key, s);

  const out: ComparisonGroup[] = [];
  for (const g of aGroups) {
    const stats: ComparisonStat[] = [];
    for (const s of g.stats) {
      const bStat = bByKey.get(s.key);
      if (!bStat) continue; // intersection only
      if (s.value === null && bStat.value === null) continue;
      stats.push({ key: s.key, label: s.label, a: s.value, b: bStat.value });
    }
    if (stats.length) out.push({ group: g.group, stats });
  }
  return out;
};

// Common, meaningful metrics surfaced first on the radar when present.
const RADAR_PRIORITY = [
  "rating",
  "goals",
  "assists",
  "shots_total",
  "shots",
  "shots_on_target",
  "key_passes",
  "passes",
  "successful_passes_percentage",
  "tackles",
  "interceptions",
  "duels_won",
  "successful_dribbles",
  "dribbles",
  "minutes_played",
  "appearances",
];

/**
 * Pick up to `maxAxes` shared metrics for the radar and normalize each axis to
 * 0–100 relative to the max of the two players (axis leader hits 100), since the
 * raw metrics have very different magnitudes.
 */
export const buildRadarMetrics = (
  comparison: ComparisonGroup[],
  maxAxes = 8,
): RadarData => {
  const all = comparison.flatMap((g) => g.stats);
  // Keep axes where at least one player has a positive value.
  const usable = all.filter((s) => (s.a ?? 0) > 0 || (s.b ?? 0) > 0);

  const priorityIndex = (key: string): number => {
    const idx = RADAR_PRIORITY.indexOf(key.toLowerCase());
    return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
  };
  const ordered = [...usable].sort((a, b) => priorityIndex(a.key) - priorityIndex(b.key));
  const chosen = ordered.slice(0, maxAxes);

  const labels: string[] = [];
  const valuesA: number[] = [];
  const valuesB: number[] = [];
  for (const s of chosen) {
    const a = s.a ?? 0;
    const b = s.b ?? 0;
    const max = Math.max(a, b);
    labels.push(s.label);
    valuesA.push(max > 0 ? Math.round((a / max) * 100) : 0);
    valuesB.push(max > 0 ? Math.round((b / max) * 100) : 0);
  }
  return { labels, valuesA, valuesB };
};

/** Shared number formatter: integer as-is, decimals to 2 places, null → "-". */
export const formatStatValue = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "-";
  return value % 1 === 0 ? value.toString() : value.toFixed(2);
};
