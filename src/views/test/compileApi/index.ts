import Axios from "../../../api";
type ObjectMap<Key extends string | number | symbol = any, Value = any> = {
  [key in Key]: Value
}

export function initApi({url}: any) {
  let ApiName = 'stock' // def API
  let setPathsTagsData: ObjectMap
  let setDefinitionsData: ObjectMap
  let testDefinitionsData: ObjectMap = {}
  let compileDefsData: ObjectMap = {}
  let compileAPIData: ObjectMap = {}

  const dataTypeList = ['integer', 'string', 'number', 'boolean']
  const regExp = {
    typeT0: /«\S*»/g,
    replaceT0: /[«»]/g,
    ListW: /«\w*»/g,  // 处理T0  «List«StockSkuCo»» List格式的
    sS: /\s\S/g,
    Using: /Using(POST|GET|PUT)\S*/g,
    Controller: / Controller$/g,
    removeTO: /<(\s|\S|\W\w)*>/g
  }
  let errData={}

  const replaceData = {
    TOAny: '<T0 = any>',
    TOString: 'T0'
  }
  const replaceMethod = {
    // 将空格转换为大写
    convertSpacesToUppercase: (item: string) => {
      return item.replace(regExp.sS, function($1) {
        return $1.replace(' ', '').toUpperCase()
      })
    },
    //将首字母改为小写
    changeInitialsToLowercase:(item: string) => {
      return item.replace(/^\S/g, function($1) {
        return $1.toLowerCase()
      })
    },
  }

  const responsesMapping: ObjectMap = {
    List: 'Array',
    Map: 'ObjectMap',
    object: 'ObjectMap',
    string: 'string',
    int: 'number',
    any: 'any',
  }
  return  new Promise((resolve) => {
    // Axios.get('http://192.168.120.180:28090/serverApi/rantion-oms/v2/api-docs').then((res: any) => {
    Axios.get(url).then((res: any) => {
    // Axios.get('http://192.168.120.179:9079/v2/api-docs').then((res: any) => {
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


  function errorMethod(item?:any,...arg:any[]) {
    console.error('errData', errData, item, ...arg);
  }


  function setDefinitions(item: any) {
    function setName(name: string, item: any) {
      let data = ''
      if(regExp.typeT0.test(name)) {
        data = name.replace(regExp.typeT0, "")+replaceData.TOAny
        item.regExpMatch  = name.match(regExp.typeT0)
      } else {
        data = name
      }
      return data
    }
    function setPropertiesType(properties: any, item: any, key: string  ) {
      let type = ''
      let originalRef = ''
      switch (properties.type) {
        case  'integer':
          type = 'number'
          break
        case  'number':
          type = 'number'
          break
        case 'string':
          type = 'string'
          break
        case 'array':
          if(properties.items && properties.items.originalRef) {
            // http://192.168.120.179:9079/v2/api-docs
            // ResponseDto«List«StockSkuCo»»
            // let data = {properties: {data: {
            //       "type": "array",
            //       "items": {
            //         "$ref": "#/definitions/StockSkuCo",
            //         "originalRef": "StockSkuCo"
            //       }
            //     }}}
            // regExpMatch主动加的
            if(item.regExpMatch) {
              if(item.regExpMatch[0].includes('«List«')) {
                const arrayList: any = item.regExpMatch[0].match(regExp.ListW)
                if(arrayList.length) {
                  if(properties.items.originalRef ===  arrayList[0].replace(regExp.replaceT0, "")) {
                    type = replaceData.TOString
                    break
                  }
                }
              }
              if(properties.items.originalRef ===  item.regExpMatch[0].replace(regExp.replaceT0, "")) {
                type =  `Array${replaceData.TOAny}`
                break
              }

              //通过报错判断过滤条件
              const showErrorMethod = !properties.items.originalRef
              if(showErrorMethod) {
                errorMethod('setPropertiesType  array regExpMatch', { properties, item, key})
              }
            }
            type = `Array<${properties.items.originalRef}>`
            originalRef = properties.items.originalRef
            break
          } else if(properties.items){
            const l:any = setPropertiesType(properties.items, item, key) || 'any'
            if(l.originalRef){
              errorMethod('setPropertiesType  Array setPropertiesType', { properties, item, key})
            }
            type = `Array<${l.type}>`
            break
          } else {
            errorMethod('setPropertiesType  array 空', { properties, item, key})
            type = '[]'
            break
          }
        case 'boolean':
          type = 'boolean'
          break
        default:
          if(item.regExpMatch) {
            if(item.regExpMatch[0].replace(/^\S|\S$/g, '') === properties.originalRef) {
              type = replaceData.TOString
              break
            }
          }
          if(properties.originalRef) {
            type = `${properties.originalRef}`
            originalRef = properties.originalRef
            break
          } else {
            const showErrorMethod = properties.type !== "object"
            if(showErrorMethod) {
              errorMethod('setPropertiesType  default', { properties, item, key})
            }
            type = 'any'
            break
          }
      }
      let filterObj = JSON.parse(JSON.stringify(properties))
      delete filterObj.type
      delete filterObj.originalRef
      // enum: properties.enum // 选择类型
      return  {type: type, originalRef: originalRef, ...filterObj }
    }
    let name = ''
    let exportClass = ''
    const definitionsObj:any = {} // 生成的exportClass对象， 用来过滤相同的exportClass
    let exportClassData:any = {}
    for(let i in item) {
      name = setName(i, item[i])
      errData = {data: item[i], key: i, type: 'setDefinitions', name:name}
      if(definitionsObj[name]) {
        continue
      }
      definitionsObj[name] = true
      let description = ''
      const properties = item[i].properties

      // 调试节点
      // if(i !== 'AsMaterialRejectBillRequestDto') {
      //   continue
      // }
      // console.log(item[i]);


      exportClassData[name] = {
        properties:properties,//只用于参考数据，可以屏蔽
        key:i,//只用于参考数据，可以屏蔽
        data:  item[i],//只用于参考数据，可以屏蔽
        setData: {},
        required: item[i].required
      }

      for (let l in properties) {
        const setPropertiesTypeData = setPropertiesType(properties[l], item[i], l)
        // description += `
        // ${properties[l].description ? `/** ${properties[l].description} */` : ''}
        // ${l}:${setPropertiesTypeData}
        // `
        exportClassData[name].setData[l] = { setPropertiesTypeData:setPropertiesTypeData, description:properties[l].description }
      }
      // exportClass += `
      //   export class ${name} {
      //   ${description}
      //  }
      //  `
    }

    return exportClassData
  }





  // 设置path taps
  function setPathsTags(pathData: any, tagData: any) {
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
        errData = {data: pathData[i], key: i, type: 'setPathsTags', namespace, tags: pathData[i][requestMethod].tags}
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
    setPaths(pathData)
    setTagData(tagData)
    return { setPaths:setPaths(pathData),  setTagData: setTagData(tagData) }
  }


  //编辑Defs
  function compileDefs(definitionsData: ObjectMap) {
    function setParameter(item: any) {
      let data = {description: item.description, type: item.setPropertiesTypeData.type}
      if(item.setPropertiesTypeData.enum) { //类型的选择项
        if(data.type  === 'string') {
          data.type = item.setPropertiesTypeData.enum.join(' | ')
        } else {
          errorMethod('setParameter enum type类型不等string', item)
        }
      }
      if(item.setPropertiesTypeData.originalRef) {
        if(definitionsData[item.setPropertiesTypeData.originalRef]) {
          data.type = data.type.replace(item.setPropertiesTypeData.originalRef, `defs.${ApiName}.${item.setPropertiesTypeData.originalRef}`)
        }else {
          errorMethod('setParameter item.setPropertiesTypeData 没有匹配', item)
        }
      }
      return data
    }
    let targetTypeData:ObjectMap = {}
    let targetTypeDescriptionData:ObjectMap = {}
    for(let i in definitionsData) {
      targetTypeData[i] = {}
      targetTypeDescriptionData[i] = {}
      for (let j in definitionsData[i].setData) {
        errData = {data: definitionsData[i], key: j, type: 'compileDefs'}
        const parameter = definitionsData[i].setData[j]
        const setData = setParameter(parameter)
        let parameterKey = `${j}?`
        // 判断是否必填
        if(definitionsData[i].required && definitionsData[i].required.includes(j)) {
          parameterKey = j
        }
        targetTypeData[i][parameterKey] = setData.type
        if(setData.description) {
          targetTypeDescriptionData[i][setData.description] = j
        }
      }
    }
    return {targetTypeData, targetTypeDescriptionData}
  }


  // 编辑API
  function compileAPI({setPaths, setTagData}: ObjectMap) {
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
        errData = {data: setPaths[i], key: i, type: 'compileAPI——setPaths',item: item}
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
}
