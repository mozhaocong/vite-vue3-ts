// 处理knife4j文档返回的数据

import { isTrue, deepClone, arrayGetDataList } from 'html-mzc-tool'
import { requestBodyType, unifiedProcessing, responsesType, setErrData } from './toolMethod'

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
	const { tag, children: itemChildren } = targetItem
	let listData = []
	for (const forItem of pathList) {
		const { tag: forTag, children } = forItem
		if (forTag === tag) {
			listData = arrayGetDataList(children, itemChildren)
			break
		}
		// listData = [...listData, ...children]
	}

	if (!isTrue(listData)) {
		return []
	}

	const data = listData.map((mapItem) => {
		setErrData(mapItem)
		const targetData = deepClone(mapItem)
		const responsesData = getResponsesData({ targetData, apiData })
		const requestBodyData = getRequestBodyData({ targetData, apiData })
		return { ...mapItem, responsesData, requestBodyData }
	})
	return data
}

function getRequestBodyData(item: { targetData: any; apiData: any }) {
	const { targetData = {}, apiData } = item
	const { requestBody } = targetData?.data || {}
	return unifiedProcessing({ targetData: requestBody, apiData, typeObject: requestBodyType })
}

function getResponsesData(item: { targetData: any; apiData: any }) {
	const { targetData = {}, apiData } = item
	const { responses } = targetData?.data || {}
	return unifiedProcessing({ targetData: responses, apiData, typeObject: responsesType })
}
