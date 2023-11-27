import { defineComponent } from 'vue'
import Axios from '@/api'
import { getTargetApiData, setKnife4jApiData } from '@/views/knife4j/_module'

export default defineComponent({
	name: 'knife4j',
	setup() {
		Axios.get('https://supply-gateway-test.htwig.com/scm/v3/api-docs').then((res: any) => {
			const { data } = res
			console.log('data', data)
			const pathList = setKnife4jApiData({ data })
			const testData = { tag: '采购需求', children: [{ path: '/scm/scm/purchase/editPurchase' }] }
			const result = getTargetApiData({ pathList: pathList, targetItem: testData, apiData: data })
			console.log('Axios', result, pathList)
		})
		return () => <div>1</div>
	}
})
