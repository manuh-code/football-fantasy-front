// Team statistics arrive in a standardized envelope: `value.main` is the
// headline figure the ranking is sorted by, `value.format` says how to render
// it, and `value.text` is a textual headline for stats without a number
// (only MOST_SCORED_HALF today). Breakdown-only stats have main = null.

import { t } from "@/i18n";
import type {
  StatDetail,
  StatPlayerRow,
  TeamValue,
} from "@/interfaces/football/team/FootballTeamTopStatisticResponse";

/** Headline scalar used to rank teams and size proportion bars. */
export const extractTeamStatValue = (
  value: TeamValue | null | undefined,
): number | null => value?.main ?? null;

// Integers as-is, fractional values to 2 decimals.
const toDisplayNumber = (n: number): string =>
  n % 1 === 0 ? String(n) : n.toFixed(2);

// Textual headlines come as stable identifiers (e.g. "2nd-half"); translate
// the ones we know and fall back to the raw value.
const TEXT_LABEL_KEYS: Record<string, string> = {
  "1st-half": "football.statistics.textValues.firstHalf",
  "2nd-half": "football.statistics.textValues.secondHalf",
};

/**
 * Display string for a team's stat value, following `format`:
 * integer/decimal as numbers, percentage with %, rating to 2 decimals,
 * minutes with the football ' notation. When `main` is null the textual
 * headline (`text`) is shown if present, otherwise "-".
 */
export const formatTeamStatValue = (
  value: TeamValue | null | undefined,
): string => {
  if (!value) return "-";
  if (value.main === null) {
    if (!value.text) return "-";
    const labelKey = TEXT_LABEL_KEYS[value.text];
    return labelKey ? t(labelKey) : value.text;
  }
  switch (value.format) {
    case "percentage":
      return `${toDisplayNumber(value.main)}%`;
    case "rating":
      return value.main.toFixed(2);
    case "minutes":
      return `${toDisplayNumber(value.main)}'`;
    case "decimal":
    case "integer":
    default:
      return toDisplayNumber(value.main);
  }
};

/** Whether a team's value has anything to show in an expandable detail. */
export const hasTeamStatDetail = (
  value: TeamValue | null | undefined,
): boolean => !!value && (value.details.length > 0 || value.players.length > 0);

// Translate a stable text identifier ("2nd-half"), falling back to the raw value.
const statText = (text: string): string => {
  const labelKey = TEXT_LABEL_KEYS[text];
  return labelKey ? t(labelKey) : text;
};

// Minute buckets ("0-15" … "75-90") render as ranges, not dictionary lookups.
const BUCKET_RE = /^\d+-\d+$/;

/**
 * Human label for a detail row key. Known keys come from the i18n dictionary
 * (dots become underscores: "home.average" → detailKeys.home_average);
 * unknown ones fall back to a prettified version of the key itself.
 */
export const teamStatDetailLabel = (key: string): string => {
  if (BUCKET_RE.test(key)) return `${key}'`;
  const i18nKey = `football.statistics.detailKeys.${key.replace(/\./g, "_")}`;
  const label = t(i18nKey);
  if (label !== i18nKey) return label;
  const pretty = key
    .split(".")
    .map((segment) => segment.replace(/_/g, " "))
    .join(" · ");
  return pretty.charAt(0).toUpperCase() + pretty.slice(1);
};

/** Display string for a detail row's value. */
export const formatStatDetailValue = (detail: StatDetail): string => {
  if (detail.value === null) return "-";
  if (typeof detail.value === "string") return statText(detail.value);
  return toDisplayNumber(detail.value);
};

/** Display string for a detail row's paired percentage ("57.69%"). */
export const formatStatPercentage = (percentage: number): string =>
  `${toDisplayNumber(percentage)}%`;

/** Human label for a player row key (most_carded_player, most_injured, …). */
export const teamStatPlayerLabel = (key: string): string => {
  const i18nKey = `football.statistics.playerKeys.${key}`;
  const label = t(i18nKey);
  return label !== i18nKey ? label : key.replace(/_/g, " ");
};

/**
 * Secondary text for a player row: the metric (`value`) and/or the extras in
 * `meta` ({in, out} for most_substituted, {team} for national_team_player).
 */
export const teamStatPlayerInfo = (row: StatPlayerRow): string | null => {
  const parts: string[] = [];
  if (row.value !== null) parts.push(toDisplayNumber(row.value));
  const meta = row.meta;
  if (meta) {
    if (typeof meta.in === "number" && typeof meta.out === "number") {
      parts.push(
        t("football.statistics.playerMeta.subs", {
          in: meta.in,
          out: meta.out,
        }),
      );
    } else if (typeof meta.team === "string") {
      parts.push(meta.team);
    }
  }
  return parts.length > 0 ? parts.join(" · ") : null;
};
