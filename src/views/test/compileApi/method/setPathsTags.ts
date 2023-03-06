import { regExp, replaceMethod } from '../util'
import { errorMethod, setErrData } from './errorMethod'

// 设置path taps
export function setPathsTags(pathData: any, tagData: any) {
	return { setPaths: setPaths(pathData), setTagData: setTagData(tagData) }
}
function setPaths(pathData: any) {
	function setNamespace(item: any) {
		return item.operationId.replace(regExp.Using, '')
	}
	function setParameters(item: any) {
		console.log('item', item)
		const noList = ['debug', 'payload']
		const filterList = ['query', 'body', 'path']
		const returnData: any = {}
		item?.forEach((res: any) => {
			if (noList.includes(res.name)) return
			if (filterList.includes(res.in)) {
				if (!returnData[res.in]) {
					returnData[res.in] = [res]
				} else {
					returnData[res.in].push(res)
				}
			} else {
				errorMethod('setParameters  不是body和query和path', item)
			}
		})
		return returnData
	}
	function setResponses(item: ObjectMap<number, any> = {}) {
		const responses = { data: item, originalRef: '' }
		const list = ['200']
		for (const i in item) {
			if (list.includes(i + '')) {
				if (item[i].schema) {
					responses.originalRef = item[i]?.schema.originalRef
				} else {
					// errorMethod('setResponses 200  schema 没有 originalRef')
					responses.originalRef = 'any'
				}
			}
		}
		return responses
	}

	let namespace = '' // export namespace
	let requestParameters = '' //接口收入参数
	let requestMethod = '' // 请求接口方法
	let responsesData = {} // 请求接口返回数据
	const tagsList: any = {}

	for (const i in pathData) {
		requestMethod = Object.keys(pathData[i])[0]
		namespace = setNamespace(pathData[i][requestMethod])
		console.log('pathData[i]', pathData[i], requestMethod)
		setErrData({ data: pathData[i], key: i, type: 'setPathsTags', namespace, tags: pathData[i][requestMethod].tags })
		requestParameters = setParameters(pathData[i][requestMethod].parameters)
		responsesData = setResponses(pathData[i][requestMethod].responses)
		const setData = {
			data: pathData[i], //只用于参考数据，可以屏蔽
			summary: pathData[i][requestMethod].summary, // 备注名称
			namespace: namespace,
			requestMethod: requestMethod,
			requestParameters: requestParameters,
			responsesData: responsesData
		}
		pathData[i][requestMethod].tags.forEach((item: any) => {
			if (!tagsList[item]) {
				tagsList[item] = []
				tagsList[item].push(setData)
			} else {
				tagsList[item].push(setData)
			}
		})
	}
	return tagsList
}

function setTagData(tagData: any) {
	const obj: any = {}
	tagData.forEach((item: any) => {
		let data = item.description.replace(regExp.Controller, '')
		data = replaceMethod.changeInitialsToLowercase(data)
		data = replaceMethod.convertSpacesToUppercase(data)
		obj[item.name] = data
	})
	return obj
}
