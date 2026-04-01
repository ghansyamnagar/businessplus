
// Type Imports
import type { ThemeColor } from '@core/types'

export type UsersType = {
  user_id: number
  name: string
  designation: string
  gender: string
  email: string
  date_birth: string
  mobile: string
  mobile2: string
  pan_card_no: string
  city: string
  address: string
  multi_unit_id: string
  multi_dept_id: string
  multi_section_id: string
  display_name: string
  role_id: number
  multi_unit_ids: { unit_id: number, unit_name: string }[]
  multi_dept_ids: { dept_id: number, dept_name: string }[]
  multi_section_ids: { section_id: number, section_name: string }[]
  password?: string
  company_id?: number
}
