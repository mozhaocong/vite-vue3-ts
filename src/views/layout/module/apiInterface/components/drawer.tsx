import { defineComponent, PropType } from 'vue'
type propsDataType<T> = {
	value: T
}
const propsData = {
	checkboxList: {
		required: true,
		type: Object as PropType<propsDataType<ObjectMap>>,
		default() {
			return {}
		}
	},
	drawerVisible: {
		required: true,
		type: Object as PropType<propsDataType<boolean>>,
		default() {
			return { value: false }
		}
	},
	onClose: Function as PropType<() => void>,
	determine: Function as PropType<() => void>,
	resetClick: Function as PropType<() => void>
}
export default defineComponent({
	name: 'apiInterfaceDrawer',
	props: propsData,
	setup(props) {
		function determine() {
			if (props.determine) {
				props.determine()
			}
			close()
		}
		function resetClick() {
			if (props.resetClick) {
				props.resetClick()
			}
			close()
		}
		function close() {
			props.drawerVisible.value = false
		}
		return () => (
			<a-drawer
				title="Basic Drawer"
				placement="right"
				v-model={[props.drawerVisible.value, 'visible']}
				body-style={{ paddingBottom: '80px' }}
				onClose={() => {
					if (props.onClose) props.onClose()
				}}
			>
				<a-form>
					<a-form-item>
						<a-checkbox v-model={[props.checkboxList.value.namespace, 'checked']}>接口类名(namespace)</a-checkbox>
					</a-form-item>
					<a-form-item>
						<a-checkbox v-model={[props.checkboxList.value.requestParameters, 'checked']}>
							接口请求参数(requestParameters)
						</a-checkbox>
					</a-form-item>
					<a-form-item>
						<a-checkbox v-model={[props.checkboxList.value.responsesData, 'checked']}>
							接口返回参数(responsesData)
						</a-checkbox>
					</a-form-item>
				</a-form>
				<div
					style={{
						position: 'absolute',
						bottom: 0,
						width: '100%',
						borderTop: '1px solid #e8e8e8',
						padding: '10px 16px',
						display: 'flex',
						left: 0,
						background: '#fff',
						alignItems: 'center',
						justifyContent: 'space-around',
						borderRadius: '0 0 4px 4px'
					}}
				>
					<a-button type="primary" onClick={resetClick}>
						重置
					</a-button>
					<a-button type="primary" onClick={close}>
						取消
					</a-button>
					<a-button type="primary" onClick={determine}>
						确定
					</a-button>
				</div>
			</a-drawer>
		)
	}
})
