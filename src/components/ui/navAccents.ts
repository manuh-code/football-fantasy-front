/**
 * The accent palette shared by every navigation surface: the floating bottom
 * bar, and the section tabs whether they sit up top or inside the content.
 *
 * A section keeps its colour wherever its options are shown — pools stay blue,
 * survivor stays red — so these maps have to be the same everywhere. They used
 * to be copy-pasted per component, which is a slow way to end up with two
 * slightly different reds.
 *
 * The class strings are written out in full on purpose: Tailwind scans source
 * text, so an interpolated `bg-${accent}-500/15` would be purged from the build.
 */
export type NavAccent =
  | "blue"
  | "emerald"
  | "orange"
  | "red"
  | "purple"
  | "sky"
  | "amber";

/** Label + glyph colour for the active option. */
export const ACCENT_TEXT: Record<NavAccent, string> = {
  blue: "text-blue-600 dark:text-blue-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  orange: "text-orange-600 dark:text-orange-400",
  red: "text-red-600 dark:text-red-400",
  purple: "text-purple-600 dark:text-purple-400",
  sky: "text-sky-600 dark:text-sky-400",
  amber: "text-amber-600 dark:text-amber-400",
};

/**
 * The chip that slides beneath the active option: a tint plus a crisp inset
 * ring, so the selection reads as a raised key rather than a ghost of one.
 */
export const ACCENT_CHIP: Record<NavAccent, string> = {
  blue: "bg-blue-500/15 ring-1 ring-inset ring-blue-500/30 dark:bg-blue-400/15 dark:ring-blue-400/30",
  emerald: "bg-emerald-500/15 ring-1 ring-inset ring-emerald-500/30 dark:bg-emerald-400/15 dark:ring-emerald-400/30",
  orange: "bg-orange-500/15 ring-1 ring-inset ring-orange-500/30 dark:bg-orange-400/15 dark:ring-orange-400/30",
  red: "bg-red-500/15 ring-1 ring-inset ring-red-500/30 dark:bg-red-400/15 dark:ring-red-400/30",
  purple: "bg-purple-500/15 ring-1 ring-inset ring-purple-500/30 dark:bg-purple-400/15 dark:ring-purple-400/30",
  sky: "bg-sky-500/15 ring-1 ring-inset ring-sky-500/30 dark:bg-sky-400/15 dark:ring-sky-400/30",
  amber: "bg-amber-500/15 ring-1 ring-inset ring-amber-500/30 dark:bg-amber-400/15 dark:ring-amber-400/30",
};

/**
 * One option in a nav bar or tab strip.
 *
 * `accent` omitted means the option never highlights — the shape pools and
 * survivor use for the neutral shortcut that leads back out of the section.
 * Strips whose options should all highlight set a `defaultAccent` instead of
 * repeating the colour on every item.
 */
export interface NavItem<K extends string = string> {
  key: K;
  label: string;
  icon: string;
  accent?: NavAccent;
  disabled?: boolean;
}
