import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const email = `${username}@test.com`
      let isNewUser = false
      // Try to sign in first
      try {
        await signInWithEmailAndPassword(auth, email, password)
      } catch (signInError: any) {
        // If user doesn't exist, create new account
        if (signInError.code === 'auth/user-not-found') {
          await createUserWithEmailAndPassword(auth, email, password)
          isNewUser = true
        } else {
          throw signInError
        }
      }
      return isNewUser
    } catch (error: any) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
