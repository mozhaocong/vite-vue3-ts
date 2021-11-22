import { defineComponent, PropType, ref } from 'vue'
import { last } from 'ramda'
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
		const list = /(const | let).*=/
		function textClick() {
			// const data = dataProcessing.value.match(list)
			const data = dataProcessing.value.split(list)
			const testData = last(data)
			console.log(JSON.parse(testData))
		}
		return () => (
			<>
				<a-textarea v-model={[dataProcessing.value, 'value']} />
				<a-button
					onClick={() => {
						textClick()
					}}
				>
					确定
				</a-button>
			</>
		)
	}
})
