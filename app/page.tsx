"use client"

import { useState, useEffect } from "react"
import { ProductCatalog } from "@/components/product-catalog"
import { ProductManagement } from "@/components/product-management"
import { AdminSettings } from "@/components/admin-settings"
import { ShoppingCart } from "@/components/shopping-cart"
import { PaymentSection } from "@/components/payment-section"
import { ReceiptModal } from "@/components/receipt-modal"
import { Button } from "@/components/ui/button"
import { CarIcon as CartIcon, Package, LogOut, User, Settings } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { LoginScreen } from "@/components/login-screen"
import { useSettings, type Member } from "@/contexts/settings-context"
import ProductList from "@/components/product-list"
import { getProducts } from "@/lib/productService"
import { getCategories } from "@/lib/categoryService"

export interface Product {
  id: string
  name: string
  price: number
  category: string
  image?: string
  stock: number
}

export interface CartItem extends Product {
  quantity: number
}

export interface Sale {
  id: string
  items: CartItem[]
  total: number
  tax: number
  subtotal: number
  originalSubtotal?: number
  discountAmount?: number
  memberDiscount?: {
    name: string
    discountPercent: number
  }
  memberInfo?: {
    member: Member
    pointsEarned: number
    pointsUsed: number
  }
  paymentMethod: string
  timestamp: Date
}


// Extend User type to include roleName and roleDescription for context user
interface UserWithRole {
  id: string
  name: string
  role: string
  code?: string
  roleName?: string
  roleDescription?: string
}
// initialProducts removed — products will be loaded from the API on mount

export default function POSSystem() {
  const { user, logout, isAuthenticated } = useAuth() as { user: UserWithRole | null, logout: () => void, isAuthenticated: boolean }
  const { storeSettings, addSalesTransaction, updateMemberPoints } = useSettings()


  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastSale, setLastSale] = useState<Sale | null>(null)
  const [activeTab, setActiveTab] = useState<"pos" | "products" | "settings">("pos")
  const [products, setProducts] = useState<Product[]>([])

  // Fetch categories and products from API on mount and map to the local Product shape.
  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        // Load categories first to map ids -> names
        const categoriesData: any[] = await getCategories()
        const categoryMap = new Map<string, string>()
        if (Array.isArray(categoriesData)) {
          for (const c of categoriesData) {
            const id = String(c.id ?? c._id ?? '')
            const name = c.name ?? c.title ?? 'อื่นๆ'
            categoryMap.set(id, name)
          }
        }

        const data: any[] = await getProducts()
        if (!mounted || !data) return

        const mapped = data.map((p: any) => {
          const rawCategory = p.category ?? p.categoryId ?? ''
          const categoryId = String(rawCategory)
          return {
            id: String(p.id ?? p._id ?? ''),
            name: p.name ?? 'Unnamed',
            price: Number(p.price ?? 0),
            category: categoryMap.get(categoryId) ?? (p.categoryName ?? 'อื่นๆ'),
            image: p.image ?? '/placeholder-izwrt.png',
            stock: Number(p.stock ?? 0),
          }
        }) as Product[]

        setProducts(mapped)
      } catch (err) {
        console.error('Failed to load products from API:', err)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id)
      if (existingItem) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== id))
    } else {
      setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)))
    }
  }

  const clearCart = () => {
    setCartItems([])
  }

  const completeSale = (
    paymentMethod: string,
    memberDiscount?: { name: string; discountPercent: number },
    memberInfo?: { member: Member; pointsEarned: number; pointsUsed: number },
  ) => {
    const originalSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Calculate discount
    const discountAmount = memberDiscount ? originalSubtotal * (memberDiscount.discountPercent / 100) : 0
    const pointsRedemptionAmount = memberInfo ? memberInfo.pointsUsed * storeSettings.pointsRedeemValue : 0
    const subtotal = originalSubtotal - discountAmount - pointsRedemptionAmount

    // Use configurable tax rate
    const tax = subtotal * (storeSettings.taxRate / 100)
    const total = subtotal + tax

    const sale: Sale = {
      id: `SALE-${Date.now()}`,
      items: [...cartItems],
      subtotal,
      originalSubtotal: discountAmount > 0 || pointsRedemptionAmount > 0 ? originalSubtotal : undefined,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      memberDiscount,
      memberInfo,
      tax,
      total,
      paymentMethod,
      timestamp: new Date(),
    }

    const transactionItems = cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }))

    addSalesTransaction({
      date: new Date().toISOString(),
      items: transactionItems,
      subtotal: originalSubtotal,
      discount: discountAmount + pointsRedemptionAmount,
      tax,
      total,
      paymentMethod,
      memberId: memberInfo?.member.id,
      pointsEarned: memberInfo?.pointsEarned || 0,
      pointsUsed: memberInfo?.pointsUsed || 0,
    })

    if (memberInfo) {
      const netPointsChange = memberInfo.pointsEarned - memberInfo.pointsUsed
      updateMemberPoints(memberInfo.member.id, netPointsChange, total)
    }

    setLastSale(sale)
    setShowReceipt(true)
    clearCart()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">POS System</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user?.name}</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                {user?.roleName ? user.roleName : "-"}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                variant={activeTab === "pos" ? "default" : "outline"}
                onClick={() => setActiveTab("pos")}
                className="flex items-center gap-2"
              >
                <CartIcon className="h-4 w-4" />
                Point of Sale
              </Button>
              {user?.roleName === "Admin" && (
                <>
                  <Button
                    variant={activeTab === "products" ? "default" : "outline"}
                    onClick={() => setActiveTab("products")}
                    className="flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    Products
                  </Button>
                  <Button
                    variant={activeTab === "settings" ? "default" : "outline"}
                    onClick={() => setActiveTab("settings")}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>

                </>
              )}
            </div>

            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {activeTab === "pos" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Catalog */}
            <div className="lg:col-span-2">
              <ProductCatalog products={products} onAddToCart={addToCart} />
            </div>

            {/* Cart and Payment */}
            <div className="space-y-6">
              <ShoppingCart items={cartItems} onUpdateQuantity={updateQuantity} onClearCart={clearCart} />
              <PaymentSection cartItems={cartItems} onCompleteSale={completeSale} />
            </div>
          </div>
        ) : activeTab === "products" ? (
          <div>
            {user?.roleName === "Admin" ? (
              <ProductManagement products={products} onProductsChange={setProducts} />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {user?.roleName === "Admin" ? (
              <AdminSettings />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Receipt Modal */}
      {showReceipt && lastSale && <ReceiptModal sale={lastSale} onClose={() => setShowReceipt(false)} />}
    </div>
  )
}
