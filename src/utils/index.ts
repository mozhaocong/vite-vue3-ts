import { message, notification } from 'ant-design-vue'

// 复制文字
export function copyText(text: string) {
	const textareaEl = document.createElement('textarea')
	textareaEl.setAttribute('readonly', 'readonly') // 防止手机上弹出软键盘
	textareaEl.value = text
	document.body.appendChild(textareaEl)
	textareaEl.select()
	const res = document.execCommand('copy')
	document.body.removeChild(textareaEl)
	message.success('复制成功')
	return res
}

export function isString(item: any): item is string {
	return Object.prototype.toString.call(item) == '[object String]'
}
