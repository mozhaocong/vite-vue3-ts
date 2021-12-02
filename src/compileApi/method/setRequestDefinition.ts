import { clone } from 'ramda'
import { replaceData as replaceDataUtil, responsesMapping } from '@/compileApi/util'
import { errorMethod, setErrData } from '@/compileApi/method/errorMethod'
import { analyticalData } from '@/compileApi/method/analyticalData'
export function setRequestDefinition(item: any) {
	const cloneData = clone(item)
	const defTOReg = /[<《«].*[>》»]/
	function getTOReg(value: string) {
		let nub = 0
		let isOk = false
		const mark = '#@E'
		const markRecovery = '»'
		const markReg = /[<《«].*(#@E)/g
		const getDataListReg = /[^<《>》«»]+/g
		// 可以直接过滤，也可以通过计算过滤
		let replaceData = value.replace(defTOReg, ($1) => {
			return $1.replace(/[<《>》«»]/g, ($2) => {
				if (isOk) return $2
				switch ($2) {
					case '<':
					case '《':
					case '«':
						nub++
						break
					case '>':
					case '》':
					case '»':
						nub--
				}
				if (!nub) {
					isOk = true
					return mark
				} else {
					return $2
				}
			})
		})
		let dataString: string | undefined
		replaceData = replaceData.replace(markReg, ($1) => {
			dataString = $1.replace(new RegExp(mark, 'g'), markRecovery)
			return ''
		})
		let dataList: string[] = []
		if (dataString) {
			dataList = dataString.match(getDataListReg) || []
		}

		return { dataList, replaceData }
	}

	function setData(data: any) {
		const returnData: ObjectMap = {}
		const checkData: ObjectMap = {}
		for (const dataKey in data) {
			if (dataKey.match(defTOReg)) {
				const TORegData = getTOReg(dataKey)
				const regData: string[] = TORegData.dataList
				const replaceData: string = TORegData.replaceData
				if (checkData[replaceData]) {
					continue
				} else {
					checkData[replaceData] = true
				}
				const properties = data[dataKey].properties
				const datatype = {
					type: '',
					originalRef: ''
				}
				setErrData({ data: data[dataKey], key: dataKey, type: 'setRequestDefinition' })
				if (regData.length > 2) {
					errorMethod('setRequestDefinition regData有两个值以上')
				}
				regData.forEach((res) => {
					if (responsesMapping[res]) {
						datatype.type = responsesMapping[res]
					} else {
						datatype.originalRef = res
					}
				})
				let isOriginalRefOk = false
				let isTypeOk = !datatype.type
				for (const key in properties) {
					const propertiesData = properties[key]
					if (datatype.originalRef) {
						let nub = 0
						if (propertiesData.originalRef && propertiesData.originalRef === datatype.originalRef) {
							propertiesData.originalRef = replaceDataUtil.TOString
							isOriginalRefOk = true
							nub++
						}
						if (propertiesData.items?.originalRef && propertiesData.items.originalRef === datatype.originalRef) {
							propertiesData.items.originalRef = replaceDataUtil.TOString
							isOriginalRefOk = true
							nub++
						}
						if (nub === 2) {
							errorMethod('setRequestDefinition datatype.originalRef匹配两次', datatype.type, propertiesData.type)
						}
					}
					if (datatype.type) {
						let nub = 0
						if (propertiesData.type.toUpperCase() === datatype.type.toUpperCase()) {
							isTypeOk = true
							delete propertiesData.type
							nub++
						}
						if (propertiesData?.items?.type.toUpperCase() === datatype.type.toUpperCase()) {
							isTypeOk = true
							delete propertiesData.type
							nub++
						}
						if (nub === 2) {
							errorMethod('setRequestDefinition datatype.type匹配两次', datatype.type, propertiesData.type)
						}
						if (!isTypeOk) {
							errorMethod('setRequestDefinition datatype.type有值但匹配不上', datatype.type, propertiesData.type)
						}
					}
				}
				if (!isOriginalRefOk) {
					errorMethod('setRequestDefinition isOriginalRefOk OriginalRef匹配不上')
					continue
				}
				let returnReplaceData = replaceData
				if (isTypeOk) {
					returnReplaceData = `${replaceData}${replaceDataUtil.TOAny}`
				} else {
					returnReplaceData = `${replaceData}<${datatype.type}${replaceDataUtil.TOAny}>`
				}
				returnData[returnReplaceData] = data[dataKey]
			} else {
				returnData[dataKey] = data[dataKey]
			}
		}
		return returnData
	}

	const returnSetData = setData(cloneData)
	analyticalData(clone(returnSetData))
}
