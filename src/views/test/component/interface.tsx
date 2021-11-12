import { defineComponent, PropType, renderSlot } from 'vue'
import './index.scss'
const propsData = {
	sourceData: {
		required: true,
		type: Array as PropType<any[]>,
		default() {
			return []
		}
	},
	labelName: {
		type: String as PropType<string>,
		default: 'label'
	},
	expand: {
		type: Array as PropType<any[]>,
		default() {
			return []
		}
	},
	value: {
		type: String as PropType<string>,
		default: ''
	}
}
export default defineComponent({
	name: 'TestMZC',
	props: propsData,
	setup(props, { emit, slots }) {
		function itemCLick(item: ObjectMap) {
			if (!item.value) return
			const expand = props.expand.map((res) => res)
			if (expand.includes(item.value)) {
				expand.splice(expand.indexOf(item.value), 1)
			} else {
				expand.push(item.value)
			}
			emit('update:expand', expand)
		}
		function resCLick(res: ObjectMap) {
			emit('update:value', res.value)
			emit('resCLick', res)
		}
		return () => (
			<a-card class="interface">
				{renderSlot(slots, 'header')}
				{props.sourceData.map((item: any) => {
					return (
						<div>
							<a-button block type="primary" onClick={() => itemCLick(item)}>
								{item[props.labelName]}
							</a-button>
							{item.value &&
								props.expand.includes(item.value) &&
								item.children &&
								item.children.map((res: ObjectMap) => {
									return (
										<a-button onClick={() => resCLick(res)} type={res.value === props.value ? 'link' : 'text'} block>
											{res[props.labelName]}
										</a-button>
									)
								})}
							<a-divider style="height: 2px;margin:1px 0;" />
						</div>
					)
				})}
			</a-card>
		)
	}
})
