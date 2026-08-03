import { onBeforeUnmount, onMounted } from "vue";
import type { Types } from "ably";
import { useAblyBroadcast } from "@/composables/broadcast/useAblyBroadcast";
import type { FootballFixtureResponse } from "@/interfaces/football/fixture/FootballFixtureResponse";
import type { FootballFixtureLiveResponse } from "@/interfaces/football/fixture/FootballFixtureLiveResponse";

const LIVE_FIXTURES_EVENT = "fixtures-updated";

/**
 * Applies one live patch onto a fixture already rendered in a list, mutating it
 * in place so Vue's reactivity carries the change down to the cards.
 *
 * Only the moving parts are touched (state, live flags, clock, score). Kickoff
 * dates, teams and venues are left exactly as the REST payload delivered them —
 * the broadcast doesn't carry them, and overwriting them with `undefined` would
 * blank out the card.
 */
const applyPatch = (
  fixture: FootballFixtureResponse,
  patch: FootballFixtureLiveResponse,
): void => {
  if (patch.state) fixture.state = patch.state;
  if (patch.is_inplay != null) fixture.is_inplay = patch.is_inplay;
  if (patch.is_finished != null) fixture.is_finished = patch.is_finished;
  if (patch.result_info != null) fixture.result_info = patch.result_info;
  fixture.live_clock = patch.live_clock ?? null;

  if (patch.scores?.length) fixture.scores = patch.scores;

  // The list reads the score from `participants[].current_score` first, so the
  // per-side goals have to land there too — updating `scores` alone would leave
  // the visible scoreboard stale.
  for (const participant of fixture.participants ?? []) {
    const side = participant.meta?.location;
    if (side !== "home" && side !== "away") continue;
    const goals = patch.current_scores?.[side];
    if (goals == null) continue;
    if (participant.current_score) {
      participant.current_score.score = goals;
    } else {
      participant.current_score = { score: goals, participant: side, description: "CURRENT" };
    }
  }
};

/**
 * Subscribes the calling component to live fixture updates for as long as it's
 * mounted, and applies each incoming patch to whatever fixtures the provided
 * resolver hands back.
 *
 * The resolver is called per message (rather than taking a fixed array) so a
 * panel that swaps its list — a different round, a different stage, a team's
 * schedule — keeps receiving updates without re-subscribing.
 */
export function useLiveFixtures(resolveFixtures: () => FootballFixtureResponse[]): void {
  const { liveFixturesChannel } = useAblyBroadcast();

  const onLiveUpdate = (msg: Types.Message) => {
    const patches = (Array.isArray(msg.data) ? msg.data : [msg.data]) as FootballFixtureLiveResponse[];
    if (patches.length === 0) return;

    const byUuid = new Map(patches.filter((p) => p?.uuid).map((p) => [p.uuid, p]));
    if (byUuid.size === 0) return;

    for (const fixture of resolveFixtures()) {
      const patch = byUuid.get(fixture.uuid);
      if (patch) applyPatch(fixture, patch);
    }
  };

  onMounted(() => {
    liveFixturesChannel.subscribe(LIVE_FIXTURES_EVENT, onLiveUpdate);
  });

  onBeforeUnmount(() => {
    liveFixturesChannel.unsubscribe(LIVE_FIXTURES_EVENT, onLiveUpdate);
  });
}
