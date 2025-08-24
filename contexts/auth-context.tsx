"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface User {
  id: string
  name: string
  role: "admin" | "employee"
  code: string
}

interface AuthContextType {
  user: User | null
  login: (code: string) => boolean
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Sample users with codes
const users: User[] = [
  {
    id: "1",
    name: "ผู้จัดการ",
    role: "admin",
    code: "1234",
  },
  {
    id: "2",
    name: "พนักงาน A",
    role: "employee",
    code: "5678",
  },
  {
    id: "3",
    name: "พนักงาน B",
    role: "employee",
    code: "9999",
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem("pos-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = (code: string): boolean => {
    const foundUser = users.find((u) => u.code === code)
    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem("pos-user", JSON.stringify(foundUser))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("pos-user")
  }

  const isAuthenticated = !!user

  return <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
