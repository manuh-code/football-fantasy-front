import * as Ably from 'ably';
const ably = new Ably.Realtime({
    key: import.meta.env.VITE_ABLY_KEY, // 🔑 la public key de Ably
    clientId: "vue-client-" + Math.random().toString(36).substring(2, 8), // opcional
});

export default ably;