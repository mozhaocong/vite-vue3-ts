import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'

export type compileApiObjectCheckboxList = {
	namespace: boolean
	requestParameters: boolean
	responsesData: boolean
}
export interface compileApiObjectType {
	value: string
	quickBuild?: boolean
	checkboxList?: compileApiObjectCheckboxList
}

export interface compileApiState {
	compileApiObject: ObjectMap<string, compileApiObjectType>
}
function getLocalStorageCompileApiObject(apiName: string) {
	const data = window.localStorage.getItem(`${apiName}_compileApiObject`)
	return data ? JSON.parse(data) : {}
}

@Module({ namespaced: true, store, name: 'compileApi', dynamic: true })
export class compileApi extends VuexModule implements compileApiState {
	public compileApiObject: ObjectMap<string, compileApiObjectType> = {}

	@Mutation
	public set_compileApiObject({ apiName, item }: { item: compileApiObjectType; apiName: string }) {
		if (!item || !item.value || !apiName) return
		this.compileApiObject = getLocalStorageCompileApiObject(apiName)
		if (this.compileApiObject[item.value]) {
			this.compileApiObject[item.value] = Object.assign(this.compileApiObject[item.value], item)
		} else {
			this.compileApiObject[item.value] = { value: item.value }
			this.compileApiObject[item.value] = item
		}
		window.localStorage.setItem(`${apiName}_compileApiObject`, JSON.stringify(this.compileApiObject))
	}

	@Mutation
	public get_compileApiObject(apiName: string) {
		this.compileApiObject = getLocalStorageCompileApiObject(apiName)
	}
}
export const compileApiModule = getModule(compileApi)
