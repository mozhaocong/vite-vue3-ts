import { createStore } from 'vuex'
import { compileApi } from './modules/compileApi'
export interface RootState {
	compileApi: compileApi
}
export default createStore<RootState>({})
