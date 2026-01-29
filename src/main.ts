import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { iconList } from './icons'


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
app.use(router);

// Mount the app
app.mount('#app')
