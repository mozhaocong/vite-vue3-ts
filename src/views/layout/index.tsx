import { defineComponent, ref, computed, provide } from 'vue'
import { apiInit } from './module/apiAccess'
import ApiInterface from './module/apiInterface'
import { compileApiModule, compileApiListType } from '@/store/modules/compileApi'
export default defineComponent({
	name: 'layout',
	setup() {
		const apiName = ref('oms')
		compileApiModule.get_compileApiList(apiName.value)
		const compileApiList = computed(() => {
			return compileApiModule.compileApiList
		})
		provide('compileApiList', compileApiList.value)
		apiInit('/JSON/test.json', apiName.value).then((item) => {
			subMenuList.value = item.arrayData
			apiData.value = item.res
		})
		const selectedKeys = ref<string[]>([])
		const openKeys = ref<string[]>([])
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
		function compileApiListCLick(item: compileApiListType) {
			subMenuList.value.forEach((res) => {
				res.children &&
					res.children.forEach((resC: any) => {
						if (resC.value === item.value) {
							apiInterfaceData.value = resC
							selectedKeys.value = [resC.value]
							openKeys.value = [res.value]
						}
					})
			})
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
									return (
										<a-button type="primary" onClick={() => compileApiListCLick(item)}>
											{item.value}
										</a-button>
									)
								})}
							</a-space>
						</a-space>
					</a-layout-header>
					<a-layout style={{ flex: 1 }}>
						<a-layout-sider width="300" style={{ height: '100%', overflowY: 'auto' }}>
							<a-menu
								mode="inline"
								v-models={[
									[selectedKeys.value, 'selectedKeys'],
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
								<ApiInterface sourceData={apiInterfaceData.value} apiData={apiData.value} apiName={apiName.value} />
							</a-layout-content>
						</a-layout>
					</a-layout>
				</a-layout>
			</>
		)
	}
})
