import { get } from './api';

export async function getRoles() {
  return get('role');
}
