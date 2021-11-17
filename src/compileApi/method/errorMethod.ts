export let errData = {}
export function errorMethod(item?: any, ...arg: any[]) {
	console.error('errData', errData, item, ...arg)
}

export function setErrData(item: any) {
	errData = item
}
