import { defineComponent, PropType, ref } from 'vue'
import { copyText } from '@/utils'

export default defineComponent({
	name: 'generateTemplate',
	setup() {
		const generateTemplate = ref('')
		const reg = ref<string>('')
		const localStorageKey = 'generateTemplate'
		const localStorageRegList = ref<any[]>([])
		const templateType = ref('table')
		function getLocalStorageDataList() {
			let data: any = window.localStorage.getItem(localStorageKey) || '{}'
			data = JSON.parse(data)
			const list = []
			if (data.regData) {
				for (const dataKey in data.regData) {
					list.push({ value: data.regData[dataKey], label: dataKey })
				}
			}
			localStorageRegList.value = list
			reg.value = list[0]?.value || ''
		}
		getLocalStorageDataList()

		function generateClick() {
			function addRegString(value: string) {
				return value.replace(/\\/g, '\\')
			}
			const regData = new RegExp(addRegString(reg.value), 'g')
			const returnData: string[] = generateTemplate.value.match(regData) || []

			setTemplate(returnData)
		}
		function setTemplate(value: string[]) {
			function templateTableString(val: string) {
				return `{ title: '${val}', key: 'null', dataIndex: 'null', align: 'center', width: 150 }`
			}
			function setTableReturnData(data: string[]): string {
				return 'export const columns: Rantion.TableColumns[] = [' + data.join(',') + ']'
			}
			function templateSearchString(val: string) {
				return `{title: '${val}',key: 'null',component: 'a-input',props: {allowClear: true}}`
			}
			function setSearchReturnData(data: string[]): string {
				return 'export const row:rowArray[] = [' + data.join(',') + ']'
			}
			function templateFromString(val: string) {
				return `{title: '${val}',key: 'null',props: {allowClear: true}}`
			}
			function setFromReturnData(data: string[]): string {
				return 'export const rowFrom:FromRow[] = [' + data.join(',') + ']'
			}
			function setTemplateType({ item, data }: { item?: string; data?: string[] }) {
				switch (templateType.value) {
					case 'table':
						return { template: templateTableString(item || ''), returnData: setTableReturnData(data || []) }
					case 'search':
						return { template: templateSearchString(item || ''), returnData: setSearchReturnData(data || []) }
					case 'from':
						return { template: templateFromString(item || ''), returnData: setFromReturnData(data || []) }
				}
			}

			const data = value.map((item) => {
				return setTemplateType({ item })?.template || ''
			})

			copyText(setTemplateType({ data: data || [] })?.returnData || '')
		}

		function saveReg() {
			let data: any = window.localStorage.getItem(localStorageKey) || '{}'
			data = JSON.parse(data)
			if (!data.regData) {
				data.regData = {}
			}
			data.regData[reg.value] = reg.value
			window.localStorage.setItem(localStorageKey, JSON.stringify(data))
			getLocalStorageDataList()
		}

		return () => (
			<div style={{ width: '80%', margin: 'auto' }}>
				{localStorageRegList.value.map((item) => {
					return (
						<a-button
							onClick={() => {
								reg.value = item.value
							}}
						>
							{item.label}
						</a-button>
					)
				})}
				<div>
					正则:
					<a-input v-model={[reg.value, 'value']} />
					<a-button onClick={saveReg}>保存</a-button>
					<a-radio-group v-model={[templateType.value, 'value']}>
						<a-radio value="table">r-table</a-radio>
						<a-radio value="search">r-search</a-radio>
						<a-radio value="from">r-from</a-radio>
					</a-radio-group>
				</div>
				<a-textarea v-model={[generateTemplate.value, 'value']} autosize={true} />
				<a-button onClick={generateClick}>确定</a-button>
			</div>
		)
	}
})
