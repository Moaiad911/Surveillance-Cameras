import api from '../lib/api'

export interface LoginCredentials {
  username: string
  password: string
}

export interface SignupCredentials {
  username: string
  password: string
  role?: 'Admin' | 'Operator'
}

export interface AuthResponse {
  message: string
  token: string
  user: {
    id: string
    username: string
    role: string
  }
}

export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials)
    return response.data
  },

  // Register new user
  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/signup', credentials)
    return response.data
  },
}
