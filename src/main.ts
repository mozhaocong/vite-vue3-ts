import { createApp } from 'vue'
import App from './App.vue'
import router from "./router"
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
const app = createApp(App)
app.use(Antd);

import axios, { AxiosInstance } from "axios";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $http: AxiosInstance;
  }
}

app.config.globalProperties.$http = axios;
app.use(router).mount('#app')
