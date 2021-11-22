import { defineComponent, PropType, ref } from 'vue'
const propsData = {
	sourceData: {
		required: true,
		type: Object as PropType<ObjectMap>,
		default() {
			return {}
		}
	}
}
export default defineComponent({
	name: 'dataProcessing',
	props: propsData,
	setup(props) {
		const dataProcessing = ref()
		return () => (
			<>
				<a-textarea v-model={[dataProcessing.value, 'value']} />
				<a-button
					onClick={() => {
						console.log(dataProcessing.value)
					}}
				>
					确定
				</a-button>
			</>
		)
	}
})
