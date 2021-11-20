import { defineComponent, PropType, ref, watch, provide } from 'vue'
import { compileApiModule, compileApiObjectCheckboxList } from '@/store/modules/compileApi'
import ApiInterfaceDrawer from './components/drawer'
import { clone } from '@/utils/data'
import { sourceData, apiData } from '@/views/layout/tsType'
import RequestParameters from './components/requestParameters'
const propsData = {
	sourceData: {
		required: true,
		type: Object as PropType<sourceData>,
		default() {
			return {}
		}
	},
	apiData: {
		required: true,
		type: Object as PropType<apiData>,
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
	setup(props, { attrs }) {
		const parameter = ref<compileApiObjectCheckboxList>({
			namespace: true,
			requestParameters: true,
			responsesData: true
		})

		const checkboxList = ref<compileApiObjectCheckboxList>({
			namespace: true,
			requestParameters: true,
			responsesData: true
		})

		const drawerVisible = ref(false)
		const apiInterfacePropsData = ref({ ...clone(props) })
		provide('apiInterfacePropsData', () => apiInterfacePropsData.value)
		watch(
			() => props.sourceData,
			(item) => {
				compileApiObjectInit()
			},
			{
				immediate: true,
				deep: true
			}
		)
		function compileApiObjectInit() {
			apiInterfacePropsData.value = { ...clone(props) }
			initParameter()
			const data = compileApiModule.compileApiObject[props.sourceData.value]
			if (!data) {
				return
			}
			if (data.checkboxList) {
				setParameter(data.checkboxList)
			}
		}

		function saveApiQuickBuild() {
			compileApiModule.set_compileApiObject({
				item: { value: props.sourceData.value, quickBuild: true },
				apiName: props.apiName
			})
		}
		function saveApiCheckboxList(item: compileApiObjectCheckboxList) {
			compileApiModule.set_compileApiObject({
				item: { value: props.sourceData.value, checkboxList: item },
				apiName: props.apiName
			})
		}
		function setParameter(item: compileApiObjectCheckboxList) {
			parameter.value = clone(item)
			checkboxList.value = clone(item)
		}
		function initParameter() {
			const data = {
				namespace: true,
				requestParameters: true,
				responsesData: true
			}
			parameter.value = clone(data)
			checkboxList.value = clone(data)
			return data
		}

		return () => (
			<>
				<a-space size={15}>
					<div>接口名称：{props.sourceData.value}</div>
					<a-button type="primary" onClick={saveApiQuickBuild}>
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
				<a-row gutter={[16, 16]}>
					{parameter.value.namespace && (
						<a-col span={24}>
							<a-card title="接口类名(namespace)" bordered={true}>
								<div>{props.sourceData?.apiName}</div>
							</a-card>
						</a-col>
					)}
					{parameter.value.requestParameters && <RequestParameters />}
					{parameter.value.responsesData && (
						<a-col span={24}>
							<a-card title="接口返回参数(responsesData)" bordered={true}>
								<div>{props.sourceData.responsesData}</div>
							</a-card>
						</a-col>
					)}
				</a-row>
				<ApiInterfaceDrawer
					drawerVisible={drawerVisible}
					checkboxList={checkboxList}
					onClose={() => {
						checkboxList.value = clone(parameter.value)
					}}
					determine={() => {
						saveApiCheckboxList(checkboxList.value)
						compileApiObjectInit()
					}}
					resetClick={() => {
						saveApiCheckboxList(initParameter())
						compileApiObjectInit()
					}}
				/>
			</>
		)
	}
})
