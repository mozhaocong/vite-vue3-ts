import { defineComponent, inject, PropType } from 'vue'
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
			const targetTypeData = sourceData?.apiData?.compileDefsData?.targetTypeData
			const apiName = sourceData.apiName
			const value = props.reqData?.value?.replace(new RegExp(`def.${apiName}.`, 'g'), '')
			console.log(targetTypeData[value], apiName, value)
			const data = targetTypeData[value]
			function forData(item: ObjectMap, MapData: ObjectMap, reg: any, regData: (res: string) => string) {
				const returnData = clone(item)
				for (const itemKey in returnData) {
					if (item[itemKey].match(reg)) {
						const getRegData = regData(item[itemKey])
						console.log('getRegData', getRegData)
						// returnData[itemKey] = forData(MapData[getRegData], MapData, reg, regData)
					}
				}
				return returnData
			}
			forData(targetTypeData[value], targetTypeData, new RegExp(`def.${apiName}.`, 'g'), ($1) => {
				// $1 = $1.replace()
				return $1
			})
		}
		setReqDataData()

		return () => <div>{props.reqData.value}</div>
	}
})
