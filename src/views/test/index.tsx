import { defineComponent } from 'vue'
import Axios from '../../api/index'

import Interface from './component/interface'
import { initApi } from './compileApi/index'
export default defineComponent({
  name: 'TestMZC',
  setup() {


    // initApi({url: 'http://192.168.120.180:28090/serverApi/rantion-oms/v2/api-docs'}).then((res: any) => {
    initApi({url: 'http://192.168.120.177:9007/v2/api-docs'}).then((res: any) => {
      console.log('res res', res);
    })


    return () => (
      <div>
        <Interface />
      </div>
    )
  },
  created() {
    // console.log('this.$http', this.$http.get('http://192.168.120.178:28083/v2/api-docs'));
  }
})
