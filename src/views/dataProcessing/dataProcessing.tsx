import { defineComponent, PropType, ref } from 'vue'
import { last } from 'ramda'
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
		const dataProcessing = ref<string>('')
		const testData = localStorage.getItem('testData')
		if (testData) {
			dataProcessing.value = testData
		}
		const list = /(const | let).*=/
		const testns = /[\n\s]/g
		const dat = /(\w+:'\S*?',{0,1})|(\w+:\d+,{0,1})/g
		const semicolon = /('.*?')|(".*?")/g
		const htmlDom = /<[^/](\w|-|_)+\s{0,1}\S+?>/g
		const htmlDomHead = /<[^/](\w|-|_)+\s{0,1}/g
		const brackets = /{[^{]*?}/g // 判断括号
		const funCall = /\w+\((\n|.)*?\)/g // 函数调用 cinoFilter('text')
		const returnSpace = /return /g
		const funBrackets = /\([^(]*\)=>{[^{]+?}/g // 括号函数

		//处理特殊符号例如 （转\(
		function setSpecialSymbolReg(value: string) {
			return value.replace(/\(|\)/g, ($1) => {
				return `\\${$1}`
			})
		}

		// 过滤 xxx:semicolonMark标签的 和 数字 和 { 和 ture 和 false
		// \w+:(?!((('.*?')|(".*?"))|\d|{)).+
		function setKeyReplaceMark() {
			const semicolonMarkRe = getMark(semicolonMark)
			const replaceMarkRe = getMark(replaceMark)
			const data = `\\w+:(?!(${semicolonMarkRe}|${replaceMarkRe}|\\d|{|true|false)).+`
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
		function setReplaceData(data: string, re: any) {
			return data.replace(re, function ($1) {
				const data$1 = setReplaceMark()
				replaceObject[data$1] = $1
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

		// function sliceData() {
		// 	const data = dataProcessing.value.split(list)
		// 	let testData = last(data)
		// 	testData = testData.replace(testns, '')
		// 	testData = testData.slice(1, testData.length - 1)
		// 	const listData = testData.split(/},{/g)
		// 	const mapList = listData.map((item, index) => {
		// 		if (index === 0) {
		// 			item += '}'
		// 		} else if (index === listData.length - 1) {
		// 			item = '{' + item
		// 		} else {
		// 			item = '{' + item + '}'
		// 		}
		// 		return item
		// 	})
		// 	console.log(mapList)
		// }

		//转成JSON对象
		// console.log('dataddmd', eval('(' + agasga + ')'))

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

			// 去空格 replaceObject
			replaceData = replaceData.replace(/ /g, '')

			// 去() => replaceObject
			function delFunBrackets() {
				if (replaceData.match(funBrackets)) {
					replaceData = setReplaceData(replaceData, funBrackets)
					delFunBrackets()
				}
			}
			delFunBrackets()

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

			// console.log('replace', replaceData)
			// console.log(errorObject)
			// console.log(replaceObject)
			// console.log(semicolonObject)

			// replaceData处理完后，开始解析replaceData转成JSON对象
			function setParsingReplaceData() {
				return replaceData.replace(new RegExp(getAllMarkReg(), 'g'), ($1) => {
					const data$1 = $1.match(new RegExp(getMark(semicolonMark), 'g'))
					if (data$1) {
						return semicolonObject[data$1[0]]
					}
					return `'${$1}'`
				})
			}
			const returnData = setParsingReplaceData()
			console.log('returnData', returnData)
			const evalData = eval('(' + returnData + ')')
			console.log('evalData', evalData)

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
			console.log(testData)
			return
		}
		return () => (
			<div style={{ width: '80%', margin: 'auto' }}>
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
