import { defineComponent, ref } from 'vue'
import Axios from '../../api/index'

import Interface from './component/interface'
import Content from './component/content'
import { initApi } from './compileApi/index'
import './index.scss'
export default defineComponent({
  name: 'TestMZC',
  setup() {
    const sourceData = ref<any[]>([])
    const labelName = ref<string>('labelCn')
    const expand = ref<ObjectMap>([])
    const InterfaceValue = ref<string>('')
    const interfaceData = ref<ObjectMap>({})

    initApi({url: 'http://192.168.120.180:28090/serverApi/rantion-oms/v2/api-docs', apiName: 'oms'}).then((res: any) => {
      // initApi({ url: 'http://192.168.120.177:18088/v2/api-docs' }).then((res: any) => {
      // initApi({url: 'http://192.168.120.178:8068/v2/api-docs'}).then((res: any) => {
      // initApi({url: 'http://192.168.120.177:9007/v2/api-docs'}).then((res: any) => {
      console.log('res', res);
      let arrayData: any[] = []
      for (let i in res.compileAPIData) {
        const dataA: any = { labelEn: res.setTagData[i], labelCn: i, children: [], value: res.setTagData[i] }
        for (let j in res.compileAPIData[i]) {
          const ijData = res.compileAPIData[i][j]
          const dataB = { labelEn: j, labelCn: ijData.summary || j, value: i + '-' + (ijData.summary || j), ...ijData }
          dataA.children.push(dataB)
        }
        arrayData.push(dataA)
      }
      sourceData.value = arrayData
    })

    return () => (
      <a-layout class="a-layout">
        <a-layout-sider width="340" class="layout-sider" style={{ background: '#fff' }}>
          <div class="language-button">
            <a-button
              onClick={() => {
                labelName.value = 'labelCn'
              }}
            >
              中文
            </a-button>
            <a-button
              onClick={() => {
                labelName.value = 'labelEn'
              }}
            >
              英文
            </a-button>
          </div>

          <a-input class="search-box" />
          <Interface
            sourceData={sourceData.value}
            labelName={labelName.value}
            v-models={[[expand.value, 'expand'],[InterfaceValue.value, 'value']]}
            {...{
              onResCLick: (res: ObjectMap) => {
                console.log('res',res)
                interfaceData.value = res
              },
            }}
          />
        </a-layout-sider>
        <a-layout>
          <a-layout-header style={{ background: '#fff' }}>
            <a-row>
              <a-col span={6}>
                {interfaceData.value.value || ''}
              </a-col>
              <a-col span={6}>
                <a-button>保存</a-button>
              </a-col>
            </a-row>
          </a-layout-header>
          <a-layout-content>
            <Content sourceData={interfaceData.value}/>
          </a-layout-content>
          <a-layout-footer>Footer</a-layout-footer>
        </a-layout>
      </a-layout>
    )
  },
})
