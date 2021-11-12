import { defineComponent, ref } from 'vue'
import './index.scss'
export default defineComponent({
	setup() {
		const data = ref({ data: { data: { data: 1 } } })
		return () => <json-viewer value={data.value} />
	}
})
