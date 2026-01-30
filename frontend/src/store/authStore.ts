import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services/authService'

interface User {
  id: string
  username: string
  role: 'Admin' | 'Operator'
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string, role?: 'Admin' | 'Operator') => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (username: string, password: string) => {
        try {
          const response = await authService.login({ username, password })
          
          set({
            user: {
              id: response.user.id,
              username: response.user.username,
              role: response.user.role as 'Admin' | 'Operator',
            },
            token: response.token,
            isAuthenticated: true,
          })
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Login failed. Please try again.'
          throw new Error(errorMessage)
        }
      },
      register: async (username: string, password: string, role?: 'Admin' | 'Operator') => {
        try {
          const response = await authService.signup({ username, password, role: role as 'Admin' | 'Operator' | undefined })
          
          set({
            user: {
              id: response.user.id,
              username: response.user.username,
              role: response.user.role as 'Admin' | 'Operator',
            },
            token: response.token,
            isAuthenticated: true,
          })
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.'
          throw new Error(errorMessage)
        }
      },
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

