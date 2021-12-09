import { isString } from '@/utils/typeJudgment'
import { deepClone } from '@/utils/data'
import { responsesMapping } from '@/compileApi/util'
import { errorMethod, setErrData } from '@/compileApi/method/errorMethod'
function checkPropertiesType(item: any) {
	const checkObject: ObjectMap = {}
	for (const keyA in item) {
		const itemKey = item[keyA]
		if (itemKey.properties) {
			for (const KeyB in itemKey.properties) {
				const propertiesKey = itemKey.properties[KeyB]
				for (const keyB in propertiesKey) {
					// if (['originalRef', 'enum'].includes(keyB)) {
					if (['exclusiveMinimum'].includes(keyB)) {
						console.log('includes', propertiesKey)
					}
					checkObject[keyB] = true
				}
			}
		}
	}
	console.log('checkObject', checkObject)
}

function checkitemType(item: ObjectMap) {
	const data: ObjectMap = {}
	for (const itemKey in item) {
		for (const itemKeyKey in item[itemKey]) {
			data[itemKeyKey] = true
		}
	}
	console.log(data)
}

export function analyticalData(item: any) {
	// console.log(item)
	// checkPropertiesType(item)
	// checkitemType(item)
	const dataList: ObjectMap<string, itemType> = {}
	for (const keyA in item) {
		const itemKey = item[keyA]
		dataList[keyA] = { ...itemKey, properties: [] }
		setErrData({ data: item[keyA], key: keyA, type: 'analyticalData' })
		for (const keyB in itemKey.properties) {
			const propertiesKey = itemKey.properties[keyB]
			dataList[keyA].properties.push(setPropertiesKeyData({ key: keyB, ...propertiesKey }))
		}
	}
	// console.log('dataList', dataList)
	return dataList
}

type attributes = {
	key: string
	type?: string
	originalRef?: string
	description?: string
	child?: any[]
	enum?: any
}

type propertiesType = {
	type: true
	description: true
	format: true
	minimum: true
	exclusiveMinimum: true
	items: true
	$ref: true
	originalRef: true
	uniqueItems: true
	minLength: true
	maxLength: true
}
type itemType = {
	type: string
	properties: any[]
	title: string
	description: string
	required: any
}

function setProperType(item: undefined | string) {
	if (!item) return ''
	if (responsesMapping[item]) {
		return responsesMapping[item]
	} else {
		errorMethod('analyticalData setProperType 找不到', item)
	}
	return ''
}
function setOriginalRef(item: undefined | string) {
	if (!item) return ''
	return item
}

function setPropertiesKeyData(item: ObjectMap) {
	const returnData: attributes = { key: item.key, description: item.description, enum: item.enum }
	let type = setProperType(item.type)
	let originalRef = setOriginalRef(item.originalRef)
	let itemsType = ''
	let itemsOriginalRef = ''
	if (item.items) {
		itemsType = setProperType(item.items.type)
		itemsOriginalRef = setOriginalRef(item.items.originalRef)
		type = type ? type + (itemsType ? ',' + itemsType : '') : itemsType
		originalRef = originalRef ? (originalRef + itemsOriginalRef ? ',' + itemsOriginalRef : '') : itemsOriginalRef
	}
	returnData.type = type
	returnData.originalRef = originalRef
	return returnData
}
