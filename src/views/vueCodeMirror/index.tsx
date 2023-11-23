import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { Button } from 'ant-design-vue'

export default defineComponent({
	name: 'VueCodeMirror',
	props: {},
	emits: ['update:value'],

	setup(props, { emit }) {
		const codemirrorData = ref()
		// console.log('Codemirror', Codemirror)
		function showValue() {
			console.log(codemirrorData.value)
		}
		return () => (
			<>
				<Codemirror
					style={{ height: '400px' }}
					v-model={[codemirrorData.value]}
					extensions={[javascript(), oneDark]}
				></Codemirror>
				<Button onClick={showValue}>查看数据</Button>
			</>
		)
	}
})
