export const dataTypeList = ['integer', 'string', 'number', 'boolean']
export const regExp = {
	typeT0: /«\S*»/g,
	replaceT0: /[«»]/g,
	ListW: /«\w*»/g, // 处理T0  «List«StockSkuCo»» List格式的
	sS: /\s\S/g,
	Using: /Using(POST|GET|PUT)\S*/g,
	Controller: / Controller$/g,
	removeTO: /<(\s|\S|\W\w)*>/g,
	ChineseEnglish: /[\u4e00-\u9fa5_a-zA-Z0-9]*/g
}
type ObjectMap<Key extends string | number | symbol = any, Value = any> = {
	[key in Key]: Value
}

export const replaceData = {
	TOAny: '<T0 = any>',
	TOString: 'T0'
}
export const replaceMethod = {
	// 将空格转换为大写
	convertSpacesToUppercase: (item: string) => {
		return item.replace(regExp.sS, function ($1) {
			return $1.replace(' ', '').toUpperCase()
		})
	},
	//将首字母改为小写
	changeInitialsToLowercase: (item: string) => {
		return item.replace(/^\S/g, function ($1) {
			return $1.toLowerCase()
		})
	}
}

export const responsesMapping: ObjectMap = {
	List: 'Array',
	Map: 'ObjectMap',
	object: 'ObjectMap',
	string: 'string',
	int: 'number',
	any: 'any'
}
