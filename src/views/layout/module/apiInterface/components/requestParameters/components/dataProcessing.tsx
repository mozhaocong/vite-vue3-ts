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
		const dataProcessing = ref()
		const list = /(const | let).*=/
		const testns = /[\n\s]/g
		const dat = /(\w+:'\S*?',{0,1})|(\w+:\d+,{0,1})/g

		const daga = [
			"{title:'操作',key:'operate',dataIndex:'operate',align:'center',width:200,slots:{customRender:'operateSlot',text:12345678,tsaga:{aaga:1},sdhsh:7},slotsh:{dhdjd:1},fixed:'left'}",
			"{title:'客户ID',key:'customerId',fixed:'left',dataIndex:'customerId',align:'center',width:200}",
			"{title:'客户编号',key:'customerCode',dataIndex:'customerCode',align:'center',width:200}",
			"{title:'客户名称',key:'customerName',dataIndex:'customerName',align:'center',width:200}",
			"{title:'交易主体',key:'transactionMainName',dataIndex:'transactionMainName',align:'center',width:200}",
			"{title:()=><a-tooltiptitle=\"数据需同步NS，若未同步需点击修改保存，系统自动同步\">同步信息</a-tooltip>,key:'syncNsStatus',dataIndex:'syncNsStatus',label:'同步信息',customRender:configCurryFilter('syncNsStatus'),align:'center',width:200}",
			"{title:'状态',key:'customerStatus',dataIndex:'customerStatus',align:'center',width:100,customRender:configCurryFilter('baseStatus')}",
			"{title:'结算方式',key:'settlement',dataIndex:'settlement',align:'center',width:100,customRender:configCurryFilter('settlement')}",
			"{title:'税率',key:'taxRate',dataIndex:'taxRate',width:100,align:'center'}",
			"{title:'币种',key:'currency',dataIndex:'currency',width:100,align:'center'}",
			"{title:'客户联系人',key:'contact',dataIndex:'contact',width:150,align:'center'}",
			"{title:'客户联系方式',key:'contactDetails',dataIndex:'contactDetails',width:200,align:'center'}",
			"{title:'销售负责人',key:'salesperson',dataIndex:'salesperson',align:'center',width:150,slots:{customRender:'userFilter'}}",
			"{title:'创建人',key:'createBy',dataIndex:'createBy',align:'center',width:100,slots:{customRender:'userFilter'}}",
			"{title:'创建时间',key:'createTime',dataIndex:'createTime',width:200,align:'center'}",
			"{title:'更新时间',key:'updateTime',dataIndex:'updateTime',width:200,align:'center'}"
		]

		function textClick() {
			// const datadas =
			// "{'title':()=><a-tooltiptitle=\"数据需同步NS，若未同步需点击修改保存，系统自动同步\">同步信息</a-tooltip>,'key':'syncNsStatus','dataIndex':'syncNsStatus','label':'同步信息','customRender':configCurryFilter('syncNsStatus'),'align':'center','width':200}"
			// const databsbs = "{'title':'更新时间','key':'updateTime','dataIndex':'updateTime','width':200,'align':'center'}"
			const agasga = "{title:'更新时间',key:'updateTime',dataIndex:'updateTime',width:200,align:'center'}"

			console.log('dataddmd', eval('(' + agasga + ')'))
			return
			const data = dataProcessing.value.split(list)
			let testData = last(data)
			testData = testData.replace(testns, '')
			testData = testData.slice(1, testData.length - 1)
			const listData = testData.split(/},{/g)
			const mapList = listData.map((item, index) => {
				if (index === 0) {
					item += '}'
				} else if (index === listData.length - 1) {
					item = '{' + item
				} else {
					item = '{' + item + '}'
				}
				return item
			})
			console.log(mapList)
		}
		return () => (
			<>
				<a-textarea v-model={[dataProcessing.value, 'value']} />
				<a-button
					onClick={() => {
						textClick()
					}}
				>
					确定
				</a-button>
			</>
		)
	}
})
