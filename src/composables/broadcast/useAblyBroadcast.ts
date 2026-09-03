import { useUserStore } from '@/store';
import * as Ably from 'ably';

// ── Singleton: una sola conexión Ably para toda la aplicación ───
let ablyInstance: Ably.Realtime | null = null;
/** Con qué `clientId` se construyó `ablyInstance`. Ver `getAblyInstance`. */
let ablyClientId: string | null = null;

/**
 * El cliente Ably de la app, **atado a quién es el usuario ahora mismo**.
 *
 * El `clientId` se fija al construir el cliente y Ably **no deja cambiarlo en
 * caliente**. Y este singleton lo creaba el primer componente que pidiera un
 * canal — los carruseles de partidos de la portada, entre otros —, que corren
 * antes de que la sesión esté hidratada. El cliente se quedaba con
 * `clientId: 'anonymous'` para el resto de la sesión, incluso después de
 * iniciar sesión.
 *
 * No era cosmético. El servidor decide quién está en la sala del draft
 * comparando el `clientId` del presence set contra el uuid del usuario
 * (`DraftPresenceService::inspectRoom`). Con `anonymous` no casa nunca, así
 * que a quien tenía el turno se le daba por ausente **estando dentro**: se le
 * recortaba el reloj a 30 segundos y se fichaba por él. La lista de la sala no
 * lo delataba, porque esa se pinta con el `data` de cada miembro, que sí lleva
 * el uuid bueno — de ahí que se viera "4 de 4 conectados" y "No está en la
 * sala" a la vez.
 *
 * Rehacer el cliente es la única salida posible, y es lo mismo que hace el
 * cliente móvil al cambiar de identidad (`RealtimeTransport.shutdown`). El
 * coste: los canales que otro componente ya tuviera en la mano quedan mudos
 * hasta que se remonte. En la práctica la identidad solo cambia al entrar o
 * salir de la sesión, y las dos cosas cambian de ruta.
 */
function getAblyInstance(): Ably.Realtime {
    const userStore = useUserStore();
    const userUuid = userStore.getUserData?.uuid ?? 'anonymous';

    if (ablyInstance && ablyClientId !== userUuid) {
        console.debug(`[ably] la identidad cambió (${ablyClientId} -> ${userUuid}): se rehace el cliente`);
        ablyInstance.close();
        ablyInstance = null;
    }

    if (!ablyInstance) {
        ablyClientId = userUuid;
        ablyInstance = new Ably.Realtime({
            key: import.meta.env.VITE_ABLY_KEY,
            clientId: userUuid,
        });
    }

    return ablyInstance;
}

export function useAblyBroadcast() {
    const ably = getAblyInstance();

    const userStore = useUserStore();

    const channel = (channelName: string) => {
        return ably.channels.get(channelName);
    }

    const inPlayChannel = channel('inplay-channel_' + userStore.getTimezone);

    // Live score/state/clock updates for every fixture list. Timezone-agnostic on
    // purpose: the payload carries only fields that change during a match, never
    // kickoff dates, so one channel serves all viewers (see FixtureLiveResource).
    const liveFixturesChannel = channel('live-fixtures');

    // Match center uses two channels per fixture:
    //  - base channel `match-center-fixture-{uuid}` → presence only (we enter it
    //    announcing our timezone so the backend knows which localized channel to
    //    publish to).
    //  - localized channel `match-center-fixture-{uuid}_{tz}` → all live events,
    //    with dates already converted to the viewer's timezone.
    const matchCenterFixtureChannel = (fixtureUuid: string) => channel(`match-center-fixture-${fixtureUuid}`);
    const matchCenterFixtureLocalizedChannel = (fixtureUuid: string) => channel(`match-center-fixture-${fixtureUuid}_${userStore.getTimezone}`);

    // Canal personal de avisos (la campanita). Uno por usuario: es lo único que
    // el backend conoce del destinatario cuando publica.
    const userNoticesChannel = (userUuid: string) => channel(`user-notices-${userUuid}`);

    const draftFantasyLeagueChannel = (leagueUuid: string) => channel(`draft-${leagueUuid}`);
    const fantasyLeagueChannel = (leagueUuid: string) => channel(`fantasy-league-${leagueUuid}`);
    const draftRoomChannel = (draftUuid: string) => channel(`draft-${draftUuid}`);

    return { ably, channel, inPlayChannel, liveFixturesChannel, matchCenterFixtureChannel, matchCenterFixtureLocalizedChannel, userNoticesChannel, draftFantasyLeagueChannel, fantasyLeagueChannel, draftRoomChannel }
}