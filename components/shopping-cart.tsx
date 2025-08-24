"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, Trash2, CarIcon as CartIcon } from "lucide-react"
import type { CartItem } from "@/app/page"

interface ShoppingCartProps {
  items: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onClearCart: () => void
}

export function ShoppingCart({ items, onUpdateQuantity, onClearCart }: ShoppingCartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.07 // 7% tax
  const total = subtotal + tax

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CartIcon className="h-5 w-5" />
            ตะกร้าสินค้า
          </div>
          <Badge variant="secondary">{items.reduce((sum, item) => sum + item.quantity, 0)} รายการ</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CartIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>ตะกร้าว่าง</p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">฿{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onUpdateQuantity(item.id, 0)}
                      className="h-8 w-8 p-0 ml-2"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="space-y-2 pt-3 border-t">
              <div className="flex justify-between text-sm">
                <span>ยอดรวม:</span>
                <span>฿{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>ภาษี (7%):</span>
                <span>฿{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>รวมทั้งสิ้น:</span>
                <span className="text-primary">฿{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Clear Cart Button */}
            <Button variant="outline" onClick={onClearCart} className="w-full bg-transparent" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              ล้างตะกร้า
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
