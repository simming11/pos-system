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



// เพิ่ม prop users เพื่อรับ users จากภายนอก (API)
export function AuthProvider({ children, users = [] }: { children: ReactNode, users?: any[] }) {
  const [user, setUser] = useState<any | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem("pos-user")
    if (savedUser) {
      try {
        const { id } = JSON.parse(savedUser)
        // map id กับ users ที่มาจาก API
        const foundUser = users.find((u) => u.id === id)
        if (foundUser) {
          setUser((prev: any) => (prev && prev.id === foundUser.id ? prev : foundUser))
        }
      } catch {}
    }
    setIsAuthLoading(false)
  }, [users])

  // login ด้วย pin 6 หลัก (เพิ่มความปลอดภัย)
  const login = (code: string): boolean => {
    if (!users || users.length === 0) return false
    // normalize code: trim, only digits, length 6
    const normalizedCode = (code || "").replace(/\D/g, "").slice(0, 6)
    if (normalizedCode.length !== 6) return false
    // ห้ามรับ pin ที่ไม่ใช่ string 6 หลัก
    const foundUser = users.find((u) => typeof u.pin === "string" && u.pin.length === 6 && u.pin === normalizedCode)
    if (foundUser) {
      setUser(foundUser)
        // เก็บเฉพาะ id ใน localStorage
        localStorage.setItem("pos-user", JSON.stringify({ id: foundUser.id }))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("pos-user")
  }

  const isAuthenticated = !!user

  if (isAuthLoading) return null
  return <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
