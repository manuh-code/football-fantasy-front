import type * as Ably from "ably";
import { useAblyClient } from "./useAblyClient";

export function useAblyChannel(channelName: string): Ably.Types.RealtimeChannelCallbacks {
  const ably = useAblyClient();
  return ably.channels.get(channelName);
}