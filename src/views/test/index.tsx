import { defineComponent } from 'vue'
import Axios from '../../api/index'
type ObjectMap<Key extends string | number | symbol = any, Value = any> = {
  [key in Key]: Value
}

export default defineComponent({
  name: 'TestMZC',
  setup() {


    let ApiName = 'stock' // def API

    Axios.get('http://192.168.120.180:28090/serverApi/rantion-oms/v2/api-docs').then((res: any) => {
    //   Axios.get('http://192.168.120.179:9079/v2/api-docs').then((res: any) => {


      let list = ['data', 'key', 'properties', 'parameters']
      function deleteListData(item:any) {
        list.forEach(l => {
          delete item[l]
        })
      }

      // const setPathsTagsData = setPathsTags(res.data.paths, res.data.tags)
      const setDefinitionsData = setDefinitions(res.data.definitions)
      // for(let i in setPathsTagsData.setPaths ) {
      //   setPathsTagsData.setPaths[i].forEach((res: any) => {
      //     deleteListData(res)
      //     deleteListData(res.responsesData)
      //   })
      // }
      for(let i in setDefinitionsData ) {
        deleteListData(setDefinitionsData[i])
      }
      // console.log('setPathsTagsData', setPathsTagsData);
      // console.log('setPathsTagsData', setDefinitionsData);
      compileDefs(setDefinitionsData)
    })

    const dataTypeList = ['integer', 'string', 'number', 'boolean']
    const regExp = {
      typeT0: /«\S*»/g,
      replaceT0: /[«»]/g,
      ListW: /«\w*»/g,  // 处理T0  «List«StockSkuCo»» List格式的
      sS: /\s\S/g,
      Using: /Using(POST|GET|PUT)\S*/g,
      Controller: / Controller$/g
    }

    const replaceData = {
      TOAny: '<T0 = any>',
      TOString: 'T0'
    }

    const replaceMethod = {
      // 将空格转换为大写
      convertSpacesToUppercase: ((item: string) => {
        return item.replace(regExp.sS, function($1) {
          return $1.replace(' ', '').toUpperCase()
        })
      }),
      //将首字母改为小写
      changeInitialsToLowercase:((item: string) => {
        return item.replace(/^\S/g, function($1) {
          return $1.toLowerCase()
        })
      })
    }


    // const dasda = 'As Material Reject Bill Facade Impl'
    // console.log('dasda', replaceMethod.convertSpacesToUppercase(dasda))
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

    let errData={}
    function errorMethod(item?:any) {
      console.error('errData' , item, errData);
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
                  console.log('setPropertiesType  array regExpMatch', { properties, item, key});
                  errorMethod()
                }
              }
              type = `Array<${properties.items.originalRef}>`
              originalRef = properties.items.originalRef
              break
            } else if(properties.items){
              const l:any = setPropertiesType(properties.items, item, key) || 'any'
              if(l.originalRef){
                  console.log('setPropertiesType  Array setPropertiesType', { properties, item, key});
                  errorMethod()
              }
              type = `Array<${l.type}>`
              break
            } else {
              console.log('setPropertiesType  array 空', { properties, item, key});
              errorMethod()
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
                console.log('setPropertiesType  default', { properties, item, key});
                errorMethod()
              }
              type = 'any'
              break
            }
        }
        return  {type: type, originalRef: originalRef}
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
        function ParametersCommonTypes(item: any) {
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
                  console.log('setPaths requestParameters  no type to array', item);
                  errorMethod()
                }
                type = item.items.type
              } else {
                if(item.items) {
                  console.log('setPaths requestParameters array', item);
                  errorMethod()
                }
              }
              return `Array<${type}>`
            default:
              console.log('setPaths requestParameters default', item);
              errorMethod()
              return  ''
          }
        }
        function setNamespace(item:any) {
          return item.operationId.replace(regExp.Using, '')
        }
        function setParametersType(item:any) {
          let parametersType = ''
          let originalRef = ''
          switch (item.in) {
            case 'query':
              parametersType = ParametersCommonTypes(item)
              break
            case 'body':
              if(item.schema.originalRef) {
                parametersType = item.schema.originalRef
                originalRef = item.schema.originalRef
              } else if(item.schema) {
                parametersType = ParametersCommonTypes(item.schema)
              } else {
                console.log('body parametersType', item);
                errorMethod()
              }
              break

          }
          return { type: parametersType, originalRef: originalRef }
        }
        function setParameters(item:any) {
          let list = ['debug', 'payload']
          let obj: any = {}
          let parametersType = {}
          let data
          item.forEach((res:any) => {
            if(list.includes(res.name)) return
            parametersType =  setParametersType(res)
            data = {
              parametersType:parametersType,
              required:res.required,
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



    function compileDefs(definitionsData: ObjectMap) {
      function setParameter(item: any) {
        let data = {description: item.description, type: item.setPropertiesTypeData.type}
        if(item.setPropertiesTypeData.originalRef) {
          if(definitionsData[item.setPropertiesTypeData.originalRef]) {
            data.type = data.type.replace(item.setPropertiesTypeData.originalRef, `defs.${ApiName}.${item.setPropertiesTypeData.originalRef}`)
          }else {
            errorMethod('setParameter item.setPropertiesTypeData 没有匹配')
          }
        }
        return data
      }

      console.log('definitionsData', definitionsData);
      let targetTypeData:ObjectMap = {}
      let targetTypeDescriptionData:ObjectMap = {}
      let nub = 0
      for(let i in definitionsData) {
        // if(nub > 0) break
        // nub++
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
      console.log('targetTypeData', targetTypeData);
      console.log('targetTypeDescriptionData', targetTypeDescriptionData);
    }







    return () => (
      <div>
        <a-button>123456</a-button>
      </div>
    )
  },
  created() {
    // console.log('this.$http', this.$http.get('http://192.168.120.178:28083/v2/api-docs'));
  }
})
