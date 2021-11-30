import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
	plugins: [vue(), vueJsx()],
	resolve: {
		alias: {
			'@': '/src'
		}
	},
	server: {
		host: '0.0.0.0',
		port: 8991,
		// 是否开启 https
		https: false
	},
	base: './'
})
