export type sourceData = ObjectMap
export type apiData = ObjectMap

export type apiInterfacePropsData = {
	sourceData: sourceData
	apiData: apiData
	apiName: string
}

export type reqDataType = {
	key: string
	description?: string
	type?: string
	required?: string
	inputKey?: string
}
