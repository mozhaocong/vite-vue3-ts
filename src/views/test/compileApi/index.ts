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








export function initApi({url}: any) {
  return  new Promise((resolve) => {
    Axios.get(url).then((res: any) => {
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
      compileDefsData =  compileDefs(setDefinitionsData)
      compileAPIData =  compileAPI(setPathsTagsData)
      console.log('setPathsTagsData', setPathsTagsData);
      // console.log('setDefinitionsData', setDefinitionsData);
      // console.log('compileDefsData', compileDefsData);
      // console.log('compileAPIData', compileAPIData);

       resolve({compileAPIData: compileAPIData, compileDefsData,setTagData: setPathsTagsData.setTagData  })
    })
  })
  // const  dataasda = '«List«WmsInterceptResultsDto»»'
  // console.log(dataasda.replace(/\w*/g, function($1,$2, $3) {
  //   return $1
  // }))
  //
  // const dastastsa  = 'ResponseDto«List«StockSkuCo»»'
  // console.log(dastastsa.includes('List'))
  // const datastdasgas: any = dastastsa.match(regExp.typeT0)
  // let dastas:any=''
  // if(datastdasgas.length) {
  //   console.log('datastdasgas', datastdasgas);
  //   dastas = datastdasgas[0].match(regExp.ArrayW)[0].replace(regExp.replaceT0, '')
  //
  // }
  // console.log('name.match(regExp.typeT0)', dastas);

}
