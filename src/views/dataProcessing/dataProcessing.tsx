import { defineComponent, onMounted, PropType, ref, watch } from 'vue'
import { copyText } from '@/utils'

const propsData = {
	sourceData: {
		required: true,
		type: Object as PropType<ObjectMap>,
		default() {
			return {}
		}
	}
}
export default defineComponent({
	name: 'dataProcessing',
	props: propsData,
	setup(props) {
		const headConst = /^.*(const|let)(.|[^\n])*?=/
		const semicolon = /('.*?')|(".*?")/g
		const htmlDom = /<[^/](\w|-|_)+\s{0,1}\S+?>/g
		const htmlDomHead = /<[^/](\w|-|_)+\s{0,1}/g
		const funCall = /\w+ *\((\n|.)*?\)/g // 函数调用 cinoFilter('text')
		const returnSpace = /return /g
		const buildFunction = /(\.\.\.)(.|\s)*?(,|]|})/g // 构建函数  ...xxx
		const funBrackets = /\([^(]*\) *=> *{[^{]+?}/g // 括号函数
		const brackets = /{[^{]*?}/g // 判断括号
		const constantString = /true|false|null|undefined/g
		const constantParam = /({|\[|,|:)\s*(true|false|null|undefined)\s*(]|}|,)/g
		//处理特殊符号例如 （转\(
		function setSpecialSymbolReg(value: string) {
			return value.replace(/\(|\)/g, ($1) => {
				return `\\${$1}`
			})
		}

		const dataProcessing = ref<string>('')
		const dataHead = ref('')
		const autoHeadCheck = ref(true)
		const autoHeadData = ref('')
		watch(
			() => dataProcessing.value,
			() => {
				autoHeadChange()
			}
		)
		function autoHeadChange() {
			if (autoHeadCheck.value) {
				dataProcessing.value = dataProcessing.value.replace(headConst, ($1) => {
					autoHeadData.value = $1
					return ''
				})
			} else {
				dataProcessing.value = autoHeadData.value + dataProcessing.value
				autoHeadData.value = ''
			}
		}
		onMounted(() => {
			autoHeadChange()
		})

		const testData = localStorage.getItem('testData')
		if (testData) {
			dataProcessing.value = testData
		}

		// 过滤 xxx:semicolonMark标签的 和 数字 和 { 和 [ 和 ture 和 false
		// \w+:(?!((('.*?')|(".*?"))|\d|{|\[|ture|false)).+
		function setKeyReplaceMark() {
			const semicolonMarkRe = getMark(semicolonMark)
			const replaceMarkRe = getMark(replaceMark)
			const data = `\\w+:(?!(${semicolonMarkRe}|${replaceMarkRe}|\\d|{|\\[|true|false)).+`
			return new RegExp(data, 'g')
		}

		// 获取标记正则
		function getMark(value: string) {
			return `(${value}\\d+${value})`
		}

		function getAllMarkReg() {
			return `${getMark(semicolonMark)}|${getMark(replaceMark)}|${getMark(errorMark)}`
		}

		// semicolon标记 '' |""
		const semicolonMark = 'E￥@'
		let semicolonNumber = 0
		function setSemicolonMark() {
			semicolonNumber++
			return semicolonMark + semicolonNumber + semicolonMark
		}
		function setSemicolonData(data: string, re: any) {
			return data.replace(re, function ($1) {
				const data$1 = setSemicolonMark()
				semicolonObject[data$1] = $1
				return data$1
			})
		}
		const semicolonObject: ObjectMap = {}

		// 除semicolon的已知类型标记 例如()=> | <div></div>
		const replaceMark = '~#@'
		let replaceNumber = 0
		function setReplaceMark() {
			replaceNumber++
			return replaceMark + replaceNumber + replaceMark
		}
		function setReplaceData(data: string, re: any, setData?: (item: string) => string) {
			return data.replace(re, function ($1) {
				const data$1 = setReplaceMark()
				if (setData) {
					replaceObject[data$1] = setData($1)
				} else {
					replaceObject[data$1] = $1
				}
				return data$1
			})
		}
		const replaceObject: ObjectMap = {}

		// 已知类型标记后, 转JSON对象错误标记 例如  xxx:xxx | xxx:()=>
		const errorMark = '#9E'
		let errorNumber = 0
		const errorObject: ObjectMap = {}
		function setErrorMark() {
			errorNumber++
			return errorMark + errorNumber + errorMark
		}

		// buildFunction标记 构建参数 ...xxx
		const buildFunctionMark = 'buildFunction'
		let buildFunctionNumber = 0
		function setBuildFunctionNumberMark() {
			buildFunctionNumber++
			return buildFunctionMark + buildFunctionNumber + buildFunctionMark
		}
		function setBuildFunctionData(
			data: string,
			re: any,
			setData: ($1: string, data$1: string) => { data: string; value: string }
		) {
			return data.replace(re, function ($1) {
				const data$1 = setBuildFunctionNumberMark()
				const item = setData($1, data$1)
				buildFunctionObject[data$1] = item.data
				return item.value
			})
		}
		const buildFunctionObject: ObjectMap = {}

		// buildFunction标记 构建参数 xxx
		const fillingObjectMark = 'fillingObject'
		const fillingArrayMark = 'fillingArray'
		let fillingArrayNumber = 0
		let fillingObjectNumber = 0
		function setFillingArrayMarkNumberMark() {
			fillingArrayNumber++
			return fillingArrayMark + fillingArrayNumber + fillingArrayMark
		}
		function setFillingObjectMarkMark() {
			fillingObjectNumber++
			return `${fillingObjectMark}${fillingObjectNumber}:'${fillingObjectMark}${fillingObjectNumber}${fillingObjectMark}'`
		}
		function setFillingTypeData(
			data: string,
			re: any,
			setType: ($1: string) => 'Array' | 'Object',
			setData: ($1: string, data$1: string, type: 'Array' | 'Object') => { data: string; value: string }
		) {
			return data.replace(re, function ($1) {
				const type = setType($1)
				const data$1 = type === 'Array' ? setFillingArrayMarkNumberMark() : setFillingObjectMarkMark()
				const item = setData($1, data$1, type)
				fillingTypeData[data$1] = item.data
				return item.value
			})
		}
		const fillingTypeData: ObjectMap = {}

		const constantMark = 'Q#W'
		let constantNumber = 0
		function setConstantMark() {
			constantNumber++
			return constantMark + constantNumber + constantMark
		}
		function setConstantData(
			data: string,
			re: any,
			setData: ($1: string, data$1: string) => { data: string; value: string }
		) {
			return data.replace(re, function ($1) {
				const data$1 = setConstantMark()
				const item = setData($1, data$1)
				constantObject[data$1] = item.data
				return item.value
			})
		}
		const constantObject: ObjectMap = {}

		function textClick() {
			const data = dataProcessing.value

			// const

			// 去 ‘ | “ 号 semicolonObject
			let replaceData = setSemicolonData(data, semicolon)

			// 去htmlDom replaceObject
			function delHtmlDom() {
				function getHtmlDom(value: string, type = 0) {
					if (type === 0) {
						// <div(.|\n)*</div>)
						return `${value}(.|\\n)*</${value.substr(1, value.length)}>`
					} else {
						// (<div(.|\n)*/>
						return `${value}(.|\\n)*/>`
					}
				}
				const matchData = replaceData.match(htmlDom)
				if (matchData) {
					matchData.forEach((item) => {
						const data$1 = item.match(htmlDomHead)
						if (!data$1 || data$1.length > 1) {
							throw '去htmlDom 报错'
						}
						const data$2 = data$1[0].replace(' ', '')
						const list = [0, 1]
						let data$3, re
						list.forEach((l) => {
							re = new RegExp(getHtmlDom(data$2, l), 'g')
							data$3 = replaceData.match(re)
							if (data$3) {
								data$3.forEach((res) => {
									replaceData = setReplaceData(replaceData, res)
								})
							}
						})
					})
				}
			}
			delHtmlDom()

			// 去函数调用 replaceObject
			replaceData = setReplaceData(replaceData, funCall)

			// 去reture replaceObject
			replaceData = setReplaceData(replaceData, returnSpace)

			// 去()=>{} 去括号函数  replaceObject
			function delFunBrackets() {
				const mark = '#Y4%'
				const funBrackets1 = /\([^(]*\) *=> *{(.|\n)+/g // 括号函数
				const funBrackets2 = /\([^(]*\) *=> *{(.|\n)+?(#Y4%)/g // 括号函数
				const matchData = replaceData.match(funBrackets1)
				if (matchData) {
					let nub = 0
					let isOk = false
					replaceData = replaceData.replace(funBrackets1, ($1) => {
						return $1.replace(/{|}/g, ($2) => {
							if (isOk) {
								return $2
							}
							if ($2 === '}') {
								nub--
							} else if ($2 === '{') {
								nub++
							}
							if (!nub) {
								isOk = true
								return mark
							}
							return $2
						})
					})
					replaceData = setReplaceData(replaceData, funBrackets2, (item) => {
						item = item.replace(new RegExp(mark, 'g'), '}')
						return item
					})
					delFunBrackets()
				}
			}
			delFunBrackets()

			// 去空格 replaceObject
			replaceData = replaceData.replace(/ /g, '')

			//去 xxx:xxx | xxx:()=>xxx errorObject
			function decError() {
				const data = replaceData.match(setKeyReplaceMark())
				if (data) {
					const dataObject: ObjectMap = {}
					data.forEach((item) => {
						const data$1 = item.replace(/(\w+:)|,|}/g, '')
						const data$2 = setErrorMark()
						errorObject[data$2] = data$1
						dataObject[item] = item.replace(new RegExp(`:${setSpecialSymbolReg(data$1)}`, 'g'), () => {
							return `:${data$2}`
						})
					})
					for (const dataObjectKey in dataObject) {
						replaceData = replaceData.replace(new RegExp(`${setSpecialSymbolReg(dataObjectKey)}`, 'g'), () => {
							return dataObject[dataObjectKey]
						})
					}
				}
			}

			decError()

			// replaceData处理完后，开始解析replaceData初步转成JSON对象 xxx：‘xxxx’， 不过还有一些是 ,...xxx 和 ,xxx, 还有继续过滤
			function setParsingReplaceData() {
				return replaceData.replace(new RegExp(getAllMarkReg(), 'g'), ($1) => {
					const data$1 = $1.match(new RegExp(getMark(semicolonMark), 'g'))
					if (data$1) {
						return semicolonObject[data$1[0]]
					}
					return `'${$1}'`
				})
			}

			let returnData = setParsingReplaceData()

			// 去常量 true|false,xxx
			returnData = setConstantData(returnData, constantParam, ($1, data$1) => {
				let data = '',
					value = $1
				const matchData = $1.match(constantString)
				if (matchData) {
					data = matchData[0]
					value = $1.replace(matchData[0], () => {
						return `'${data$1}'`
					})
				}
				return { data, value }
			})

			// 去构建参数 ...xxx | ...[xxx] | ...{xxxx}
			function decBuildFunction() {
				returnData = setBuildFunctionData(returnData, buildFunction, ($1, data$1) => {
					const matchData = $1.match(',')
					const data = $1.replace(/,/g, '')
					return { data: data, value: `${data$1}${matchData ? ',' : ''}` }
				})
			}

			decBuildFunction()

			// 填充错误信息 ,xxx, | ,xxx} | ,xxxx] 区分Object还是Array
			function fillingErrorData() {
				// {title:'操作',agag,shsdhs,shsh,dfjdjfd},'dataIndex':'operate',align:'center',}
				// xxx, xxx,|}|]|
				// const reg1 = /[a-zA-Z]\w+(?!(:))(,|}|\])(?!((\w+(,|}|\]))))(.*?(,|}|\]))?/g
				// const reg2 = /[a-zA-Z]\w+(?!(:))/g //只能在reg1里面使用 检验 xxxxx
				// 和reg1一样， 添加了\s空白符号判断
				const pattern = /[a-zA-Z]\w+(?!(:))((,|}|\]))\s*(?!((\w+(,|}|\]))))((.|\s)*?({|}|\[|\]))?/g
				if (returnData.match(pattern)) {
					returnData = setFillingTypeData(
						returnData,
						pattern,
						($1) => {
							const $2 = $1.replace(/\s/g, '')
							const matchData = $2.match(/{|}|\[|\]/)
							if (!matchData) {
								throw '构建函数错误1'
							}
							let type: 'Object' | 'Array' = 'Object'
							switch (matchData[0]) {
								case '}':
									break
								case ']':
									type = 'Array'
									break
								default:
									{
										switch ($2.slice((matchData.index || 1) - 1, matchData.index)) {
											case ':':
												break
											case ',':
												type = 'Array'
												break
											default:
												throw '构建函数错误2'
										}
									}
									break
							}
							return type
						},
						($1, data$1, type) => {
							let data = ''
							let value = ''
							value = $1.replace(/^\w+/, ($2) => {
								data = $2
								return type === 'Array' ? `'${data$1}'` : data$1
							})
							return { data: data, value: value }
						}
					)
					fillingErrorData()
				}
			}
			fillingErrorData()

			// 解析常量 true被转换后解析回来
			returnData = returnData.replace(new RegExp(`'${constantMark}\\d${constantMark}'`, 'g'), ($1) => {
				return constantObject[$1.replace(/'/g, '')]
			})

			const evalData = eval('(' + returnData + ')')
			console.log(evalData)

			let testData = JSON.stringify(evalData)
			testData = testData.replace(new RegExp(`"(${getAllMarkReg()})"`, 'g'), ($1) => {
				function parseVariable(value: string): any {
					const reg = new RegExp(getAllMarkReg(), 'g')
					const matchData = value.match(reg)
					if (matchData) {
						return parseVariable(
							value.replace(reg, ($1) => {
								return semicolonObject[$1] || replaceObject[$1] || errorObject[$1]
							})
						)
					} else {
						return value
					}
				}
				return parseVariable($1.replace(/"/g, ''))
			})
			console.log('testData', testData)

			const testDataData = dataHead.value + autoHeadData.value + testData
			copyText(testDataData)
			return
		}

		return () => (
			<div style={{ width: '80%', margin: 'auto' }}>
				<a-input v-model={[dataHead.value, 'value']} />
				<a-checkbox v-model={[autoHeadCheck.value, 'checked']} onChange={autoHeadChange}>
					头部匹配const | let
				</a-checkbox>
				<div>{autoHeadData.value}</div>
				<a-textarea v-model={[dataProcessing.value, 'value']} autosize={true} />
				<a-button
					onClick={() => {
						textClick()
					}}
				>
					确定
				</a-button>
				<a-button
					onClick={() => {
						localStorage.setItem('testData', dataProcessing.value)
					}}
				>
					保存
				</a-button>
			</div>
		)
	}
})
