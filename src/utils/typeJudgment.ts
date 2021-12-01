import { is } from 'ramda'

export function isString(value: any): value is string {
	return is(String, value)
}
