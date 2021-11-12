import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import JsonViewer from 'vue3-json-viewer'
import 'ant-design-vue/dist/antd.css'
const app = createApp(App)
app.use(Antd)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
app.use(JsonViewer)

import axios, { AxiosInstance } from 'axios'

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$http: AxiosInstance
	}
}

app.config.globalProperties.$http = axios
app.use(router).mount('#app')
