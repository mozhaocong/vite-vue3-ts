import { defineComponent } from 'vue'
import Axios from '@/api'
import { setKnife4jApiData } from '@/views/knife4j/_module'

export default defineComponent({
	name: 'knife4j',
	setup() {
		Axios.get('https://supply-gateway-test.htwig.com/scm/v3/api-docs').then((res: any) => {
			const { data } = res
			const pathList = setKnife4jApiData({ data })
			console.log(pathList)
		})
		return () => <div>1</div>
	}
})
