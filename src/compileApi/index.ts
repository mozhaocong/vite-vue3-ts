import Axios from '@/api'
type ObjectMap<Key extends string | number | symbol = any, Value = any> = {
	[key in Key]: Value
}

import { regExp } from './util'
import { compileAPI } from './method/compileAPI'
import { compileDefs } from './method/compileDefs'
import { setDefinitions } from './method/setDefinitions'
import { setPathsTags } from './method/setPathsTags'
import { setRequestDefinition } from '@/compileApi/method/setRequestDefinition'

export let ApiName = 'stock' // def API
let setPathsTagsData: ObjectMap
let setDefinitionsData: ObjectMap
let setRequestDefinitionData: ObjectMap
export const testDefinitionsData: ObjectMap = {}
let compileDefsData: ObjectMap = {}
let compileAPIData: ObjectMap = {}
export function initApi({ url, apiName }: any) {
	return new Promise((resolve) => {
		Axios.get(url).then((res: any) => {
			const list = ['data', 'key', 'properties', 'parameters']
			function deleteListData(item: any) {
				list.forEach((l) => {
					delete item[l]
				})
			}
			ApiName = apiName || 'stock'
			setRequestDefinitionData = setRequestDefinition(res.data.definitions)
			setPathsTagsData = setPathsTags(res.data.paths, res.data.tags)
			setDefinitionsData = setDefinitions(res.data.definitions)

			for (const i in setDefinitionsData) {
				const key = i.replace(regExp.removeTO, '')
				testDefinitionsData[key] = true
			}

			for (const i in setPathsTagsData.setPaths) {
				setPathsTagsData.setPaths[i].forEach((res: any) => {
					deleteListData(res)
					deleteListData(res.responsesData)
				})
			}
			for (const i in setDefinitionsData) {
				deleteListData(setDefinitionsData[i])
			}
			compileDefsData = compileDefs(setDefinitionsData)
			compileAPIData = compileAPI(setPathsTagsData)
			// console.log('setPathsTagsData', setPathsTagsData);
			// console.log('setDefinitionsData', setDefinitionsData);
			// console.log('compileDefsData', compileDefsData);
			// console.log('compileAPIData', compileAPIData);

			resolve({
				compileAPIData: compileAPIData,
				compileDefsData,
				setTagData: setPathsTagsData.setTagData,
				setRequestDefinitionData
			})
		})
	})
}
