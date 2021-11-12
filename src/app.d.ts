declare module '*.vue' {
	import { DefineComponent } from 'vue'
	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
	const component: DefineComponent<{}, {}, any>
	export default component
}
declare module 'vue-json-viewer' {}

type ObjectMap<Key extends string | number | symbol = any, Value = any> = {
	[key in Key]: Value
}
