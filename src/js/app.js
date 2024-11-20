//import './startup/theme.js';
//import './startup/bootstrap.js';
import '../css/app.css';
import App from './App.vue'
import { createApp, h } from 'vue';

const appName = window
    .document
    .getElementsByTagName('title')[0]?.innerText || 'OpenQDA Editor dev';


const app = createApp(App)
app.mount('#app')
