// Per-position color treatment for lineup rows and empty slots.
// Full class strings (no interpolation) so Tailwind's JIT keeps them.

export type LineupVariant =
  | "goalkeeper"
  | "defender"
  | "midfielder"
  | "attacker"
  | "flex"
  | "bench";

// Position chip on a filled row (color only — the text comes from the player).
export const POSITION_BADGE: Record<LineupVariant, string> = {
  goalkeeper: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  defender: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  midfielder: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  attacker: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  flex: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  bench: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
};

// Quick-swap circular button surface.
export const SWAP_BUTTON: Record<LineupVariant, string> = {
  goalkeeper: "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30",
  defender: "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30",
  midfielder: "bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30",
  attacker: "bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30",
  flex: "bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30",
  bench: "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600",
};

export const SWAP_ICON: Record<LineupVariant, string> = {
  goalkeeper: "text-blue-500 dark:text-blue-400",
  defender: "text-green-500 dark:text-green-400",
  midfielder: "text-yellow-500 dark:text-yellow-400",
  attacker: "text-red-500 dark:text-red-400",
  flex: "text-purple-500 dark:text-purple-400",
  bench: "text-gray-500 dark:text-gray-400",
};

// Empty-slot position code chip, active (this position is being drafted) vs idle.
export const SLOT_BADGE_ACTIVE: Record<LineupVariant, string> = {
  goalkeeper: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  defender: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  midfielder: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
  attacker: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  flex: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  bench: "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300",
};

export const SLOT_BADGE_IDLE: Record<LineupVariant, string> = {
  goalkeeper: "bg-blue-50 dark:bg-blue-900/20 text-blue-400 dark:text-blue-500 opacity-60",
  defender: "bg-green-50 dark:bg-green-900/20 text-green-400 dark:text-green-500 opacity-60",
  midfielder: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-400 dark:text-yellow-500 opacity-60",
  attacker: "bg-red-50 dark:bg-red-900/20 text-red-400 dark:text-red-500 opacity-60",
  flex: "bg-purple-50 dark:bg-purple-900/20 text-purple-400 dark:text-purple-500 opacity-60",
  bench: "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 opacity-60",
};

// Row background tint when an empty slot is a valid drop target.
export const SLOT_TINT: Record<LineupVariant, string> = {
  goalkeeper: "bg-blue-50/50 dark:bg-blue-900/10",
  defender: "bg-green-50/50 dark:bg-green-900/10",
  midfielder: "bg-yellow-50/50 dark:bg-yellow-900/10",
  attacker: "bg-red-50/50 dark:bg-red-900/10",
  flex: "bg-purple-50/50 dark:bg-purple-900/10",
  bench: "bg-gray-50 dark:bg-gray-700/30",
};

// Short position code shown in an empty slot chip.
export const SLOT_CODE: Record<LineupVariant, string> = {
  goalkeeper: "GK",
  defender: "DF",
  midfielder: "MF",
  attacker: "FW",
  flex: "FX",
  bench: "BN",
};
