import { onMounted, onUnmounted, ref } from "vue";
import type { FootballFixtureResponse } from "@/interfaces/football/fixture/FootballFixtureResponse";

// Fixture list/detail views only get `currentperiod` as a one-off REST snapshot
// (no per-second push), so the running match minute is extrapolated client-side
// from that snapshot instead. A single shared 1s interval drives every visible
// clock — one setInterval for the whole app, not one per fixture card.
const tick = ref(Date.now());
let subscribers = 0;
let intervalId: ReturnType<typeof setInterval> | null = null;

const subscribe = () => {
  if (subscribers === 0) {
    intervalId = setInterval(() => {
      tick.value = Date.now();
    }, 1000);
  }
  subscribers++;
};

const unsubscribe = () => {
  subscribers = Math.max(0, subscribers - 1);
  if (subscribers === 0 && intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

/** Subscribes the calling component to the shared 1s tick for as long as it's mounted. */
export function useLiveMatchClockTick() {
  onMounted(subscribe);
  onUnmounted(unsubscribe);
  return tick;
}

const parseMinuteAndSeconds = (value: string): number => {
  const [m, s] = value.split(":").map((part) => parseInt(part, 10));
  if (Number.isNaN(m)) return 0;
  return m * 60 + (Number.isNaN(s) ? 0 : s);
};

// Last snapshot seen per fixture (base seconds + the local instant it was
// captured), so re-renders extrapolate from the same anchor instead of resetting
// the clock every tick. A new snapshot value (fresh API payload) replaces it.
const snapshots = new Map<string, { signature: string; baseSeconds: number; capturedAt: number }>();

const captureSnapshot = (fixture: FootballFixtureResponse) => {
  const period = fixture.currentperiod;
  if (!period) return null;
  const signature = `${period.minute}|${period.minute_and_seconds}|${period.added_time ?? ""}`;
  const cached = snapshots.get(fixture.uuid);
  if (cached && cached.signature === signature) return cached;
  const baseSeconds = period.minute_and_seconds
    ? parseMinuteAndSeconds(period.minute_and_seconds)
    : period.minute * 60;
  const entry = { signature, baseSeconds, capturedAt: Date.now() };
  snapshots.set(fixture.uuid, entry);
  return entry;
};

/**
 * Formats a fixture's running match minute (e.g. "23'", "45+2'") from
 * `currentperiod`, ticking it forward client-side between snapshots.
 * Pass `paused: true` (e.g. half time) to freeze the displayed minute without
 * discarding the snapshot. Returns "" when the fixture carries no live clock.
 */
export function formatLiveMatchClock(
  fixture: FootballFixtureResponse,
  nowMs: number,
  options: { paused?: boolean } = {},
): string {
  const period = fixture.currentperiod;
  if (!period) return "";
  const snapshot = captureSnapshot(fixture);
  if (!snapshot) return "";

  if (period.added_time) {
    // Stoppage time is announced as a fixed extra allowance (e.g. "+3"), not a
    // live sub-clock — show the regular-time minute it was signaled at plus that
    // allowance rather than guessing how far into it we are.
    return `${period.minute}+${period.added_time}'`;
  }

  const elapsedSeconds = options.paused ? 0 : Math.max(0, (nowMs - snapshot.capturedAt) / 1000);
  const minute = Math.floor((snapshot.baseSeconds + elapsedSeconds) / 60);
  return `${minute}'`;
}

/** Forgets a fixture's cached clock snapshot (e.g. once it's finished). */
export function clearLiveMatchClock(fixtureUuid: string): void {
  snapshots.delete(fixtureUuid);
}
