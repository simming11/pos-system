export interface User {
  id: string
  username: string
  email: string
  password_hash: string
  salt: string
  name: string
  pin: string | null
  roleId: string
  is_active: boolean
  branch_id: string
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
  last_login: string | null
  deleted_at: string | null
}
