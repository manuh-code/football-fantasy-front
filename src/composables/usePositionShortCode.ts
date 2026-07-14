import { useI18n } from "vue-i18n";

/**
 * Maps the stable `developer_name` position enum to the i18n key holding its
 * short, localized abbreviation. The API only returns the full position name
 * (e.g. "Portero"/"Goalkeeper"), so the short badge label is built on the front
 * and translated (see `fantasy.positionsShort.*`).
 */
const DEV_NAME_TO_KEY: Record<string, string> = {
  GOALKEEPER: "goalkeeper",
  DEFENDER: "defender",
  MIDFIELDER: "midfielder",
  ATTACKER: "attacker",
  FLEX: "flex",
  BENCH: "bench",
};

/**
 * Returns a resolver that turns a position `developer_name` into its short,
 * localized abbreviation (e.g. GOALKEEPER → "POR"/"GK"). Unknown values fall
 * back to the first 3 letters of the developer name (never the raw `code`,
 * which must not be translated/shown).
 */
export function usePositionShortCode() {
  const { t } = useI18n();

  return (developerName: string | null | undefined): string => {
    const key = developerName ? DEV_NAME_TO_KEY[developerName] : undefined;
    if (key) return t(`fantasy.positionsShort.${key}`);
    return developerName?.slice(0, 3).toUpperCase() || "?";
  };
}
