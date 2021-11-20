import { dataTypeList, regExp, responsesMapping } from '../util'
import { errorMethod, setErrData } from './errorMethod'
import { ApiName, testDefinitionsData } from '../index'
type ObjectMap<Key extends string | number | symbol = any, Value = any> = {
	[key in Key]: Value
}

// 编辑API
export function compileAPI({ setPaths, setTagData }: ObjectMap) {
	const returnData: ObjectMap = {}
	for (const i in setPaths) {
		returnData[i] = {}
		setPaths[i].forEach((item: any) => {
			setErrData({ data: setPaths[i], key: i, type: 'compileAPI——setPaths', item: item })
			const ApiParameters = setRequestParameters(item.requestParameters)
			const ApiResponsesData = setResponsesData(item.responsesData)
			returnData[i][item.namespace] = { ...item, requestParameters: ApiParameters, responsesData: ApiResponsesData }
		})
	}
	for (const i in returnData) {
		for (const j in returnData[i]) {
			const ijData = returnData[i][j]
			ijData.apiName = `API.${ApiName}.${setTagData[i]}.${j}`
			ijData.requestParameters = specialTreatment(ijData.requestParameters)
		}
	}
	return returnData
}

function specialTreatment(item: ObjectMap) {
	const data = JSON.stringify(item)
	return JSON.parse(data.replace(/records\[0\]\./g, ''))
}

function setResponsesData(params: ObjectMap) {
	function testResponsesData(item: string, call: () => void) {
		if (responsesMapping[item]) {
			return responsesMapping[item]
		} else if (testDefinitionsData[item]) {
			return `def.${ApiName}.${item}`
		} else {
			call()
		}
		return item
	}

	if (!params.originalRef) {
		// console.log(params);
		// errorMethod('params.originalRef')
		return 'any'
	}
	const replaceData = params.originalRef.replace(regExp.typeT0, '')
	const matchData = params.originalRef.match(regExp.typeT0)
	let returnData = ''
	let returnMatchData = ''
	let error = ''
	if (matchData) {
		if (matchData.length === 1) {
			returnMatchData = matchData[0].replace(regExp.ChineseEnglish, function ($1: any) {
				if ($1) {
					return testResponsesData($1, () => {
						error = 'compileAPI setResponsesData matchData 数据错误 '
					})
				}
				return $1
			})
			returnMatchData = returnMatchData.replace(regExp.replaceT0, function ($1) {
				if ($1 === '«') {
					return '<'
				} else if ($1 === '»') {
					return '>'
				}
				return $1
			})
			if (error) {
				errorMethod(error, params)
			}
		} else {
			errorMethod('compileAPI setResponsesData matchData数据大于2', params)
		}
	}
	if (!replaceData) {
		errorMethod('compileAPI setResponsesData replaceData 为空', params)
	} else {
		returnData = testResponsesData(replaceData, () => {
			errorMethod('compileAPI setResponsesData replaceData 数据错误', params)
		})
	}
	return `${returnData}${returnMatchData}`
}

function compileApiParametersCommonTypes(item: any, error?: string) {
	switch (item.type) {
		case 'integer':
			return 'number'
		case 'number':
			return 'number'
		case 'string':
			return 'string'
		case 'boolean':
			return 'boolean'
		case 'array': {
			let type = 'any'
			if (item.items && item.items.type) {
				if (!dataTypeList.includes(item.items.type)) {
					errorMethod('compileApiParametersCommonTypes no type to array', item, error)
				}
				type = item.items.type
			} else if (item.items && item.items.$ref && item.items.originalRef) {
				if (testDefinitionsData[item.items.originalRef]) {
					return `Array<def.${ApiName}.${item.items.originalRef}>`
				} else {
					errorMethod('compileApiParametersCommonTypes originalRef 参数错误 ', item, error)
				}
			} else {
				if (item.items) {
					errorMethod('compileApiParametersCommonTypes array', item, error)
				}
			}
			return `Array<${type}>`
		}
		default: {
			const showErrorMethod = item.originalRef
			if (showErrorMethod) {
				errorMethod('compileApiParametersCommonTypes default', item, error)
			}
			return item.type
		}
	}
}

function compileApiSetParametersType(item: ObjectMap) {
	if (item.originalRef) {
		if (testDefinitionsData[item.originalRef]) {
			return `def.${ApiName}.${item.originalRef}`
		} else {
			errorMethod('compileAPI setParamsBody body originalRef 和接口返回值没有匹配', item)
		}
	} else {
		return compileApiParametersCommonTypes(item, 'compileAPI ParametersCommonTypes')
	}
}

const bodyList = ['description', 'in', 'name', 'required', 'schema', 'format']
const schemaList = ['$ref', 'originalRef', 'type', 'items', 'format']
const queryParameterList = [
	'description',
	'format',
	'in',
	'name',
	'required',
	'type',
	'items',
	'collectionFormat',
	'default'
]
const paramsParameterList = ['description', 'in', 'name', 'required', 'type', 'format']

function inspectListError(res: ObjectMap, list: string[], error: any) {
	for (const i in res) {
		if (!list.includes(i)) {
			errorMethod(error, i)
		}
	}
}

function setParamsBody(item: any[]) {
	const returnData: ObjectMap = {}
	item.forEach((res) => {
		inspectListError(res, bodyList, ['setParamsBody bodyList找不到对应值', item])
		if (res.schema) {
			inspectListError(res.schema, schemaList, ['setParamsBody schemaList找不到对应值', item])
			returnData.type = setSchema(res.schema)
		} else {
			errorMethod('compileAPI setRequestParameters setParamsBody res.schema为空', item)
		}
		returnData.key = `body`
		returnData.required = res.required
	})

	function setSchema(schema: ObjectMap) {
		if (schema.originalRef) {
			return compileApiSetParametersType(schema)
		} else if (schema.type) {
			return compileApiParametersCommonTypes(schema, 'setSchema schema.type && schema.items')
		} else {
			errorMethod('setSchema originalRef为空')
			return 'any'
		}
	}
	if (item.length > 1) errorMethod('setParamsBody body有两个值及以上')
	return returnData
}
function setParamsQuery(item: any[]) {
	const returnData: any[] = []
	item.forEach((res) => {
		inspectListError(res, queryParameterList, ['setParamsQuery queryParameterList找不到对应值', res])
		returnData.push({
			key: `${res.name}`,
			required: res.required,
			type: compileApiSetParametersType(res),
			description: res.description
		})
	})
	return returnData
}
function setParamsPath(item: any[]) {
	const returnData: any[] = []
	item.forEach((res) => {
		inspectListError(res, paramsParameterList, ['setParamsPath paramsParameterList找不到对应值', res])
		returnData.push({
			key: `${res.name}`,
			required: res.required,
			type: compileApiSetParametersType(res),
			description: res.description
		})
	})
	return returnData
}
function setRequestParameters(params: ObjectMap) {
	const returnData: ObjectMap = {}
	for (const i in params) {
		switch (i) {
			case 'body':
				returnData.body = setParamsBody(params[i])
				break
			case 'query':
				returnData.query = setParamsQuery(params[i])
				break
			case 'path':
				returnData.path = setParamsPath(params[i])
				break
			default:
				errorMethod('compileAPI setRequestParameters 不是body和query和path', params)
		}
	}
	return returnData
}
