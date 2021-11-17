import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
const history = createWebHistory()
const routes: Array<RouteRecordRaw> = [
	{
		path: '/',
		name: 'home',
		component: () => import('../views/home/index.vue')
	},
	{
		path: '/test',
		name: 'test',
		component: () => import('../views/test/index')
	},
	{
		path: '/testJSON',
		name: 'testJSON',
		component: () => import('../views/testJSON/index')
	},
	{
		path: '/layout',
		name: 'layout',
		component: () => import('../views/layout/index')
	}
]
const router = createRouter({
	history,
	routes
})
export default router
