// Player statistics return a flat scalar `value` as a string ("13", "7.49",
// "807"). Display integers as-is and keep decimals to two places.

/** Display string: integer as-is, decimals to 2 places, non-numeric → "-". */
export const formatPlayerStatValue = (value: string | null | undefined): string => {
  if (value == null || value === "") return "-";
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return value;
  return n % 1 === 0 ? String(n) : n.toFixed(2);
};
