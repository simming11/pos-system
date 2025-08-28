import { get } from './api';

export async function getUserByPin(pin: string) {
  // สมมติว่ามี endpoint /api/user/login ที่รับ pin แล้วคืน user เดียว
  return get(`user/login?pin=${encodeURIComponent(pin)}`);
}
