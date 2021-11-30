export function setRequestDefinition(data: any) {
	console.log(data)
	const defTOReg = /[<《«].*[>》»]/
	function getTOReg(value: string) {
		let nub = 0
		let isOk = false
		const mark = '#@E'
		const markRecovery = '»'
		const markReg = /[<《«].*(#@E)/g
		const getDataListReg = /[^<《>》«»]+/g
		const replaceData = value.replace(defTOReg, ($1) => {
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
		replaceData.replace(markReg, ($1) => {
			dataString = $1.replace(new RegExp(mark, 'g'), markRecovery)
			return $1
		})
		let dataList: string[] = []
		if (dataString) {
			dataList = dataString.match(getDataListReg) || []
		}
		return dataList
	}

	for (const dataKey in data) {
		if (dataKey.match(defTOReg)) {
			console.log('getTOReg', getTOReg(dataKey))
		}
	}
}
