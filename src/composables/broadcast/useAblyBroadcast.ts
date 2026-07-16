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

    // Match center uses two channels per fixture:
    //  - base channel `match-center-fixture-{uuid}` → presence only (we enter it
    //    announcing our timezone so the backend knows which localized channel to
    //    publish to).
    //  - localized channel `match-center-fixture-{uuid}_{tz}` → all live events,
    //    with dates already converted to the viewer's timezone.
    const matchCenterFixtureChannel = (fixtureUuid: string) => channel(`match-center-fixture-${fixtureUuid}`);
    const matchCenterFixtureLocalizedChannel = (fixtureUuid: string) => channel(`match-center-fixture-${fixtureUuid}_${userStore.getTimezone}`);

    const draftFantasyLeagueChannel = (leagueUuid: string) => channel(`draft-${leagueUuid}`);
    const fantasyLeagueChannel = (leagueUuid: string) => channel(`fantasy-league-${leagueUuid}`);
    const draftRoomChannel = (draftUuid: string) => channel(`draft-${draftUuid}`);

    return { ably, channel, inPlayChannel, matchCenterFixtureChannel, matchCenterFixtureLocalizedChannel, draftFantasyLeagueChannel, fantasyLeagueChannel, draftRoomChannel }
}