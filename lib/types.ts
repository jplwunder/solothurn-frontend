export interface Company {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface Customer {
  id: number
  company_id: number
  name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}
