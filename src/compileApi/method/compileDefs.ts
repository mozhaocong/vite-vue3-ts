import { errorMethod, setErrData } from './errorMethod'
import { ApiName } from '../index'

//编辑Defs
export function compileDefs(definitionsData: ObjectMap) {
	function setParameter(item: any) {
		const data = { description: item.description, type: item.setPropertiesTypeData.type }
		if (item.setPropertiesTypeData.enum) {
			//类型的选择项
			if (data.type === 'string') {
				data.type = item.setPropertiesTypeData.enum.join(' | ')
			} else {
				errorMethod('setParameter enum type类型不等string', item)
			}
		}
		if (item.setPropertiesTypeData.originalRef) {
			if (definitionsData[item.setPropertiesTypeData.originalRef]) {
				data.type = data.type.replace(
					item.setPropertiesTypeData.originalRef,
					`defs.${ApiName}.${item.setPropertiesTypeData.originalRef}`
				)
			} else {
				errorMethod('setParameter item.setPropertiesTypeData 没有匹配', item)
			}
		}
		return data
	}
	const targetTypeData: ObjectMap = {}
	const targetTypeDescriptionData: ObjectMap = {}
	for (const i in definitionsData) {
		targetTypeData[i] = {}
		targetTypeDescriptionData[i] = {}
		for (const j in definitionsData[i].setData) {
			setErrData({ data: definitionsData[i], key: j, type: 'compileDefs' })
			const parameter = definitionsData[i].setData[j]
			const setData = setParameter(parameter)
			let parameterKey = `${j}?`
			// 判断是否必填
			if (definitionsData[i].required && definitionsData[i].required.includes(j)) {
				parameterKey = j
			}
			targetTypeData[i][parameterKey] = setData.type
			if (setData.description) {
				targetTypeDescriptionData[i][setData.description] = j
			}
		}
	}
	return { targetTypeData, targetTypeDescriptionData }
}
