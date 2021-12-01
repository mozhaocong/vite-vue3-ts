import { isString } from '@/utils/typeJudgment'
import { deepClone } from '@/utils/data'
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
						console.log('includes', propertiesKey)
					}
					checkObject[keyB] = true
				}
			}
		}
	}
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
	const attributes = {
		key: '',
		type: '',
		originalRef: '',
		description: '',
		child: []
	}

	console.log(item)
	// checkPropertiesType(item)
}
