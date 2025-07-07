import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

window.Pusher = Pusher;

// ✅ Ambil token dari localStorage (JWT)
const token = localStorage.getItem('token') ?? '';

// ✅ Host dan Port Pusher WebSocket
const host = import.meta.env.VITE_PUSHER_HOST || window.location.hostname;
const port = parseInt(import.meta.env.VITE_PUSHER_PORT || '6001', 10);
const useTLS = import.meta.env.VITE_PUSHER_USE_TLS === 'true';

// ✅ API URL base (tanpa /api) untuk endpoint auth
const authBaseURL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || '/panel';

// ✅ Buat instance Echo
const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY!,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
  wsHost: host,
  wsPort: port,
  wssPort: port,
  forceTLS: useTLS,
  disableStats: true,
  enabledTransports: useTLS ? ['wss'] : ['ws'],
  authEndpoint: `${authBaseURL}/broadcasting/auth`,
  auth: {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
});

export const echoInstance = echo;
export default echo;
