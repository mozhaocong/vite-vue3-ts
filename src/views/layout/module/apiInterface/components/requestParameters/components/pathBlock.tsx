import { defineComponent, PropType } from 'vue'
const propsData = {
	reqData: {
		required: true,
		type: Object as PropType<{ value: string; label: string; data: ObjectMap }>,
		default() {
			return {}
		}
	}
}
export default defineComponent({
	name: 'apiInterface',
	props: propsData,
	setup(props) {
		return () => <div>{props.reqData.value}</div>
	}
})
