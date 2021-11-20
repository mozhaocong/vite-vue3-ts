import { defineComponent, PropType, inject, watch, ref } from 'vue'
import { apiInterfacePropsData } from '@/views/layout/tsType'
const propsData = {
	apiInterfacePropsData: {
		required: true,
		type: Object as PropType<apiInterfacePropsData>,
		default() {
			return {}
		}
	}
}
export default defineComponent({
	name: 'apiInterface',
	props: propsData,
	setup(props) {
		// console.log("inject('apiInterfacePropsDataProvide')", inject('apiInterfacePropsDataProvide'))
		// const data = ref(inject(''))
		// watch(
		// 	() => data.value,
		// 	(item) => {
		// 		console.log('item', item)
		// 	},
		// 	{
		// 		deep: true,
		// 		immediate: true
		// 	}
		// )

		function requestParameters(item: ObjectMap) {
			const arrayList: any[] = []
			for (const i in item.requestParameters) {
				switch (i) {
					case 'query':
						arrayList.push({ label: 'query', value: item.apiName + '.Params', data: item.requestParameters.query })
						break
					case 'body':
						arrayList.push({
							label: 'body',
							value: item.requestParameters.body.type,
							data: item.requestParameters.query
						})
						break
					case 'path':
						arrayList.push({
							label: 'path',
							value: item.requestParameters.path.map((res: any) => res.key).join(','),
							data: item.requestParameters.path
						})
						break
				}
			}
			return arrayList.map((res) => {
				return (
					<div>
						{res.label} : {res.value}
					</div>
				)
			})
		}
		return () => (
			<a-col span={24}>
				<a-card title="接口请求参数(requestParameters)" bordered={true}>
					<div>{requestParameters(props.apiInterfacePropsData.sourceData)}</div>
				</a-card>
			</a-col>
		)
	}
})
