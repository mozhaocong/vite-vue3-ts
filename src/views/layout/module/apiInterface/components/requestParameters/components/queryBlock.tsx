import { defineComponent, PropType, ref, computed, watch, inject } from 'vue'
import { ArrayKeyToObjet, clone, setObjetToObject } from '@/utils/data'
import { apiInterfacePropsData, reqDataType } from '@/views/layout/tsType'
import { compileApiModule } from '@/store/modules/compileApi'
import DataProcessing from './dataProcessing'

const propsData = {
	reqData: {
		required: true,
		type: Object as PropType<{ value: string; label: string; data: reqDataType[] }>,
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
		let descriptionObjectData: ObjectMap = {}
		const getApiInterfacePropsData = inject('apiInterfacePropsData') as () => apiInterfacePropsData
		let apiInterfacePropsData = getApiInterfacePropsData()
		const paramsMappingValue = ref<string>('')
		const paramsMappingList = ref<reqDataType[]>([])

		watch(
			() => props.reqData.data,
			(data) => {
				initMappingList()
				compileApiObjectInit()
				setReqData()
			},
			{ deep: true, immediate: true }
		)
		function initMappingList() {
			paramsMappingList.value = []
			paramsMappingValue.value = ''
		}

		function compileApiObjectInit() {
			apiInterfacePropsData = getApiInterfacePropsData()
			initCompileApiMappingList()
		}

		function setReqData() {
			if (!props.reqData.data) return
			const item = clone(props.reqData.data)
			const judgeObjet: ObjectMap = {}
			const descriptionData: ObjectMap = {}
			for (let i = item.length - 1; i >= 0; i--) {
				if (judgeObjet[item[i].key]) {
					item.splice(i, 1)
				} else {
					judgeObjet[item[i].key] = true
					if (item[i].description) {
						descriptionData[item[i].description] = item[i]
					}
				}
			}
			descriptionObjectData = descriptionData
			reqData.value = item
		}
		const filterCheckedList = ref([])
		function defaultBlock() {
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
		}

		const mappingColumn = ref<any[]>([
			{ title: '参数说明', dataIndex: 'description', key: 'description' },
			{ title: '参数名称', dataIndex: 'key', key: 'key' },
			{
				title: '输入参数名称',
				dataIndex: 'inputKey',
				key: 'inputKey',
				customRender: ({ record }: any) => {
					return (
						<>
							<a-input style={{ width: '300px' }} v-model={[record.inputKey, 'value']} />
							<a-button
								style={{ width: '100px' }}
								onClick={() => {
									const data = ArrayKeyToObjet(reqData.value, 'key')
									const copyData = {
										required: '',
										type: '',
										...data[record.inputKey],
										inputKey: record.inputKey,
										key: record.inputKey,
										description: record.description
									}
									console.log('copyData', copyData)
									setObjetToObject(record, copyData)
									console.log(record)
									paramsMappingSave()
								}}
							>
								修改
							</a-button>
						</>
					)
				}
			},
			{ title: '数据类型', dataIndex: 'type', key: 'type' },
			{ title: '是否必须', dataIndex: 'required', key: 'required' }
		])
		function paramsMappingInitCLick(key: 'init' | 'edit') {
			if (!paramsMappingValue.value) return
			function getEditData() {
				const data = getCompileApiMappingList()
				if (!data) {
					return {}
				}
				return ArrayKeyToObjet(data, 'description')
			}
			let editData: ObjectMap = {}
			if (key === 'edit') {
				editData = getEditData()
			}
			const data: any[] = paramsMappingValue.value.split(/[,|，]/g) || []
			const returnList: reqDataType[] = data.map((item) => {
				if (key === 'edit') {
					if (editData[item]) {
						return editData[item]
					}
				}
				for (const i in descriptionObjectData) {
					if (i.includes(item)) {
						return { ...descriptionObjectData[i], inputKey: '', description: item }
					}
				}
				return { key: '', description: item, type: '', required: '', inputKey: '' }
			})
			paramsMappingList.value = returnList
		}

		function getCompileApiMappingList(): false | undefined | reqDataType[] {
			const item = compileApiModule.compileApiObject[apiInterfacePropsData.sourceData.value]
			if (!item) {
				return false
			}
			return item.reqData?.queryData?.mappingList
		}

		function initCompileApiMappingList() {
			const data = getCompileApiMappingList()
			if (data) {
				paramsMappingList.value = data
				paramsMappingValue.value = data
					.map((item) => {
						return item.description || ''
					})
					.join('，')
			} else {
				initMappingList()
			}
		}
		function paramsMappingSave() {
			compileApiModule.set_compileApiObject({
				item: {
					value: apiInterfacePropsData.sourceData.value,
					reqData: {
						queryData: {
							mappingList: paramsMappingList.value
						}
					}
				},
				apiName: apiInterfacePropsData.apiName
			})
		}
		function paramsMappingBlock() {
			return (
				<>
					<a-textarea v-model={[paramsMappingValue.value, 'value']} />
					<a-button onClick={() => paramsMappingInitCLick('init')}>重新生成列表</a-button>
					<a-button onClick={() => paramsMappingInitCLick('edit')}>修改列表列表</a-button>
					<a-button onClick={initCompileApiMappingList}>数据恢复</a-button>
					<a-button onClick={initMappingList}>初始化</a-button>
					<a-table
						dataSource={paramsMappingList.value}
						columns={mappingColumn.value}
						pagination={false}
						footer={() => <a-button onClick={() => paramsMappingSave()}>保存</a-button>}
					/>
				</>
			)
		}

		const filterOptions = computed(() => {
			const data = reqData.value
			return data.map((item) => {
				return item.key
			})
		})
		const filterModal = ref(false)
		const isParamsMapping = ref(false)

		return () => (
			<>
				<DataProcessing />
				<a-space size={15}>
					<div>参数名称： {props.reqData.value}</div>
					<a-button onClick={() => (filterModal.value = true)}>过滤字段</a-button>
					<a-button onClick={() => (isParamsMapping.value = true)}>参数映射</a-button>
					<a-button onClick={() => (isParamsMapping.value = false)}>参数列表</a-button>
				</a-space>
				<a-divider />
				<a-modal v-model={[filterModal.value, 'visible']} title="过滤字段" width="70vw">
					<a-checkbox-group v-model={[filterCheckedList.value, 'checkedList']} options={filterOptions.value} />
				</a-modal>
				{!isParamsMapping.value && defaultBlock()}
				{isParamsMapping.value && paramsMappingBlock()}
			</>
		)
	}
})
