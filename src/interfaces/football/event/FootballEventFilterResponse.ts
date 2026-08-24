import { TypeResponse } from "../type/TypeResponse";

/**
 * The event types present in a fixture, for the timeline's filter chips.
 *
 * **It is a bare array, not an object with an `eventTypes` key.** This interface
 * used to declare `{ eventTypes: TypeResponse[] | null }`, which meant every read
 * of `eventFilters?.eventTypes` returned `undefined` and the timeline silently
 * fell through to deriving the types from the events themselves. The API emits
 * `$events->pluck('type')->unique()->values()` — verified against production on
 * 2026-08-23 — so the array is what actually arrives.
 *
 * Entries can be `[]` rather than an object: `TypeResource` returns `[]` when its
 * model is null, and an empty PHP array serialises as a JSON array. Consumers
 * filter on `developer_name` being present, which drops those.
 */
export type FootballEventFilterResponse = TypeResponse[];
