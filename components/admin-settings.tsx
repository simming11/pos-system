"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Edit } from "lucide-react"
import { useSettings, type StoreSettings, type MemberDiscount } from "@/contexts/settings-context"
import { MemberManagement } from "./member-management"
import { SalesAnalytics } from "./sales-analytics"
import { InventoryReports } from "./inventory-reports"
import { CustomerAnalytics } from "./customer-analytics"
import type { Product } from "@/types/product"

export function AdminSettings() {
  const {
    storeSettings,
    memberDiscounts,
    updateStoreSettings,
    addMemberDiscount,
    updateMemberDiscount,
    deleteMemberDiscount,
  } = useSettings()

  const [editingStoreSettings, setEditingStoreSettings] = useState<StoreSettings>(storeSettings)
  const [editingDiscount, setEditingDiscount] = useState<MemberDiscount | null>(null)
  const [newDiscount, setNewDiscount] = useState({
    name: "",
    discountPercent: 0,
    minPurchase: 0,
  })

  const [products] = useState<Product[]>([
    {
      id: "1",
      name: "กาแฟดำ",
      price: 45,
      category: "เครื่องดื่ม",
      stock: 50,
      image: "/placeholder-izwrt.png",
    },
    {
      id: "2",
      name: "กาแฟนมสด",
      price: 55,
      category: "เครื่องดื่ม",
      stock: 30,
      image: "/latte-coffee-cup.png",
    },
    {
      id: "3",
      name: "ชาเขียว",
      price: 40,
      category: "เครื่องดื่ม",
      stock: 25,
      image: "/green-tea-cup.png",
    },
    {
      id: "4",
      name: "ขนมปังโฮลวีท",
      price: 35,
      category: "อาหาร",
      stock: 20,
      image: "/whole-wheat-bread.png",
    },
    {
      id: "5",
      name: "แซนด์วิชไก่",
      price: 85,
      category: "อาหาร",
      stock: 15,
      image: "/classic-chicken-sandwich.png",
    },
    {
      id: "6",
      name: "สลัดผัก",
      price: 65,
      category: "อาหาร",
      stock: 12,
      image: "/fresh-vegetable-salad.png",
    },
    {
      id: "7",
      name: "น้ำส้มคั้นสด",
      price: 50,
      category: "เครื่องดื่ม",
      stock: 18,
      image: "/fresh-orange-juice.png",
    },
    {
      id: "8",
      name: "คุกกี้ช็อกโกแลต",
      price: 25,
      category: "ขนม",
      stock: 40,
      image: "/chocolate-chip-cookies.png",
    },
  ])

  const handleSaveStoreSettings = () => {
    updateStoreSettings(editingStoreSettings)
  }

  const handleAddDiscount = () => {
    if (newDiscount.name && newDiscount.discountPercent > 0) {
      addMemberDiscount(newDiscount)
      setNewDiscount({ name: "", discountPercent: 0, minPurchase: 0 })
    }
  }

  const handleUpdateDiscount = () => {
    if (editingDiscount) {
      updateMemberDiscount(editingDiscount.id, {
        name: editingDiscount.name,
        discountPercent: editingDiscount.discountPercent,
        minPurchase: editingDiscount.minPurchase,
      })
      setEditingDiscount(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">ตั้งค่าระบบ</h2>
        <p className="text-muted-foreground">จัดการข้อมูลร้านค้า อัตราภาษี และระบบสมาชิก</p>
      </div>

      <Tabs defaultValue="store" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="store">ข้อมูลร้านค้า</TabsTrigger>
          <TabsTrigger value="points">ระบบแต้ม</TabsTrigger>
          <TabsTrigger value="members">ระบบสมาชิก</TabsTrigger>
          <TabsTrigger value="manage-members">จัดการสมาชิก</TabsTrigger>
          <TabsTrigger value="analytics">รายงานการขาย</TabsTrigger>
          <TabsTrigger value="inventory">รายงานสต็อก</TabsTrigger>
          <TabsTrigger value="customers">วิเคราะห์ลูกค้า</TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลร้านค้า</CardTitle>
              <CardDescription>แก้ไขข้อมูลที่จะแสดงบนใบเสร็จ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">ชื่อร้าน</Label>
                <Input
                  id="storeName"
                  value={editingStoreSettings.storeName}
                  onChange={(e) => setEditingStoreSettings({ ...editingStoreSettings, storeName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">ที่อยู่</Label>
                <Textarea
                  id="address"
                  value={editingStoreSettings.address}
                  onChange={(e) => setEditingStoreSettings({ ...editingStoreSettings, address: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                <Input
                  id="phone"
                  value={editingStoreSettings.phone}
                  onChange={(e) => setEditingStoreSettings({ ...editingStoreSettings, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxRate">อัตราภาษี (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={editingStoreSettings.taxRate}
                  onChange={(e) =>
                    setEditingStoreSettings({
                      ...editingStoreSettings,
                      taxRate: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <Button onClick={handleSaveStoreSettings} className="w-full">
                บันทึกข้อมูลร้านค้า
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="points" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ตั้งค่าระบบแต้มสะสม</CardTitle>
              <CardDescription>กำหนดอัตราการได้รับแต้มและมูลค่าแต้มแบบยืดหยุ่น</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pointsEarnRate">ซื้อกี่บาทได้ 1 แต้ม</Label>
                  <Input
                    id="pointsEarnRate"
                    type="number"
                    min="1"
                    step="1"
                    value={editingStoreSettings.pointsEarnRate}
                    onChange={(e) =>
                      setEditingStoreSettings({
                        ...editingStoreSettings,
                        pointsEarnRate: Number.parseInt(e.target.value) || 1,
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    ซื้อ {editingStoreSettings.pointsEarnRate} บาท ได้รับ 1 แต้ม
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pointsRedeemRate">ใช้กี่แต้ม</Label>
                  <Input
                    id="pointsRedeemRate"
                    type="number"
                    min="1"
                    step="1"
                    value={editingStoreSettings.pointsRedeemRate}
                    onChange={(e) =>
                      setEditingStoreSettings({
                        ...editingStoreSettings,
                        pointsRedeemRate: Number.parseInt(e.target.value) || 1,
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">ใช้ {editingStoreSettings.pointsRedeemRate} แต้ม</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pointsRedeemValue">ได้ส่วนลดกี่บาท</Label>
                  <Input
                    id="pointsRedeemValue"
                    type="number"
                    min="1"
                    step="1"
                    value={editingStoreSettings.pointsRedeemValue}
                    onChange={(e) =>
                      setEditingStoreSettings({
                        ...editingStoreSettings,
                        pointsRedeemValue: Number.parseInt(e.target.value) || 1,
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">ได้ส่วนลด {editingStoreSettings.pointsRedeemValue} บาท</p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">ตัวอย่างการคำนวณ</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong>การได้รับแต้ม:</strong> ลูกค้าซื้อสินค้า 100 บาท จะได้รับ{" "}
                    {Math.floor(100 / editingStoreSettings.pointsEarnRate)} แต้ม
                  </p>
                  <p>
                    <strong>การใช้แต้ม:</strong> ใช้ {editingStoreSettings.pointsRedeemRate} แต้ม ได้ส่วนลด{" "}
                    {editingStoreSettings.pointsRedeemValue} บาท
                  </p>
                  <p>
                    <strong>อัตราแลกเปลี่ยน:</strong> 1 แต้ม ={" "}
                    {(editingStoreSettings.pointsRedeemValue / editingStoreSettings.pointsRedeemRate).toFixed(2)} บาท
                  </p>
                </div>
              </div>

              <Button onClick={handleSaveStoreSettings} className="w-full">
                บันทึกการตั้งค่าแต้ม
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          {/* Add New Discount */}
          <Card>
            <CardHeader>
              <CardTitle>เพิ่มระดับสมาชิกใหม่</CardTitle>
              <CardDescription>สร้างระดับสมาชิกและกำหนดส่วนลด</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discountName">ชื่อระดับสมาชิก</Label>
                  <Input
                    id="discountName"
                    placeholder="เช่น สมาชิกทอง"
                    value={newDiscount.name}
                    onChange={(e) => setNewDiscount({ ...newDiscount, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountPercent">ส่วนลด (%)</Label>
                  <Input
                    id="discountPercent"
                    type="number"
                    min="0"
                    max="100"
                    value={newDiscount.discountPercent}
                    onChange={(e) =>
                      setNewDiscount({ ...newDiscount, discountPercent: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minPurchase">ยอดขั้นต่ำ (บาท)</Label>
                  <Input
                    id="minPurchase"
                    type="number"
                    min="0"
                    value={newDiscount.minPurchase}
                    onChange={(e) =>
                      setNewDiscount({ ...newDiscount, minPurchase: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <Button onClick={handleAddDiscount} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มระดับสมาชิก
              </Button>
            </CardContent>
          </Card>

          {/* Existing Discounts */}
          <Card>
            <CardHeader>
              <CardTitle>ระดับสมาชิกปัจจุบัน</CardTitle>
              <CardDescription>จัดการระดับสมาชิกและส่วนลดที่มีอยู่</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {memberDiscounts.map((discount) => (
                  <div
                    key={discount.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    {editingDiscount?.id === discount.id ? (
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          value={editingDiscount.name}
                          onChange={(e) => setEditingDiscount({ ...editingDiscount, name: e.target.value })}
                        />
                        <Input
                          type="number"
                          value={editingDiscount.discountPercent}
                          onChange={(e) =>
                            setEditingDiscount({
                              ...editingDiscount,
                              discountPercent: Number.parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                        <Input
                          type="number"
                          value={editingDiscount.minPurchase}
                          onChange={(e) =>
                            setEditingDiscount({
                              ...editingDiscount,
                              minPurchase: Number.parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    ) : (
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{discount.name}</h3>
                          <Badge variant="secondary">{discount.discountPercent}% ส่วนลด</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">ยอดขั้นต่ำ: {discount.minPurchase} บาท</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {editingDiscount?.id === discount.id ? (
                        <>
                          <Button size="sm" onClick={handleUpdateDiscount}>
                            บันทึก
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingDiscount(null)}>
                            ยกเลิก
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => setEditingDiscount(discount)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteMemberDiscount(discount.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage-members" className="space-y-6">
          <MemberManagement />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <SalesAnalytics />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <InventoryReports products={products} />
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <CustomerAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  )
}
