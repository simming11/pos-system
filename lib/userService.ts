import { get } from './api'

export function getUsers() {
  return get('user')
}
