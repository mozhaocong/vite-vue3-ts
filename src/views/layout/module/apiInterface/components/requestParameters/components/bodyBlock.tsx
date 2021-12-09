import { defineComponent, inject, PropType, ref } from 'vue'
import { apiInterfacePropsData, reqDataType } from '@/views/layout/tsType'
import { clone } from 'ramda'

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
		function setReqDataData() {
			const getApiInterfacePropsData = inject('apiInterfacePropsData') as () => apiInterfacePropsData

			const sourceData = getApiInterfacePropsData()
			// console.log('sourceData', sourceData)

			const requestDefinitionData = sourceData?.apiData?.setRequestDefinitionData

			const apiName = sourceData.apiName

			const value = props.reqData?.value?.replace(new RegExp(`def.${apiName}.`, 'g'), '')

			const processingData = requestDefinitionData[value]

			// console.log('processingData', processingData)
			function forData(item: any[]) {
				return item.map((item: ObjectMap) => {
					if (item.originalRef) {
						const data = clone(requestDefinitionData[item.originalRef])
						item.children = forData(data.properties)
						delete data.properties
						item.childrenParam = data
					}
					return item
				})
			}
			processingData.properties = forData(processingData.properties)
			console.log('processingData', processingData)
			return processingData
		}
		const dataSource = ref()
		dataSource.value = setReqDataData().properties

		// return () => <div>{props.reqData.value}</div>
		return () => (
			<a-table
				columns={[
					{
						title: '参数名称',
						dataIndex: 'key',
						key: 'key'
					},
					{
						title: '参数说明',
						dataIndex: 'description',
						key: 'description'
					},
					{
						title: '数据类型',
						dataIndex: 'type',
						key: 'type'
					},
					{
						title: 'schema',
						dataIndex: 'originalRef',
						key: 'originalRef'
					}
				]}
				data-source={dataSource.value}
				pagination={false}
			/>
		)
	}
})
