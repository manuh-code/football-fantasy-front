import { useUserStore } from '@/store';
import * as Ably from 'ably';

// ── Singleton: una sola conexión Ably para toda la aplicación ───
let ablyInstance: Ably.Realtime | null = null;

function getAblyInstance(): Ably.Realtime {
    const userStore = useUserStore();
    const userUuid = userStore.getUserData?.uuid ?? 'anonymous';
    
    ablyInstance ??= new Ably.Realtime({
        key: import.meta.env.VITE_ABLY_KEY,
        clientId: userUuid,
    });
    return ablyInstance;
}

export function useAblyBroadcast() {
    const ably = getAblyInstance();

    const userStore = useUserStore();

    const channel = (channelName: string) => {
        return ably.channels.get(channelName);
    }

    const inPlayChannel = channel('inplay-channel_' + userStore.getTimezone);
    const draftFantasyLeagueChannel = (leagueUuid: string) => channel(`draft-${leagueUuid}`);

    return { ably, channel, inPlayChannel, draftFantasyLeagueChannel }
}