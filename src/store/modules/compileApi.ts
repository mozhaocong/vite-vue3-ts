import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'
export interface compileApiList {
	value: string
}

export interface compileApiState {
	compileApiList: Array<compileApiList>
}
@Module({ namespaced: true, store, name: 'compileApi', dynamic: true })
export class compileApi extends VuexModule implements compileApiState {
	public compileApiList: Array<compileApiList> = []

	@Mutation
	public set_compileApiList(item: compileApiList) {
		if (!item || !item.value) return
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
		window.localStorage.setItem('compileApiList', JSON.stringify(this.compileApiList))
	}

	@Mutation
	public get_compileApiList() {
		const data = window.localStorage.getItem('compileApiList')
		this.compileApiList = data ? JSON.parse(data) : []
		return this.compileApiList
	}
}
export const compileApiModule = getModule(compileApi)
