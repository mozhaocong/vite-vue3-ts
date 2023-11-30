import { defineComponent } from 'vue'
import Axios from '@/api'
import { getTargetApiData, setKnife4jApiData } from '@/views/knife4j/_module'
import { arrayToObject, getArrayReduceObject, isTrue } from 'html-mzc-tool'
import { errLog, getListDataType, schemaRefMethod, setErrData } from '@/views/knife4j/_module/toolMethod'
import { last } from 'ramda'

export default defineComponent({
	name: 'knife4j',
	setup() {
		Axios.get('https://supply-gateway-test.htwig.com/scm/v3/api-docs').then((res: any) => {
			const { data } = res
			const pathList = setKnife4jApiData({ data })
			const testData = { tag: '质检', children: [{ path: '/scm/scm/qcConfig/qcDefectConfigList' }] }
			const result: any[] = getTargetApiData({ pathList: pathList, targetItem: testData, apiData: data }) || []

			// console.log('result', result)
			let mapData = {}
			result.forEach((forItem) => {
				const { path, methods, ...attrs } = forItem
				const pathSplit = path.substring(1).split('/')
				const typeName = last(pathSplit)
				const requestBodyData = getArrayReduceObject(attrs, ['requestBodyData', 'content', 'data'])
				const requestBodyType = getListDataType({
					listData: requestBodyData,
					apiData: data,
					typeName: typeName + 'RequestBody',
					dataSource: forItem
				})
				try {
					const responsesData = getArrayReduceObject(attrs, ['responsesData', '200', 'data'])
					const responsesType = getListDataType({
						listData: responsesData,
						apiData: data,
						typeName: typeName + 'Responses',
						dataSource: forItem
					})
					mapData = arrayToObject(mapData, pathSplit, (item) => {
						return { ...item, [methods]: { ...attrs, path, requestBodyType, responsesType } }
					})
				} catch (e) {
					console.log('生成模版报错', forItem)
				}
			})
			console.log('mapData', mapData)
		})
		return () => <div>1</div>
	}
})
