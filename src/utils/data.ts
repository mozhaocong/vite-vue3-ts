import { isNil } from 'ramda'

export function clone(data: any) {
	return JSON.parse(JSON.stringify(data))
}

export function ArrayKeyToObjet(list: Array<ObjectMap>, key: string): ObjectMap {
	const data: ObjectMap = {}
	list.forEach((item) => {
		if (item[key]) {
			data[item[key]] = item
		}
	})
	return data
}

export function setObjetToObject(data: ObjectMap, setData: ObjectMap) {
	for (const i in data) {
		if (!isNil(setData[i])) {
			data[i] = setData[i]
		}
	}
}

// 递归深拷贝
export function deepClone(source: any) {
	if (typeof source !== 'object') {
		// 非对象类型(undefined、boolean、number、string、symbol)，直接返回原值即可
		return source
	}
	if (source === null) {
		// 为null类型的时候
		return source
	}
	if (source instanceof Date) {
		// Date类型
		return new Date(source)
	}
	if (source instanceof RegExp) {
		// RegExp正则类型
		return new RegExp(source)
	}
	let result: any
	if (Array.isArray(source)) {
		// 数组
		result = []
		source.forEach((item) => {
			result.push(deepClone(item))
		})
		return result
	} else {
		// 为对象的时候
		result = {}
		const keys = [...Object.getOwnPropertyNames(source), ...Object.getOwnPropertySymbols(source)] // 取出对象的key以及symbol类型的key
		keys.forEach((key) => {
			const item = source[key]
			result[key] = deepClone(item)
		})
		return result
	}
}
