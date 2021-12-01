import { isString } from '@/utils/typeJudgment'
import { deepClone } from '@/utils/data'
import { responsesMapping } from '@/compileApi/util'
function checkPropertiesType(item: any) {
	const checkObject: ObjectMap = {}
	for (const keyA in item) {
		const itemKey = item[keyA]
		if (itemKey.properties) {
			for (const KeyB in itemKey.properties) {
				const propertiesKey = itemKey.properties[KeyB]
				for (const keyB in propertiesKey) {
					// if (['originalRef', 'enum'].includes(keyB)) {
					if (['type'].includes(keyB)) {
						// console.log('includes', propertiesKey)
					}
					checkObject[keyB] = true
				}
			}
		}
	}
	console.log('checkObject', checkObject)
}

// function objectForSetData(data: ObjectMap, ArrayList: Array<{ call?: (item: any) => void; key: string | boolean }>) {
// 	const item = deepClone(ArrayList)
// 	const itemData = item.shift()
// 	if (!itemData) return
// 	const key = itemData.key
// 	for (const dataKey in data) {
// 		if (isString(key)) {
// 			if (data[dataKey][key]) {
// 				if (itemData.call) {
// 					itemData.call({ data: data[dataKey][key], parent: data[dataKey] })
// 				}
// 				objectForSetData(data[dataKey][key], item)
// 			}
// 		} else {
// 			if (itemData.call) {
// 				itemData.call({ data: data[dataKey], parent: data })
// 				objectForSetData(data[dataKey], item)
// 			}
// 		}
// 	}
// }

export function analyticalData(item: any) {
	console.log(item)
	// checkPropertiesType(item)

	for (const keyA in item) {
		const itemKey = item[keyA]
		for (const keyB in itemKey.properties) {
			const propertiesKey = itemKey.properties[keyB]
			setPropertiesKeyData({ key: keyB, ...propertiesKey })
		}
	}
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
	format: true
	items: true
	description: true
	$ref: true
	originalRef: true
	enum: true
}

function setProperType(item: undefined | string) {
	if (!item) return ''
	if (responsesMapping[item]) {
		return responsesMapping[item]
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
		type = type ? type + ',' : '' + itemsType
		originalRef = originalRef ? originalRef + ',' : '' + itemsOriginalRef
	}
	returnData.type = type
	returnData.originalRef = originalRef
	console.log(returnData)
}
