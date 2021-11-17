import { defineComponent, ref, computed } from 'vue'
import { apiInit } from './module/apiAccess'
import ApiInterface from './module/apiInterface'
import { compileApiModule } from '@/store/modules/compileApi'
export default defineComponent({
	name: 'layout',
	setup() {
		compileApiModule.get_compileApiList()
		const compileApiList = computed(() => {
			return compileApiModule.compileApiList
		})
		apiInit('/JSON/test.json').then((item) => {
			subMenuList.value = item.arrayData
			apiData.value = item.res
		})
		const selectedKeys2 = ref<string[]>(['1'])
		const openKeys = ref<string[]>(['sub1'])
		const subMenuList = ref<any[]>([])
		const labelName = ref('labelCn')
		const apiInterfaceData = ref<ObjectMap>({})
		const apiData = ref<ObjectMap>({})

		function menuItemCLick(item: any) {
			apiInterfaceData.value = item
		}
		function onSearch(item: string) {
			console.log(item)
		}

		return () => (
			<>
				<a-layout style={{ display: 'flex', flexWrap: 'nowrap', height: '100vh' }}>
					<a-layout-header>
						<a-space>
							<a-space size={15} style={{ width: '360px' }}>
								<a-button type="primary">中文</a-button>
								<a-button type="primary">英文</a-button>
								<a-input-search placeholder="搜索" onSearch={onSearch} />
							</a-space>
							<a-space>
								{compileApiList.value.map((item) => {
									return <div style={{ color: 'red' }}>{item.value}</div>
								})}
							</a-space>
						</a-space>
					</a-layout-header>
					<a-layout style={{ flex: 1 }}>
						<a-layout-sider width="300" style={{ height: '100%', overflowY: 'auto' }}>
							<a-menu
								mode="inline"
								v-models={[
									[selectedKeys2.value, 'selectedKeys'],
									[openKeys.value, 'openKeys']
								]}
							>
								{subMenuList.value.map((res) => {
									return (
										<a-sub-menu key={res.value} title={res[labelName.value]}>
											{res?.children?.map((resC: any) => {
												return (
													<a-menu-item onClick={() => menuItemCLick(resC)} key={resC.value}>
														{resC[labelName.value]}
													</a-menu-item>
												)
											})}
										</a-sub-menu>
									)
								})}
							</a-menu>
						</a-layout-sider>
						<a-layout style={{ height: ' 100%', boxSizing: 'border-box', padding: '25px' }}>
							{/*<a-breadcrumb>*/}
							{/*	<a-breadcrumb-item>Home</a-breadcrumb-item>*/}
							{/*	<a-breadcrumb-item>List</a-breadcrumb-item>*/}
							{/*	<a-breadcrumb-item>App</a-breadcrumb-item>*/}
							{/*</a-breadcrumb>*/}
							<a-layout-content>
								<ApiInterface sourceData={apiInterfaceData.value} apiData={apiData.value} />
							</a-layout-content>
						</a-layout>
					</a-layout>
				</a-layout>
			</>
		)
	}
})
