import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'
export interface compileApiListType {
	value: string
}

export interface compileApiState {
	compileApiList: Array<compileApiListType>
}
@Module({ namespaced: true, store, name: 'compileApi', dynamic: true })
export class compileApi extends VuexModule implements compileApiState {
	public compileApiList: Array<compileApiListType> = []

	@Mutation
	public set_compileApiList({ apiName, item }: { item: compileApiListType; apiName: string }) {
		if (!item || !item.value || !apiName) return
		let isOk = true
		for (let i of this.compileApiList) {
			console.log(i)
			if (i.value === item.value) {
				i = item
				isOk = false
				break
			}
		}
		if (isOk) this.compileApiList.push(item)
		window.localStorage.setItem(`${apiName}_compileApiList`, JSON.stringify(this.compileApiList))
	}

	@Mutation
	public get_compileApiList(apiName: string) {
		const data = window.localStorage.getItem(`${apiName}_compileApiList`)
		this.compileApiList = data ? JSON.parse(data) : []
		return this.compileApiList
	}
}
export const compileApiModule = getModule(compileApi)
