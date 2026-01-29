import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'operator' | 'viewer'
  name: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (username: string, password: string) => {
        // Simulate API call
        // In production, replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock authentication - in production, validate with backend
        if (username && password) {
          const mockUser: User = {
            id: '1',
            username,
            email: `${username}@example.com`,
            role: username === 'admin' ? 'admin' : 'operator',
            name: username.charAt(0).toUpperCase() + username.slice(1),
          }

          set({
            user: mockUser,
            token: 'mock-jwt-token',
            isAuthenticated: true,
          })
        } else {
          throw new Error('Invalid credentials')
        }
      },
      register: async (username: string, email: string, name: string) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockUser: User = {
          id: Date.now().toString(),
          username,
          email,
          role: 'viewer',
          name,
        }

        set({
          user: mockUser,
          token: 'mock-jwt-token',
          isAuthenticated: true,
        })
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

