import {dataTypeList, replaceData,regExp, replaceMethod,responsesMapping } from '../util'
import {errorMethod, setErrData} from './errorMethod'
import {ApiName, testDefinitionsData} from '../index'
type ObjectMap<Key extends string | number | symbol = any, Value = any> = {
  [key in Key]: Value
}


// 编辑API
export function compileAPI({setPaths, setTagData}: ObjectMap) {
  // 处理参数，一般在 设置path taps 哪里已经处理了， 一般不会返回 Array类型的
  function compileApiParametersCommonTypes(item: any, error?: string ) {
    switch (item.type) {
      case 'integer':
        return  'number'
      case 'number':
        return  'number'
      case 'string':
        return  'string'
      case 'boolean':
        return  'boolean'
      case 'array':
        errorMethod( 'compileApiParametersCommonTypes array 有值', item, error)
        let type = 'any'
        if(item.items && item.items.type) {
          if(!dataTypeList.includes(item.items.type)) {
            errorMethod('compileApiParametersCommonTypes no type to array', item, error )
          }
          type = item.items.type
        } else {
          if(item.items) {
            errorMethod('compileApiParametersCommonTypes array', item, error)
          }
        }
        return `Array<${type}>`
      default:
        const showErrorMethod = item.originalRef
        if(showErrorMethod) {
          errorMethod( 'compileApiParametersCommonTypes default', item, error)
        }
        return  item.type
    }
  }

  function compileApiSetParametersType(item: ObjectMap) {
    if(item.originalRef) {
      if(testDefinitionsData[item.originalRef]) {
        if(item.originalRef === item.type ) {
          return `def.${ApiName}.${item.type}`
        } else {
          errorMethod('compileAPI setParamsBody body originalRef和type不一致')
        }
      } else {
        errorMethod('compileAPI setParamsBody body originalRef 和接口返回值没有匹配',item )
      }
    } else {
      return compileApiParametersCommonTypes(item, 'compileAPI ParametersCommonTypes')
    }
  }

  function setParamsBody(item: ObjectMap) {
    let returnData:ObjectMap = {}
    const keyList = Object.keys(item)
    const key = keyList[0]
    if(keyList.length >1)  errorMethod('compileAPI setParamsBody body有两个值及以上')
    if(!keyList.length)  errorMethod('compileAPI setParamsBody body没有值')
    const parametersType = item[key].parametersType
    returnData[`body${item[key].required? '' : '?'}`] = compileApiSetParametersType(parametersType)
    return returnData
  }
  function setParamsQuery(item: ObjectMap) {
    let returnData: ObjectMap = {}
    for (let i in item) {
      returnData[`${i}${item[i].required? '' : '?'}`]  = {type:compileApiSetParametersType(item[i].parametersType), description: item[i].parametersType.description }
    }
    return returnData
  }
  function setParamsPath(item: ObjectMap) {
    let returnData: any = []
    const keyList = Object.keys(item)
    // const key = keyList[0]
    returnData = keyList.map((key) => {
      return  {type:compileApiSetParametersType(item[key].parametersType), description: item[key].parametersType.description, key: `${key}${item[key].required? '' : '?'}` }
    })
    // returnData[`${key}${item[key].required? '' : '?'}`]  = {type:compileApiSetParametersType(item[key].parametersType), description: item[key].parametersType.description }
    // if(keyList.length > 1) errorMethod('compileAPI setRequestParameters path 有两个值', item, returnData)
    return returnData
  }
  function setRequestParameters(params: ObjectMap) {
    const returnData: ObjectMap = {}
    for (let i in params) {
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
    // if(!Object.keys(returnData).length) {
    //   errorMethod('returnData 数据为空', params)
    // }
    return returnData
  }

  function setResponsesData(params: ObjectMap) {
    function testResponsesData(item: string, call: () => void) {
      if(responsesMapping[item]) {
        return responsesMapping[item]
      } else if(testDefinitionsData[item]) {
        return `def.${ApiName}.${item}`
      } else {
        console.error('testResponsesData', item);
        call()
      }
      return  item
    }

    if(!params.originalRef) {
      // console.log(params);
      // errorMethod('params.originalRef')
      return 'any'
    }
    const replaceData =  params.originalRef.replace(regExp.typeT0, "")
    const matchData = params.originalRef.match(regExp.typeT0)
    let returnData = ''
    let returnMatchData = ''
    let error = ''
    if(matchData) {
      if(matchData.length === 1) {
        // returnMatchData =  matchData[0].replace(/\w*/g, function($1:any) {
        returnMatchData =  matchData[0].replace(/[\u4e00-\u9fa5_a-zA-Z0-9]*/g, function($1:any) {
          if($1) {
            return testResponsesData($1,() => { error = 'compileAPI setResponsesData matchData 数据错误 '})
          }
          return $1
        })
        returnMatchData = returnMatchData.replace(regExp.replaceT0, function($1) {
          if($1 === '«') {
            return '<'
          } else if($1 === '»') {
            return '>'
          }
          return $1
        })
        if(error) {
          errorMethod(error, params)
        }
      } else {
        errorMethod('compileAPI setResponsesData matchData数据大于2', params)
      }
    }
    if(!replaceData) {
      errorMethod('compileAPI setResponsesData replaceData 为空', params)
    } else {
      returnData = testResponsesData(replaceData,() => { errorMethod('compileAPI setResponsesData replaceData 数据错误', params)})
    }
    return `${returnData}${returnMatchData}`
  }
  let returnData:ObjectMap  = {}
  for (let i in setPaths ) {
    returnData[i] = {}
    setPaths[i].forEach((item: any, index:number) => {
      setErrData({data: setPaths[i], key: i, type: 'compileAPI——setPaths',item: item})
      const ApiParameters = setRequestParameters(item.requestParameters)
      const ApiResponsesData = setResponsesData(item.responsesData)
      returnData[i][item.namespace] = {...item, requestParameters: ApiParameters, responsesData: ApiResponsesData}
    })
  }

  let TagDataReturnData:ObjectMap  = {}
  for (let i in returnData) {
    TagDataReturnData[setTagData[i]] = returnData[i]
  }
  return returnData
}
