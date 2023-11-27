// requestBody 类型处理，可以识别出有没有漏掉要补的类型，有检查的作用
import { getArrayReduceObject, isTrue } from 'html-mzc-tool'

export const requestBodyType = {
	content: { route: ['application/json', 'schema', '$ref'], method: schemaRefMethod }
}
export const responsesType = {
	'200': { route: ['content', '*/*', 'schema', '$ref'], method: schemaRefMethod }
}

export const apiTypeMap = {
	integer: 'number',
	array: 'array',
	string: 'string',
	object: 'any'
}
let errData = {}

export const setErrData = (item) => {
	errData = item
}
export function errLog(item, ...attrs) {
	console.error(item, ...attrs, errData)
}

export function refMethod(item: { apiData: any; routeString: string }): ObjectMap {
	const { apiData, routeString } = item
	const dataA = routeString.split('#/')
	const dataB = dataA?.[1]?.split('/')
	const dataC = getArrayReduceObject(apiData, dataB || []) || {}
	return dataC
}

export function schemaRefMethod(item: { apiData: any; routeString: string }): ObjectMap {
	const data = refMethod(item)
	const { properties, required = [] } = data
	const listData = []
	for (const property in properties) {
		const sourceData = properties[property]
		const { type, description, ...attrs } = sourceData

		// 其他参数处理
		const otherData: ObjectMap = {}
		if (sourceData.enum) {
			otherData.enum = sourceData.enum
		}
		if (required.includes(property)) {
			otherData.required = true
		}
		listData.push({ ...attrs, ...otherData, key: property, description, type: apiTypeMap[type] })
	}
	return listData
}

// 统一处理数据， 通过配置的类型 解析出对应的数据
export const unifiedProcessing = (item: { targetData: ObjectMap; typeObject: ObjectMap; apiData: ObjectMap }) => {
	const { targetData = {}, typeObject, apiData } = item
	const publicTypeData = {}
	for (const forItem in typeObject) {
		const { route, method } = typeObject[forItem]
		if (targetData[forItem]) {
			const typeData = getArrayReduceObject(targetData[forItem], route)
			console.log('typeData', typeData)
			if (!isTrue(typeData)) {
				errLog('getRequestBodyData  requestBodyType，没有找到对应的参数', targetData[forItem], route)
				return {}
			}
			const methodData = method({ routeString: typeData, apiData })
			publicTypeData[forItem] = { route: route, data: methodData }
		}
	}
	return publicTypeData
}
