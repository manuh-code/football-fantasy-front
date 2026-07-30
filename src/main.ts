import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { iconList } from './icons'
import { i18n, setI18nLocale } from './i18n'
import { useLocaleStore } from './store/locale'
import { useAuthStore } from './store/auth/useAuthStore'
import { preloadStripe } from './composables/useStripePaymentElement'


// Import global styles
import './assets/styles/main.scss';
import 'vue-multiselect/dist/vue-multiselect.css';
import { createPinia } from 'pinia';




const app = createApp(App);
const pinia = createPinia();

// Add icons to Oh My Vue Icons
addIcons(...iconList);
pinia.use(piniaPluginPersistedstate);

// Register global components
app.component('v-icon', OhVueIcon)

// Use plugins
app.use(pinia);

// Sync the persisted locale (restored from localStorage by the persist plugin)
// into vue-i18n before mounting the app.
const localeStore = useLocaleStore();
setI18nLocale(localeStore.locale);

app.use(router);
app.use(i18n);

// Mount the app
app.mount('#app')

// Hide the splash screen (defined inline in index.html) once the app is ready.
function hideSplash() {
  const splash = document.getElementById('app-splash')
  if (!splash) return
  splash.classList.add('is-hidden')
  splash.addEventListener('transitionend', () => splash.remove(), { once: true })
  // Fallback in case transitionend doesn't fire (e.g. reduced motion).
  setTimeout(() => splash.remove(), 600)
}
// Wait for the app's first paint before starting the fade-out.
requestAnimationFrame(() => requestAnimationFrame(hideSplash))

// Stripe.js is fetched once the app goes idle so opening the "add card" form
// never waits on the script. Signed-in sessions only: anonymous visitors can't
// reach billing, and Stripe.js drops its own cookies on every page it loads on.
function preloadStripeWhenIdle() {
  if (!useAuthStore().token) return
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => preloadStripe(), { timeout: 3000 })
    return
  }
  setTimeout(preloadStripe, 2000)
}
preloadStripeWhenIdle()
