// requestBody 类型处理，可以识别出有没有漏掉要补的类型，有检查的作用
import { getArrayReduceObject, isTrue } from 'html-mzc-tool'

export const requestBodyType = {
	content: { route: ['application/json', 'schema'], method: schemaRefMethod }
}
export const responsesType = {
	'200': { route: ['content', '*/*', 'schema'], method: schemaRefMethod }
}

export const apiTypeMap = {
	integer: 'number',
	number: 'number',
	array: 'Array',
	string: 'string',
	object: 'any',
	boolean: 'boolean'
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

export function schemaRefMethod(item: { apiData: any; routeData: ObjectMap }): ObjectMap {
	const { routeData, apiData } = item
	const { $ref, type } = routeData
	if ($ref) {
		const data = refMethod({ apiData, routeString: $ref })
		const { properties, required = [] } = data
		const listData = []
		for (const property in properties) {
			const sourceData = properties[property]
			const { type, ...attrs } = sourceData
			// 其他参数处理
			const otherData: ObjectMap = {}
			if (sourceData.enum) {
				otherData.enum = sourceData.enum
			}
			if (required.includes(property)) {
				otherData.required = true
			}
			if (type) {
				if (!apiTypeMap[type]) {
					errLog('schemaRefMethod  $ref，type没有对应享受', type, sourceData, properties)
				}
				listData.push({ ...attrs, ...otherData, key: property, type: apiTypeMap[type] })
			} else {
				listData.push({ ...sourceData, ...otherData, key: property })
			}
		}
		return { data: listData, type: '$ref' }
	} else if (type) {
		return { data: [{ type: apiTypeMap[type] }], type: 'type' }
	} else {
		errLog('schemaRefMethod  schemaRefMethod，没有对应的类型', routeData)
	}
}

// 统一处理数据， 通过配置的类型 解析出对应的数据
export const unifiedProcessing = (item: { targetData: ObjectMap; typeObject: ObjectMap; apiData: ObjectMap }) => {
	const { targetData = {}, typeObject, apiData } = item
	const publicTypeData = {}
	for (const forItem in typeObject) {
		const { route, method } = typeObject[forItem]
		if (targetData[forItem]) {
			const typeData = getArrayReduceObject(targetData[forItem], route)
			// 过滤无效报错
			if (!isTrue(typeData)) {
				const judge1 = getArrayReduceObject(targetData[forItem], ['content', 'text/html', 'schema'])
				const judge2 = targetData?.[forItem]?.content

				if (!(isTrue(judge1) || !isTrue(judge2))) {
					errLog('getRequestBodyData  requestBodyType，没有找到对应的参数', targetData[forItem], route)
				}
				return {}
			}
			const methodData = method({ routeData: typeData, apiData })
			publicTypeData[forItem] = { route: route, data: methodData.data }
		}
	}
	return publicTypeData
}

// 获取type 模版字符串
const getTypeStringData = (item: { apiData: ObjectMap; data: ObjectMap; refList?: any[] }) => {
	const { apiData, data = {}, refList = [] } = item
	const { type, key, description, items, $ref } = data
	switch (type) {
		case 'any':
		case 'boolean':
		case 'string':
		case 'number': {
			let typeData = type
			if (data.enum) {
				typeData = data.enum.map((mapItem) => `'${mapItem}'`).join('|')
			}
			if (!key) return typeData
			return `${key}: ${typeData},// ${description}
			`
		}
		case 'Array': {
			const { data, type } = schemaRefMethod({ routeData: items, apiData })
			const { $ref } = items
			let pushList: any[] = refList
			// 阻止tree 递归循环
			if (type === '$ref') {
				if (refList.includes($ref)) {
					return `${key}: any[],// ${description} <${$ref}>
			`
				}
				pushList = [...pushList, $ref]
			}
			const stringList = data
				.map((mapItem) => {
					return getTypeStringData({ apiData, data: mapItem, refList: pushList })
				})
				.join('')
			const keyValue = type === '$ref' ? `{${stringList}}[]` : `${stringList}[]`
			return `${key}: ${keyValue},// ${description}
			`
		}
		default: {
			if (!type && $ref) {
				const { data, type } = schemaRefMethod({ routeData: { $ref }, apiData })
				let pushList: any[] = refList
				// 阻止tree 递归循环
				if (type === '$ref') {
					if (refList.includes($ref)) {
						return `${key}: any,// ${description} <${$ref}>
			`
					}
					pushList = [...pushList, $ref]
				}
				const stringList = data
					.map((mapItem) => {
						return getTypeStringData({ apiData, data: mapItem, refList: pushList })
					})
					.join('')
				const keyValue = type === '$ref' ? `{${stringList}}` : `${stringList}`
				return `${key}: ${keyValue},// ${description}
			`
			}
			errLog('typeRequestBodyDatatypeRequestBodyData', data, type)
			return ''
		}
	}
}

// 获取数据模版字符
export const getListDataType = (item: {
	listData: ObjectMap[]
	dataSource: ObjectMap
	apiData: ObjectMap
	typeName: string
}) => {
	const { listData = [], dataSource, apiData, typeName } = item
	if (!isTrue(listData)) return ''
	const string = `type ${typeName} = {
	 ${listData
			.map((mapItem) => {
				setErrData({ dataSource })
				return getTypeStringData({ apiData, data: mapItem })
			})
			.join('')}
	}`
	return string
}
