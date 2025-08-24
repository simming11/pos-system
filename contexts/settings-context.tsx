"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface StoreSettings {
  storeName: string
  address: string
  phone: string
  taxRate: number
  pointsEarnRate: number // จำนวนเงินที่ต้องซื้อเพื่อได้ 1 แต้ม (เช่น 25 บาท = 1 แต้ม)
  pointsRedeemRate: number // จำนวนแต้มที่ใช้แลกเงิน (เช่น 100 แต้ม = 10 บาท)
  pointsRedeemValue: number // มูลค่าเงินที่ได้จากการแลกแต้ม (เช่น 10 บาท)
  // Backwards-compatible fields used in components
  pointsValue?: number // alternative name for pointsRedeemValue
  pointsPerBaht?: number // alternative for pointsEarnRate inverse
}

export interface MemberDiscount {
  id: string
  name: string
  discountPercent: number
  minPurchase: number
}

export interface Member {
  id: string
  memberCode: string
  name: string
  phone: string
  points: number
  totalSpent: number
  joinDate: string
  lastVisit: string
}

export interface SalesTransaction {
  id: string
  date: string
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: string
  memberId?: string
  pointsEarned?: number
  pointsUsed?: number
}

interface SettingsContextType {
  storeSettings: StoreSettings
  memberDiscounts: MemberDiscount[]
  members: Member[]
  salesTransactions: SalesTransaction[]
  updateStoreSettings: (settings: StoreSettings) => void
  addMemberDiscount: (discount: Omit<MemberDiscount, "id">) => void
  updateMemberDiscount: (id: string, discount: Omit<MemberDiscount, "id">) => void
  deleteMemberDiscount: (id: string) => void
  addMember: (member: Omit<Member, "id" | "points" | "totalSpent" | "joinDate" | "lastVisit">) => void
  updateMember: (id: string, member: Partial<Member>) => void
  deleteMember: (id: string) => void
  getMemberByCode: (code: string) => Member | undefined
  addSalesTransaction: (transaction: Omit<SalesTransaction, "id">) => void
  updateMemberPoints: (memberId: string, pointsEarned: number, totalSpent: number) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const defaultStoreSettings: StoreSettings = {
  storeName: "ร้านค้าของเรา",
  address: "123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองตัน กรุงเทพฯ 10110",
  phone: "02-123-4567",
  taxRate: 7,
  pointsEarnRate: 25, // ซื้อ 25 บาท ได้ 1 แต้ม
  pointsRedeemRate: 100, // ใช้ 100 แต้ม
  pointsRedeemValue: 10, // ได้ส่วนลด 10 บาท
  pointsValue: 10, // compatibility alias (pointsValue used in some components)
  pointsPerBaht: 1 / 25, // points earned per baht (used in some components)
}

const defaultMemberDiscounts: MemberDiscount[] = [
  {
    id: "1",
    name: "สมาชิกทั่วไป",
    discountPercent: 5,
    minPurchase: 100,
  },
  {
    id: "2",
    name: "สมาชิก VIP",
    discountPercent: 10,
    minPurchase: 500,
  },
]

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultStoreSettings)
  const [memberDiscounts, setMemberDiscounts] = useState<MemberDiscount[]>(defaultMemberDiscounts)
  const [members, setMembers] = useState<Member[]>([])
  const [salesTransactions, setSalesTransactions] = useState<SalesTransaction[]>([])

  useEffect(() => {
    const savedStoreSettings = localStorage.getItem("pos-store-settings")
    const savedMemberDiscounts = localStorage.getItem("pos-member-discounts")
    const savedMembers = localStorage.getItem("pos-members")
    const savedTransactions = localStorage.getItem("pos-sales-transactions")

    if (savedStoreSettings) {
      setStoreSettings(JSON.parse(savedStoreSettings))
    }

    if (savedMemberDiscounts) {
      setMemberDiscounts(JSON.parse(savedMemberDiscounts))
    }

    if (savedMembers) {
      setMembers(JSON.parse(savedMembers))
    }

    if (savedTransactions) {
      setSalesTransactions(JSON.parse(savedTransactions))
    }
  }, [])

  const updateStoreSettings = (settings: StoreSettings) => {
    setStoreSettings(settings)
    localStorage.setItem("pos-store-settings", JSON.stringify(settings))
  }

  const addMemberDiscount = (discount: Omit<MemberDiscount, "id">) => {
    const newDiscount = {
      ...discount,
      id: Date.now().toString(),
    }
    const updated = [...memberDiscounts, newDiscount]
    setMemberDiscounts(updated)
    localStorage.setItem("pos-member-discounts", JSON.stringify(updated))
  }

  const updateMemberDiscount = (id: string, discount: Omit<MemberDiscount, "id">) => {
    const updated = memberDiscounts.map((d) => (d.id === id ? { ...discount, id } : d))
    setMemberDiscounts(updated)
    localStorage.setItem("pos-member-discounts", JSON.stringify(updated))
  }

  const deleteMemberDiscount = (id: string) => {
    const updated = memberDiscounts.filter((d) => d.id !== id)
    setMemberDiscounts(updated)
    localStorage.setItem("pos-member-discounts", JSON.stringify(updated))
  }

  const addMember = (member: Omit<Member, "id" | "points" | "totalSpent" | "joinDate" | "lastVisit">) => {
    const newMember: Member = {
      ...member,
      id: Date.now().toString(),
      points: 0,
      totalSpent: 0,
      joinDate: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
    }
    const updated = [...members, newMember]
    setMembers(updated)
    localStorage.setItem("pos-members", JSON.stringify(updated))
  }

  const updateMember = (id: string, memberUpdate: Partial<Member>) => {
    const updated = members.map((m) => (m.id === id ? { ...m, ...memberUpdate } : m))
    setMembers(updated)
    localStorage.setItem("pos-members", JSON.stringify(updated))
  }

  const deleteMember = (id: string) => {
    const updated = members.filter((m) => m.id !== id)
    setMembers(updated)
    localStorage.setItem("pos-members", JSON.stringify(updated))
  }

  const getMemberByCode = (code: string) => {
    return members.find((m) => m.memberCode === code)
  }

  const addSalesTransaction = (transaction: Omit<SalesTransaction, "id">) => {
    const newTransaction: SalesTransaction = {
      ...transaction,
      id: Date.now().toString(),
    }
    const updated = [...salesTransactions, newTransaction]
    setSalesTransactions(updated)
    localStorage.setItem("pos-sales-transactions", JSON.stringify(updated))
  }

  const updateMemberPoints = (memberId: string, pointsEarned: number, totalSpent: number) => {
    const updated = members.map((m) =>
      m.id === memberId
        ? {
            ...m,
            points: m.points + pointsEarned,
            totalSpent: m.totalSpent + totalSpent,
            lastVisit: new Date().toISOString(),
          }
        : m,
    )
    setMembers(updated)
    localStorage.setItem("pos-members", JSON.stringify(updated))
  }

  return (
    <SettingsContext.Provider
      value={{
        storeSettings,
        memberDiscounts,
        members,
        salesTransactions,
        updateStoreSettings,
        addMemberDiscount,
        updateMemberDiscount,
        deleteMemberDiscount,
        addMember,
        updateMember,
        deleteMember,
        getMemberByCode,
        addSalesTransaction,
        updateMemberPoints,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
