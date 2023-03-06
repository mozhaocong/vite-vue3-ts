import { defineComponent } from 'vue'
import Axios from '@/api'
import { getTargetApiData, setKnife4jApiData } from '@/views/knife4j/_module'

export default defineComponent({
	name: 'knife4j',
	setup() {
		Axios.get('https://supply-gateway-test.htwig.com/scm/v3/api-docs').then((res: any) => {
			const { data } = res
			const pathList = setKnife4jApiData({ data })
			const testData = { tag: '扣款单', path: '/scm/scm/deductOrder/addDeductOrder', methods: 'post' }
			getTargetApiData({ pathList: pathList, targetItem: testData, apiData: data })
		})
		return () => <div>1</div>
	}
})
