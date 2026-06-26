import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { iconList } from './icons'
import { i18n, setI18nLocale } from './i18n'
import { useLocaleStore } from './store/locale'


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
