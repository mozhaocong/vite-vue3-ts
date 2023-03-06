// 处理knife4j文档返回的数据

function setDataObject(item: { list: string[]; setData: any; data: any }): void {
	const { list, setData, data } = item
	let psuData = setData
	list.forEach((forItem, index) => {
		if (!psuData[forItem]) {
			psuData[forItem] = {}
		}
		if (index === list.length - 1) {
			psuData[forItem] = data
		} else {
			psuData = psuData[forItem]
		}
	})
}

// api 数据初步处理成 list
export function setKnife4jApiData(item: { data: any }) {
	const { data } = item
	const { paths } = data
	const listData = []
	const pathData = {}
	for (const path in paths) {
		const data = paths[path]
		const keys = Object.keys(data)
		keys.forEach((keyItem) => {
			const { tags } = data[keyItem]
			tags.forEach((forItem) => {
				setDataObject({
					list: [forItem, path, keyItem],
					data: { path: path, data: data[keyItem], methods: keyItem },
					setData: pathData
				})
			})
		})
	}

	for (const pathDataKey in pathData) {
		const data = pathData[pathDataKey]
		const itemList = []
		for (const dataKey in data) {
			const childrenData = data[dataKey]
			for (const childrenDataKey in childrenData) {
				itemList.push({ ...(childrenData[childrenDataKey] || {}), path: dataKey })
			}
		}
		listData.push({ tag: pathDataKey, children: itemList })
	}
	return listData
}
