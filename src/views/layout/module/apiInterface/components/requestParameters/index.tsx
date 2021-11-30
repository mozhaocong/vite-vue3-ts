import { defineComponent, inject, computed } from 'vue'
import { apiInterfacePropsData } from '@/views/layout/tsType'
import QueryBlock from './components/queryBlock'
import PathBlock from './components/pathBlock'
import BodyBlock from './components/bodyBlock'
const propsData = {}
export default defineComponent({
	name: 'apiInterface',
	setup(props) {
		const apiInterfacePropsData = computed(() => {
			const data = inject('apiInterfacePropsData') as () => apiInterfacePropsData
			return data()
		})

		function requestParameters(item: ObjectMap) {
			const requestParametersObject: ObjectMap = {}
			for (const i in item.requestParameters) {
				switch (i) {
					case 'query':
						// arrayList.push({ label: 'query', value: item.apiName + '.Params', data: item.requestParameters.query })
						requestParametersObject.query = {
							render: () => (
								<QueryBlock
									reqData={{ label: 'query', value: item.apiName + '.Params', data: item.requestParameters.query }}
								/>
							)
						}
						break
					case 'body':
						requestParametersObject.body = {
							render: () => (
								<BodyBlock
									reqData={{
										label: 'body',
										value: item.requestParameters.body.type,
										data: item
									}}
								/>
							)
						}
						break
					case 'path':
						requestParametersObject.path = {
							render: () => (
								<PathBlock
									reqData={{
										label: 'path',
										value: item.requestParameters.path.map((res: any) => res.key).join(','),
										data: item.requestParameters.path
									}}
								/>
							)
						}
						break
				}
			}
			return (
				<a-tabs>
					{requestParametersObject.query && (
						<a-tab-pane key="1" tab="query参数">
							{requestParametersObject.query.render()}
						</a-tab-pane>
					)}
					{requestParametersObject.body && (
						<a-tab-pane key="1" tab="body参数">
							{requestParametersObject.body.render()}
						</a-tab-pane>
					)}
					{requestParametersObject.path && (
						<a-tab-pane key="1" tab="path参数">
							{requestParametersObject.path.render()}
						</a-tab-pane>
					)}
				</a-tabs>
			)
		}
		return () => (
			<a-col span={24}>
				<a-card title="接口请求参数(requestParameters)" bordered={true}>
					<div>{requestParameters(apiInterfacePropsData.value.sourceData)}</div>
				</a-card>
			</a-col>
		)
	}
})
