import Axios from "../../../api";
type ObjectMap<Key extends string | number | symbol = any, Value = any> = {
  [key in Key]: Value
}


import {regExp} from './util'
import {compileAPI} from './method/compileAPI'
import {compileDefs} from './method/compileDefs'
import {setDefinitions} from './method/setDefinitions'
import {setPathsTags} from './method/setPathsTags'



export let ApiName = 'stock' // def API
let setPathsTagsData: ObjectMap
let setDefinitionsData: ObjectMap
export let testDefinitionsData: ObjectMap = {}
let compileDefsData: ObjectMap = {}
let compileAPIData: ObjectMap = {}



import testData from './test.json'
export function initApi({url}: any) {
  return  new Promise((resolve) => {
    // Axios.get(url).then((res: any) => {
    let res:any= {}
    res.data = testData
    console.log('res.data', res.data)
    let list = ['data', 'key', 'properties', 'parameters']
    function deleteListData(item:any) {
      list.forEach(l => {
        delete item[l]
      })
    }

    setPathsTagsData = setPathsTags(res.data.paths, res.data.tags)
    setDefinitionsData = setDefinitions(res.data.definitions)

    for (let i in setDefinitionsData) {
      const key = i.replace(regExp.removeTO, '')
      testDefinitionsData[key] = true
    }

    for(let i in setPathsTagsData.setPaths ) {
      setPathsTagsData.setPaths[i].forEach((res: any) => {
        deleteListData(res)
        deleteListData(res.responsesData)
      })
    }
    for(let i in setDefinitionsData ) {
      deleteListData(setDefinitionsData[i])
    }
    // compileDefsData =  compileDefs(setDefinitionsData)
    compileAPIData =  compileAPI(setPathsTagsData)
    // console.log('setPathsTagsData', setPathsTagsData);
    // console.log('setDefinitionsData', setDefinitionsData);
    // console.log('compileDefsData', compileDefsData);
    // console.log('compileAPIData', compileAPIData);

    resolve({compileAPIData: compileAPIData, compileDefsData,setTagData: setPathsTagsData.setTagData  })
    // })
  })
}
