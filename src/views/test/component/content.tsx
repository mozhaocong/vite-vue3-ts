import { defineComponent, PropType } from 'vue'
import './index.less'
const propsData = {
	sourceData: {
		required: true,
		type: Object as PropType<ObjectMap>,
		default() {
			return []
		}
	}
}
export default defineComponent({
	name: 'TestMZC',
	props: propsData,
	setup(props) {
		function requestParameters(item: ObjectMap) {
			const ArrayList: any[] = []
			for (const i in item.requestParameters) {
				switch (i) {
					case 'query':
						ArrayList.push({ label: 'query', value: item.apiName + '.Params', data: item.requestParameters.query })
						break
					case 'body':
						ArrayList.push({
							label: 'body',
							value: item.requestParameters.body.type,
							data: item.requestParameters.query
						})
						break
					case 'path':
						ArrayList.push({
							label: 'path',
							value: item.requestParameters.path.map((res: any) => res.key).join(','),
							data: item.requestParameters.path
						})
						break
				}
			}
			return ArrayList.map((res) => {
				return (
					<div>
						{res.label} : {res.value}
					</div>
				)
			})
		}

		return () => (
			<a-from labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
				<a-row>
					<a-col span={24}>
						<a-form-item label="接口类名(namespace)">{props.sourceData?.apiName}</a-form-item>
					</a-col>
					<a-col span={24}>
						<a-form-item label="接口请求参数(requestParameters)">{requestParameters(props.sourceData)}</a-form-item>
					</a-col>
					<a-col span={24}>
						<a-form-item label="接口返回参数(responsesData)">{props.sourceData.responsesData}</a-form-item>
					</a-col>
				</a-row>
			</a-from>
		)
	}
})
