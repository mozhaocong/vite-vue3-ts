// 处理knife4j文档返回的数据

import { isTrue, deepClone, getArrayReduceObject } from 'html-mzc-tool'

function setDataObject(item: { list: string[]; setData: any; data: any }): void {
	const { list, setData, data } = item
	let psuData = setData
	list.forEach((forItem, index) => {
		if (!psuData[forItem]) {
			psuData[forItem] = {}
		}
		if (index === list.length - 1) {
			psuData[forItem] = data
		} else {
			psuData = psuData[forItem]
		}
	})
}

// api 数据初步处理成 list
export function setKnife4jApiData(item: { data: any }) {
	const { data } = item
	const { paths } = data
	const listData = []
	const pathData = {}
	for (const path in paths) {
		const data = paths[path]
		const keys = Object.keys(data)
		keys.forEach((keyItem) => {
			const { tags } = data[keyItem]
			tags.forEach((forItem) => {
				setDataObject({
					list: [forItem, path, keyItem],
					data: { path: path, data: data[keyItem], methods: keyItem },
					setData: pathData
				})
			})
		})
	}

	for (const pathDataKey in pathData) {
		const data = pathData[pathDataKey]
		const itemList = []
		for (const dataKey in data) {
			const childrenData = data[dataKey]
			for (const childrenDataKey in childrenData) {
				itemList.push({ ...(childrenData[childrenDataKey] || {}), path: dataKey })
			}
		}
		listData.push({ tag: pathDataKey, children: itemList })
	}
	return listData
}

// 获取目标数据
export function getTargetApiData(item: { pathList: any[]; apiData: ObjectMap; targetItem: ObjectMap }) {
	const { pathList, apiData, targetItem } = item
	const { tag, path, methods } = targetItem
	let findData = {}
	for (const forItem of pathList) {
		const { tag: forTag, children } = forItem
		if (forTag === tag) {
			findData = children.find((findItem) => {
				return path === findItem.path && methods === findItem.methods
			})
			break
		}
	}
	if (!isTrue(findData)) {
		return {}
	}
	const targetData = deepClone(findData)
	getRequestBodyData({ targetData, apiData })
	// console.log('findData', targetData, apiData)
}

// requestBody 类型处理，可以识别出有没有漏掉要补的类型，有检查的作用
const requestBodyType = {
	'application/json': { route: ['schema', '$ref'], method: schemaRefMethod }
}

const apiTypeMap = {
	integer: 'number',
	array: 'array',
	string: 'string'
}

function schemaRefMethod(item: { apiData: any; routeString: string }): ObjectMap {
	const data = refMethod(item)
	console.log('data', data)
	const { properties, required = [] } = data
	const listData = []
	for (const property in properties) {
		const sourceData = properties[property]
		const { type, description } = sourceData

		// 其他参数处理
		const otherData: ObjectMap = {}
		if (sourceData.enum) {
			otherData.enum = sourceData.enum
		}
		if (required.includes(property)) {
			otherData.required = true
		}
		listData.push({ ...otherData, key: property, description, type: apiTypeMap[type] })
	}
	console.log(listData)
	return {}
}

function getPropertiesData(item: { apiData: any; routeString: string }) {
	const data = refMethod(item)
	const { properties, required = [] } = data
	const listData = []
	for (const property in properties) {
		// 其他参数处理
		const pushData: ObjectMap = getPropertiesKeyData(properties[property])
		if (required.includes(property)) {
			pushData.required = true
		}
		listData.push({ ...pushData, key: property })
	}
	console.log(listData)
	return listData
}

function getPropertiesKeyData(sourceData) {
	const { type, description } = sourceData

	// 其他参数处理
	const pushData: ObjectMap = {}
	if (sourceData.enum) {
		pushData.enum = sourceData.enum
	}
	if (description) {
		pushData.description = description
	}

	return { ...pushData, type: apiTypeMap[type] }
}

function refMethod(item: { apiData: any; routeString: string }): ObjectMap {
	const { apiData, routeString } = item
	const dataA = routeString.split('#/')
	const dataB = dataA?.[1]?.split('/')
	const dataC = getArrayReduceObject(apiData, dataB || []) || {}
	return dataC
}

function errLog(item) {
	console.error(item)
}

function getRequestBodyData(item: { targetData: any; apiData: any }) {
	const { targetData = {}, apiData } = item
	const { requestBody } = targetData?.data || {}
	// console.log('requestBody', requestBody, apiData)
	const { content } = requestBody
	let bodyTypeData = {}
	for (const forItem in requestBodyType) {
		const { route, method } = requestBodyType[forItem]
		if (content[forItem]) {
			const typeData = getArrayReduceObject(content[forItem], route)
			if (!isTrue(typeData)) {
				errLog('getRequestBodyData  requestBodyType，没有找到对应的参数')
				return {}
			}
			bodyTypeData = method({ routeString: typeData, apiData })
		}
	}

	console.log('bodyTypeData', bodyTypeData)
}
