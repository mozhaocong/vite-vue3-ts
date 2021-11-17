import { defineComponent, PropType, ref } from 'vue'
import { compileApiModule } from '@/store/modules/compileApi'
const propsData = {
	sourceData: {
		required: true,
		type: Object as PropType<ObjectMap>,
		default() {
			return {}
		}
	},
	apiData: {
		required: true,
		type: Object as PropType<ObjectMap>,
		default() {
			return {}
		}
	},
	apiName: {
		required: true,
		type: String as PropType<string>,
		default: ''
	}
}
export default defineComponent({
	name: 'apiInterface',
	props: propsData,
	setup(props) {
		const drawerVisible = ref(false)
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

		function saveApi() {
			compileApiModule.set_compileApiList({ item: { value: props.sourceData.value }, apiName: props.apiName })
		}

		return () => (
			<>
				<a-space size={15}>
					<div>接口名称：{props.sourceData.value}</div>
					<a-button type="primary" onClick={saveApi}>
						保存
					</a-button>
					<a-button
						onClick={() => {
							drawerVisible.value = true
						}}
					>
						设置
					</a-button>
				</a-space>
				<a-from labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
					<a-row gutter={[16, 16]}>
						<a-col span={24}>
							<a-card title="接口类名(namespace)" bordered={true}>
								<div>{props.sourceData?.apiName}</div>
							</a-card>
						</a-col>
						<a-col span={24}>
							<a-card title="接口请求参数(requestParameters)" bordered={true}>
								<div>{requestParameters(props.sourceData)}</div>
							</a-card>
						</a-col>
						<a-col span={24}>
							<a-card title="接口返回参数(responsesData)" bordered={true}>
								<div>{props.sourceData.responsesData}</div>
							</a-card>
						</a-col>
					</a-row>
				</a-from>
				<a-drawer title="Basic Drawer" placement="right" closable={false} v-model={[drawerVisible.value, 'visible']}>
					<p>Some contents...</p>
					<p>Some contents...</p>
					<p>Some contents...</p>
				</a-drawer>
			</>
		)
	}
})
