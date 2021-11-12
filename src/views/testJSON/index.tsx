import { defineComponent, ref } from 'vue'
export default defineComponent({
	setup() {
		const data = ref({ data: { data: { data: 1 } } })
		return () => (
			<>
				<div>123</div>
				<json-viewer value={data.value} copyable boxed sort />
			</>
		)
	}
})
