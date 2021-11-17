import { replaceData, regExp } from '../util'
import { errorMethod, setErrData } from './errorMethod'

export function setDefinitions(item: any) {
	function setName(name: string, item: any) {
		let data = ''
		if (regExp.typeT0.test(name)) {
			data = name.replace(regExp.typeT0, '') + replaceData.TOAny
			item.regExpMatch = name.match(regExp.typeT0)
		} else {
			data = name
		}
		return data
	}
	function setPropertiesType(properties: any, item: any, key: string) {
		let type = ''
		let originalRef = ''
		switch (properties.type) {
			case 'integer':
				type = 'number'
				break
			case 'number':
				type = 'number'
				break
			case 'string':
				type = 'string'
				break
			case 'array':
				if (properties.items && properties.items.originalRef) {
					// http://192.168.120.179:9079/v2/api-docs
					// ResponseDto«List«StockSkuCo»»
					// let data = {properties: {data: {
					//       "type": "array",
					//       "items": {
					//         "$ref": "#/definitions/StockSkuCo",
					//         "originalRef": "StockSkuCo"
					//       }
					//     }}}
					// regExpMatch主动加的
					if (item.regExpMatch) {
						if (item.regExpMatch[0].includes('«List«')) {
							const arrayList: any = item.regExpMatch[0].match(regExp.ListW)
							if (arrayList.length) {
								if (properties.items.originalRef === arrayList[0].replace(regExp.replaceT0, '')) {
									type = replaceData.TOString
									break
								}
							}
						}
						if (properties.items.originalRef === item.regExpMatch[0].replace(regExp.replaceT0, '')) {
							type = `Array${replaceData.TOAny}`
							break
						}

						//通过报错判断过滤条件
						const showErrorMethod = !properties.items.originalRef
						if (showErrorMethod) {
							errorMethod('setPropertiesType  array regExpMatch', { properties, item, key })
						}
					}
					type = `Array<${properties.items.originalRef}>`
					originalRef = properties.items.originalRef
					break
				} else if (properties.items) {
					const l: any = setPropertiesType(properties.items, item, key) || 'any'
					if (l.originalRef) {
						errorMethod('setPropertiesType  Array setPropertiesType', { properties, item, key })
					}
					type = `Array<${l.type}>`
					break
				} else {
					errorMethod('setPropertiesType  array 空', { properties, item, key })
					type = '[]'
					break
				}
			case 'boolean':
				type = 'boolean'
				break
			default:
				if (item.regExpMatch) {
					if (item.regExpMatch[0].replace(/^\S|\S$/g, '') === properties.originalRef) {
						type = replaceData.TOString
						break
					}
				}
				if (properties.originalRef) {
					type = `${properties.originalRef}`
					originalRef = properties.originalRef
					break
				} else {
					const showErrorMethod = properties.type !== 'object'
					if (showErrorMethod) {
						errorMethod('setPropertiesType  default', { properties, item, key })
					}
					type = 'any'
					break
				}
		}
		const filterObj = JSON.parse(JSON.stringify(properties))
		delete filterObj.type
		delete filterObj.originalRef
		// enum: properties.enum // 选择类型
		return { type: type, originalRef: originalRef, ...filterObj }
	}
	let name = ''
	const definitionsObj: any = {} // 生成的exportClass对象， 用来过滤相同的exportClass
	const exportClassData: any = {}
	for (const i in item) {
		name = setName(i, item[i])
		setErrData({ data: item[i], key: i, type: 'setDefinitions', name: name })
		if (definitionsObj[name]) {
			continue
		}
		definitionsObj[name] = true
		const properties = item[i].properties

		// 调试节点
		// if(i !== 'AsMaterialRejectBillRequestDto') {
		//   continue
		// }
		// console.log(item[i]);

		exportClassData[name] = {
			properties: properties, //只用于参考数据，可以屏蔽
			key: i, //只用于参考数据，可以屏蔽
			data: item[i], //只用于参考数据，可以屏蔽
			setData: {},
			required: item[i].required
		}

		for (const l in properties) {
			const setPropertiesTypeData = setPropertiesType(properties[l], item[i], l)
			exportClassData[name].setData[l] = {
				setPropertiesTypeData: setPropertiesTypeData,
				description: properties[l].description
			}
		}
	}

	return exportClassData
}
