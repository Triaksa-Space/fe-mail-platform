import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AuthState {
  token: string | null
  setToken: (token: string | null) => void
  logout: () => void
  getStoredToken: () => string | null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      logout: () => {
        set({ token: null })
        window.localStorage.removeItem('auth-storage')
        window.location.href = '/signin'
      },
      getStoredToken: () => {
        if (typeof window === 'undefined') return null
        
        const stored = window.sessionStorage.getItem('auth-storage')
        if (!stored) return null
        
        try {
          const parsed = JSON.parse(stored)
          return parsed.state?.token || null
        } catch {
          return null
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return sessionStorage
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {}
        }
      }),
      partialize: (state) => ({ token: state.token }),
    }
  )
)