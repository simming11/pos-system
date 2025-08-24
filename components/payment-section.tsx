"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Banknote, Smartphone, Users, Award, Search } from "lucide-react"
import { useSettings, type Member } from "@/contexts/settings-context"
import type { CartItem } from "@/app/page"

interface PaymentSectionProps {
  cartItems: CartItem[]
  onCompleteSale: (
    paymentMethod: string,
    memberDiscount?: { name: string; discountPercent: number },
    memberInfo?: { member: Member; pointsEarned: number; pointsUsed: number },
  ) => void
}

export function PaymentSection({ cartItems, onCompleteSale }: PaymentSectionProps) {
  const { storeSettings, memberDiscounts, getMemberByCode } = useSettings()
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [cashReceived, setCashReceived] = useState("")
  const [selectedMemberDiscount, setSelectedMemberDiscount] = useState<string>("none")
  const [memberCode, setMemberCode] = useState("")
  const [currentMember, setCurrentMember] = useState<Member | null>(null)
  const [pointsToUse, setPointsToUse] = useState(0)

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const selectedDiscount = memberDiscounts.find((d) => d.id === selectedMemberDiscount)
  const discountAmount =
    selectedDiscount && subtotal >= selectedDiscount.minPurchase
      ? subtotal * (selectedDiscount.discountPercent / 100)
      : 0

  const pointsRedemptionAmount = pointsToUse * storeSettings.pointsValue
  const discountedSubtotal = subtotal - discountAmount - pointsRedemptionAmount

  const tax = discountedSubtotal * (storeSettings.taxRate / 100)
  const total = discountedSubtotal + tax
  const change = paymentMethod === "cash" ? Math.max(0, Number.parseFloat(cashReceived || "0") - total) : 0

  const pointsEarned = Math.floor(subtotal * storeSettings.pointsPerBaht)

  const canCompleteSale =
    cartItems.length > 0 && (paymentMethod !== "cash" || Number.parseFloat(cashReceived || "0") >= total)

  const handleMemberLookup = () => {
    if (memberCode.trim()) {
      const member = getMemberByCode(memberCode.trim())
      if (member) {
        setCurrentMember(member)
      } else {
        alert("ไม่พบรหัสสมาชิกนี้")
      }
    }
  }

  const handlePointsChange = (value: string) => {
    const points = Number.parseInt(value) || 0
    const maxPoints = currentMember ? Math.min(currentMember.points, Math.floor(total / storeSettings.pointsValue)) : 0
    setPointsToUse(Math.min(points, maxPoints))
  }

  const handleCompleteSale = () => {
    if (canCompleteSale) {
      const memberInfo = currentMember
        ? {
            member: currentMember,
            pointsEarned,
            pointsUsed: pointsToUse,
          }
        : undefined

      onCompleteSale(
        paymentMethod,
        selectedDiscount
          ? {
              name: selectedDiscount.name,
              discountPercent: selectedDiscount.discountPercent,
            }
          : undefined,
        memberInfo,
      )

      setCashReceived("")
      setSelectedMemberDiscount("none")
      setMemberCode("")
      setCurrentMember(null)
      setPointsToUse(0)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>การชำระเงิน</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cartItems.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">เพิ่มสินค้าในตะกร้าก่อนชำระเงิน</div>
        ) : (
          <>
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                ค้นหาสมาชิก
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="รหัสสมาชิก"
                  value={memberCode}
                  onChange={(e) => setMemberCode(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleMemberLookup()}
                />
                <Button variant="outline" onClick={handleMemberLookup}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {currentMember && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{currentMember.name}</p>
                      <p className="text-sm text-muted-foreground">{currentMember.phone}</p>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      {currentMember.points.toLocaleString()} แต้ม
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pointsToUse" className="text-sm">
                      ใช้แต้มสะสม
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="pointsToUse"
                        type="number"
                        min="0"
                        max={Math.min(currentMember.points, Math.floor(total / storeSettings.pointsValue))}
                        value={pointsToUse}
                        onChange={(e) => handlePointsChange(e.target.value)}
                        placeholder="0"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPointsToUse(Math.min(currentMember.points, Math.floor(total / storeSettings.pointsValue)))
                        }
                      >
                        ใช้ทั้งหมด
                      </Button>
                    </div>
                    {pointsToUse > 0 && (
                      <p className="text-sm text-green-600">
                        ใช้ {pointsToUse} แต้ม = ลด ฿{pointsRedemptionAmount.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                ส่วนลดสมาชิก
              </Label>
              <Select value={selectedMemberDiscount} onValueChange={setSelectedMemberDiscount}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกระดับสมาชิก (ถ้ามี)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">ไม่ใช่สมาชิก</SelectItem>
                  {memberDiscounts.map((discount) => (
                    <SelectItem key={discount.id} value={discount.id}>
                      {discount.name} - {discount.discountPercent}%
                      {subtotal < discount.minPurchase && ` (ขั้นต่ำ ฿${discount.minPurchase})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDiscount && subtotal < selectedDiscount.minPurchase && (
                <p className="text-sm text-muted-foreground">ยอดซื้อขั้นต่ำสำหรับส่วนลดนี้: ฿{selectedDiscount.minPurchase}</p>
              )}
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">วิธีการชำระเงิน</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                    <Banknote className="h-4 w-4" />
                    เงินสด
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-4 w-4" />
                    บัตรเครดิต/เดบิต
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mobile" id="mobile" />
                  <Label htmlFor="mobile" className="flex items-center gap-2 cursor-pointer">
                    <Smartphone className="h-4 w-4" />
                    Mobile Banking
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Cash Payment Details */}
            {paymentMethod === "cash" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="cash-received">จำนวนเงินที่รับ</Label>
                  <Input
                    id="cash-received"
                    type="number"
                    placeholder="0.00"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="text-right"
                  />
                </div>
                {cashReceived && Number.parseFloat(cashReceived) >= total && (
                  <div className="p-3 bg-secondary/20 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>เงินทอน:</span>
                      <span className="font-bold text-lg">฿{change.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>ยอดรวม:</span>
                <span>฿{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>ส่วนลด ({selectedDiscount?.name}):</span>
                  <span>-฿{discountAmount.toFixed(2)}</span>
                </div>
              )}
              {pointsRedemptionAmount > 0 && (
                <div className="flex justify-between text-sm text-blue-600">
                  <span>ใช้แต้ม ({pointsToUse} แต้ม):</span>
                  <span>-฿{pointsRedemptionAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>ภาษี ({storeSettings.taxRate}%):</span>
                <span>฿{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>ยอดที่ต้องชำระ:</span>
                <span className="text-primary">฿{total.toFixed(2)}</span>
              </div>
              {currentMember && (
                <div className="flex justify-between text-sm text-green-600 border-t pt-2">
                  <span>แต้มที่จะได้รับ:</span>
                  <span className="flex items-center gap-1">
                    <Award className="h-3 w-3" />+{pointsEarned} แต้ม
                  </span>
                </div>
              )}
            </div>

            {/* Complete Sale Button */}
            <Button onClick={handleCompleteSale} disabled={!canCompleteSale} className="w-full" size="lg">
              ชำระเงิน
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
