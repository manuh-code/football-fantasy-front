// Google AdSense configuration.
//
// IMPORTANT (policy): Do NOT enable "Auto ads" in the AdSense dashboard for this
// app. It injects ads on every screen — including login, league selection, the
// gaming hub, 404 and empty/loading states — which violates the "ads on screens
// without publisher content" policy. We render ONLY manual <AdUnit> units, placed
// inside content-rich components and gated on real content being present.

export const ADSENSE_CLIENT = "ca-pub-9871390969430404";

// Create each ad unit in your AdSense dashboard (Ads → By ad unit → Display ads)
// and paste its numeric slot id here. While a value still starts with "[" the
// unit stays disabled and renders nothing, so it is safe to ship before you have
// the real ids.
export const AD_SLOTS = {
  /** Below the Home content panels (standings / fixtures / statistics). */
  homeContent: "[HOME_CONTENT_SLOT_ID]",
  /** In-feed unit after the pool standings list. */
  poolStandings: "[POOL_STANDINGS_SLOT_ID]",
} as const;

export type AdSlotKey = keyof typeof AD_SLOTS;
