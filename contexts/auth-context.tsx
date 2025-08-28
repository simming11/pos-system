"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { get } from "@/lib/api"
import { getRoles } from "@/lib/roleService"

export interface User {
  id: string
  name: string
  role: string // now role is id or name, depending on backend
  code: string
}

interface AuthContextType {
  user: User | null
  login: (code: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)




export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  useEffect(() => {
    // Restore session from localStorage
    const savedUser = localStorage.getItem("pos-user")
    if (savedUser) {
      try {
        const { id } = JSON.parse(savedUser)
        // fetch user by id (optional: implement getUserById if needed)
        // For now, just set id (should be improved to fetch user details)
        setUser({ id, name: "", role: "", code: "" })
      } catch {}
    }
    setIsAuthLoading(false)
  }, [])

  // login ด้วย pin 6 หลัก (fetch all users, then match pin)
  const login = async (code: string): Promise<boolean> => {
    const normalizedCode = (code || "").replace(/\D/g, "").slice(0, 6)
    if (normalizedCode.length !== 6) return false
    try {
      const users = await get('user')
      const foundUser = users.find((u: any) => u.pin === normalizedCode)
      if (foundUser && foundUser.id) {
        // fetch roles and map roleId to role name/desc
        const roles = await getRoles()
        const userRole = roles.find((r: any) => r.id === foundUser.roleId)
        const userWithRole = {
          ...foundUser,
          roleName: userRole ? userRole.name : undefined,
          roleDescription: userRole ? userRole.description : undefined,
        }
      
        setUser(userWithRole)
        localStorage.setItem("pos-user", JSON.stringify({ id: foundUser.id }))
        return true
      }
    } catch (e) {
      // login failed
    }
    return false
  }


  const logout = () => {
    setUser(null)
    localStorage.removeItem("pos-user")
  }

  const isAuthenticated = !!user && !!user.id

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
