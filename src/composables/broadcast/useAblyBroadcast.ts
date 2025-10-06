import { useUserStore } from '@/store';
import * as Ably from 'ably';

export function useAblyBroadcast() {
    const ably = new Ably.Realtime({
        key: import.meta.env.VITE_ABLY_KEY, // 🔑 la public key de Ably
        clientId: "vue-client-" + Math.random().toString(36).substring(2, 8),
    });

    const userStore = useUserStore();

    const channel = (channelName: string) => {
        return ably.channels.get(channelName);
    }

    const inPlayChannel = channel('inplay-channel_' + userStore.getTimezone);

    return { ably, channel, inPlayChannel }
}