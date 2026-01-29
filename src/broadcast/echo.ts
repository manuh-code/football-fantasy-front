import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
    }
}

window.Pusher = Pusher;

export const echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_ABLY_PUBLIC_KEY,
    wsHost: 'realtime-pusher.ably.io',
    wsPort: 443,
    // pusher-js expects a cluster option; provide a sensible default or read from env
    cluster: import.meta.env.VITE_ABLY_CLUSTER || 'mt1',
    forceTLS: true,
    disableStats: true,
    encrypted: true,
});
