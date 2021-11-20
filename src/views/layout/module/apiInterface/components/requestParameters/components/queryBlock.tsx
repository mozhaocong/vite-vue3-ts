import { defineComponent, PropType, ref, computed, watch } from 'vue'
import { Modal } from 'ant-design-vue'
import { clone } from '@/utils/data'
const propsData = {
	reqData: {
		required: true,
		type: Object as PropType<{ value: string; label: string; data: any[] }>,
		default() {
			return {}
		}
	}
}
export default defineComponent({
	name: 'apiInterfaceQuery',
	props: propsData,
	setup(props) {
		const reqData = ref<any[]>([])
		watch(
			() => props.reqData.data,
			(data) => {
				if (!data) return
				const item = clone(data)
				const judgeObjet: ObjectMap = {}
				for (let i = item.length - 1; i >= 0; i--) {
					if (judgeObjet[item[i].key]) {
						item.splice(i, 1)
					} else {
						judgeObjet[item[i].key] = true
					}
				}
				reqData.value = item
			},
			{ deep: true, immediate: true }
		)
		const filterCheckedList = ref([])
		const defaultBlock = computed(() => {
			return (
				<a-row gutter={[16, 16]}>
					<a-col span={8}>参数名称</a-col>
					<a-col span={8}>参数说明</a-col>
					<a-col span={4}>数据类型</a-col>
					<a-col span={4}>是否必须</a-col>
					{reqData.value.map((item) => {
						return (
							<>
								<a-col span={8}>{item.key}</a-col>
								<a-col span={8}>{item.description}</a-col>
								<a-col span={4}>{item.type}</a-col>
								<a-col span={4}>{item.required || 'false'}</a-col>
							</>
						)
					})}
				</a-row>
			)
		})

		const filterOptions = computed(() => {
			const data = reqData.value
			return data.map((item) => {
				return item.key
			})
		})
		const filterModal = ref(false)

		return () => (
			<>
				<a-space size={15}>
					<div>参数名称： {props.reqData.value}</div>
					<a-button onClick={() => (filterModal.value = true)}>过滤字段</a-button>
				</a-space>
				<a-divider />
				<a-modal v-model={[filterModal.value, 'visible']} title="过滤字段" width="70vw">
					<a-checkbox-group v-model={[filterCheckedList.value, 'checkedList']} options={filterOptions.value}>
						<a-row></a-row>
					</a-checkbox-group>
				</a-modal>
				{props.reqData.data && props.reqData.data.length && defaultBlock.value}
			</>
		)
	}
})
