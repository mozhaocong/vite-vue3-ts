import { initApi } from '@/compileApi'

export async function apiInit(url: string): Promise<{ arrayData: any[]; res: ObjectMap }> {
	return new Promise((resolve) => {
		initApi({ url: '/JSON/test.json', apiName: 'oms' }).then((res: any) => {
			const arrayData: any[] = []
			for (const i in res.compileAPIData) {
				const dataA: any = { labelEn: res.setTagData[i], labelCn: i, children: [], value: res.setTagData[i] }
				for (const j in res.compileAPIData[i]) {
					const ijData = res.compileAPIData[i][j]
					const dataB = {
						labelEn: j,
						labelCn: ijData.summary || j,
						value: i + '-' + (ijData.summary || j),
						...ijData
					}
					dataA.children.push(dataB)
				}
				arrayData.push(dataA)
			}
			resolve({ arrayData, res })
		})
	})
}
