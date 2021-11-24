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
		const dfhd = /(.*)=>\{{0,1}(\n|.*)+?\}/g
		const brackets = /{[^{]*?}/g // 判断括号
		const funCall = /\w+\((\n|.)*?\)/g // 函数调用 cinoFilter('text')
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
			const data = dataProcessing.value
			// 去 ‘ | “ 号
			let replaceData = setReplaceData(data, semicolon)

			// 去htmlDom
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

						console.log(data$3, re)
					})
				}
			}
			delHtmlDom()

			console.log('replace', replaceData, replaceObject)
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
