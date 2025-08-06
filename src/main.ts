import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import { pinia } from './store'
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { iconList } from './icons'

// Import global styles
import './assets/styles/main.scss'

// Add icons to Oh My Vue Icons
addIcons(...iconList)

const app = createApp(App)

// Register global components
app.component('v-icon', OhVueIcon)

// Use plugins
app.use(pinia)
app.use(router)

// Mount the app
app.mount('#app')
