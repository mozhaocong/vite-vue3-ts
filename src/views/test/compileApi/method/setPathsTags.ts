type ObjectMap<Key extends string | number | symbol = any, Value = any> = {
  [key in Key]: Value
}

import {dataTypeList, replaceData,regExp, replaceMethod,responsesMapping } from '../util'
import {errorMethod, setErrData} from './errorMethod'
import {ApiName} from '../index'

// 设置path taps
export function setPathsTags(pathData: any, tagData: any) {
  return { setPaths:setPaths(pathData),  setTagData: setTagData(tagData) }
}
function setPaths(pathData: any) {
  //parameters基础类型判断
  function parametersCommonTypes(item: any ) {
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
        let type = 'any'
        if(item.items && item.items.type) {
          if(!dataTypeList.includes(item.items.type)) {
            errorMethod('setPaths requestParameters  no type to array', item )
          }
          type = item.items.type
        } else {
          if(item.items) {
            errorMethod('setPaths requestParameters array', item, )
          }
        }
        return `Array<${type}>`
      default:
        errorMethod( 'setPaths requestParameters default', item)
        return  ''
    }
  }

  function setNamespace(item:any) {
    return item.operationId.replace(regExp.Using, '')
  }
  function setParametersType(item:any) {
    let parametersType = ''
    let originalRef = item.originalRef
    let description = item.description
    switch (item.in) {
      case 'query':
        parametersType = parametersCommonTypes(item)
        break
      case 'body':
        if(item.schema.originalRef) {
          parametersType = item.schema.originalRef
          originalRef = item.schema.originalRef
        } else if(item.schema) {
          if(item.schema.items && item.schema.items.originalRef) {
            parametersType = item.schema.type
            originalRef = item.schema.items.originalRef
          } else {
            parametersType = parametersCommonTypes(item.schema)
          }
        } else {
          errorMethod('body parametersType', item)
        }
        break
      case 'path':
        parametersType = parametersCommonTypes(item)
        break
      default:
        errorMethod('setParametersType in 不是body和query和path', item.in)
    }
    return { type: parametersType, originalRef: originalRef, description }
  }
  function setParameters(item:any) {
    let list = ['debug', 'payload']
    let obj: any = {}
    let parametersType = {}
    let data
    item.forEach((res:any) => {
      if(list.includes(res.name)) return
      parametersType =  setParametersType(res)
      const filterObj = JSON.parse(JSON.stringify(res))
      delete filterObj.parametersType
      delete filterObj.required
      data = {
        parametersType:parametersType,
        required:res.required,
        ...filterObj
      }
      if(!obj[res.in]) {
        obj[res.in] = {}
        obj[res.in][res.name] = data
      } else {
        obj[res.in][res.name] = data
      }
    })
    return obj
  }
  function setResponses(item: ObjectMap<number, any>) {
    let responses = {data: item, originalRef: '' }
    const list = ['200']
    for(let i in item) {
      if(list.includes(i + '')) {
        if(item[i].schema) {
          responses.originalRef = item[i]?.schema.originalRef
        } else {
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
  let tagsList: any = {}



  for (let i in pathData) {
    requestMethod = Object.keys(pathData[i])[0]
    namespace = setNamespace(pathData[i][requestMethod])
    setErrData( {data: pathData[i], key: i, type: 'setPathsTags', namespace, tags: pathData[i][requestMethod].tags})
    requestParameters = setParameters(pathData[i][requestMethod].parameters)
    responsesData = setResponses(pathData[i][requestMethod].responses)
    const setData = {
      data:pathData[i], //只用于参考数据，可以屏蔽
      parameters:pathData[i][requestMethod].parameters, //只用于参考数据，可以屏蔽
      summary: pathData[i][requestMethod].summary, // 备注名称
      namespace: namespace,
      requestMethod:requestMethod,
      requestParameters:requestParameters,
      responsesData: responsesData
    }
    pathData[i][requestMethod].tags.forEach((item:any) => {
      if(!tagsList[item]) {
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
  let obj:any = {}
  tagData.forEach((item: any) => {
    let data = item.description.replace(regExp.Controller, '')
    data =replaceMethod.changeInitialsToLowercase(data)
    data = replaceMethod.convertSpacesToUppercase(data)
    obj[item.name] = data
  })
  return obj
}
