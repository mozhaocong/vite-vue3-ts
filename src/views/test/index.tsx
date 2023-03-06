import { defineComponent, ref } from 'vue'

import Interface from './component/interface'
import Content from './component/content'
import { initApi } from './compileApi/index'
import './index.less'
export default defineComponent({
	name: 'TestMZC',
	setup() {
		const sourceData = ref<any[]>([])
		const labelName = ref<string>('labelCn')
		const expand = ref<ObjectMap>([])
		const InterfaceValue = ref<string>('')
		const interfaceData = ref<ObjectMap>({})

		initApi({ url: 'https://supply-gateway-test.htwig.com/scm/v3/api-docs', apiName: 'oms' }).then((res: any) => {
			console.log('res', res)
			const arrayData: any[] = []
			for (const i in res.compileAPIData) {
				const dataA: any = { labelEn: res.setTagData[i], labelCn: i, children: [], value: res.setTagData[i] }
				for (const j in res.compileAPIData[i]) {
					const ijData = res.compileAPIData[i][j]
					const dataB = {
						labelEn: j,
						labelCn: ijData.summary || j,
						value: i + '-' + (ijData.summary || j),
						...ijData
					}
					dataA.children.push(dataB)
				}
				arrayData.push(dataA)
			}
			sourceData.value = arrayData
		})

		return () => (
			<a-layout class="a-layout">
				<a-layout-sider width="340" class="layout-sider" style={{ background: '#fff' }}>
					<div class="language-button">
						<a-button
							onClick={() => {
								labelName.value = 'labelCn'
							}}
						>
							中文
						</a-button>
						<a-button
							onClick={() => {
								labelName.value = 'labelEn'
							}}
						>
							英文
						</a-button>
					</div>

					<a-input class="search-box" />
					<Interface
						sourceData={sourceData.value}
						labelName={labelName.value}
						v-models={[
							[expand.value, 'expand'],
							[InterfaceValue.value, 'value']
						]}
						{...{
							onResCLick: (res: ObjectMap) => {
								console.log('res', res)
								interfaceData.value = res
							}
						}}
					/>
				</a-layout-sider>
				<a-layout>
					<a-layout-header style={{ background: '#fff' }}>
						<a-row>
							<a-col span={6}>{interfaceData.value.value || ''}</a-col>
							<a-col span={6}>
								<a-button>保存</a-button>
							</a-col>
						</a-row>
					</a-layout-header>
					<a-layout-content>
						{/*@ts-ignore*/}
						<Content sourceData={interfaceData.value} />
					</a-layout-content>
					<a-layout-footer>Footer</a-layout-footer>
				</a-layout>
			</a-layout>
		)
	}
})
