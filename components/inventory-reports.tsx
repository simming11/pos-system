"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Package, AlertTriangle, TrendingDown, DollarSign } from "lucide-react"
import { useSettings } from "@/contexts/settings-context"
import type { Product } from "@/app/page"

interface InventoryReportsProps {
  products: Product[]
}

export function InventoryReports({ products }: InventoryReportsProps) {
  const { salesTransactions } = useSettings()
  const [stockFilter, setStockFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [dateRange, setDateRange] = useState("30")
  const [viewMode, setViewMode] = useState("daily") // daily, monthly, yearly
  const [timeFilter, setTimeFilter] = useState("all") // all, morning, afternoon, evening
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")

  const getDateRange = () => {
    const now = new Date()

    if (dateRange === "custom" && customStartDate && customEndDate) {
      return {
        start: new Date(customStartDate),
        end: new Date(customEndDate),
      }
    }

    if (viewMode === "yearly") {
      return {
        start: new Date(Number(selectedYear), 0, 1),
        end: new Date(Number(selectedYear), 11, 31, 23, 59, 59),
      }
    }

    const days = Number.parseInt(dateRange)
    return {
      start: new Date(now.getTime() - days * 24 * 60 * 60 * 1000),
      end: now,
    }
  }

  const { start: startDate, end: endDate } = getDateRange()

  const recentTransactions = useMemo(() => {
    return salesTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      const hour = transactionDate.getHours()

      if (transactionDate < startDate || transactionDate > endDate) {
        return false
      }

      if (timeFilter === "morning" && (hour < 6 || hour >= 12)) return false
      if (timeFilter === "afternoon" && (hour < 12 || hour >= 18)) return false
      if (timeFilter === "evening" && (hour < 18 || hour >= 24)) return false

      return true
    })
  }, [salesTransactions, startDate, endDate, timeFilter])

  const availableYears = useMemo(() => {
    const years = new Set<number>()
    salesTransactions.forEach((transaction) => {
      years.add(new Date(transaction.date).getFullYear())
    })
    return Array.from(years).sort((a, b) => b - a)
  }, [salesTransactions])

  const inventoryAnalytics = useMemo(() => {
    const lowStockItems = products.filter((p) => p.stock <= 5)
    const outOfStockItems = products.filter((p) => p.stock === 0)
    const totalStockValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)
    const totalItems = products.reduce((sum, p) => sum + p.stock, 0)

    const productMovement = new Map<string, { sold: number; revenue: number }>()
    recentTransactions.forEach((transaction) => {
      transaction.items.forEach((item) => {
        const current = productMovement.get(item.id) || { sold: 0, revenue: 0 }
        productMovement.set(item.id, {
          sold: current.sold + item.quantity,
          revenue: current.revenue + item.price * item.quantity,
        })
      })
    })

    const productAnalysis = products.map((product) => {
      const movement = productMovement.get(product.id) || { sold: 0, revenue: 0 }
      const turnoverRate = product.stock > 0 ? movement.sold / product.stock : 0

      return {
        ...product,
        sold: movement.sold,
        revenue: movement.revenue,
        turnoverRate,
        stockValue: product.price * product.stock,
        status: product.stock === 0 ? "out-of-stock" : product.stock <= 5 ? "low-stock" : "in-stock",
      }
    })

    const categoryAnalysis = new Map<
      string,
      {
        totalStock: number
        totalValue: number
        totalSold: number
        totalRevenue: number
      }
    >()

    productAnalysis.forEach((product) => {
      const current = categoryAnalysis.get(product.category) || {
        totalStock: 0,
        totalValue: 0,
        totalSold: 0,
        totalRevenue: 0,
      }

      categoryAnalysis.set(product.category, {
        totalStock: current.totalStock + product.stock,
        totalValue: current.totalValue + product.stockValue,
        totalSold: current.totalSold + product.sold,
        totalRevenue: current.totalRevenue + product.revenue,
      })
    })

    const categoryData = Array.from(categoryAnalysis.entries()).map(([category, data]) => ({
      category,
      ...data,
    }))

    return {
      lowStockItems,
      outOfStockItems,
      totalStockValue,
      totalItems,
      productAnalysis,
      categoryData,
    }
  }, [products, recentTransactions])

  const filteredProducts = useMemo(() => {
    return inventoryAnalytics.productAnalysis.filter((product) => {
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && product.stock <= 5) ||
        (stockFilter === "out" && product.stock === 0) ||
        (stockFilter === "in" && product.stock > 5)

      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter

      return matchesStock && matchesCategory
    })
  }, [inventoryAnalytics.productAnalysis, stockFilter, categoryFilter])

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">รายงานสินค้าคงคลัง</h2>
          <p className="text-gray-600">ติดตามสต็อก การเคลื่อนไหว และมูลค่าสินค้า</p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">รายวัน</SelectItem>
              <SelectItem value="monthly">รายเดือน</SelectItem>
              <SelectItem value="yearly">รายปี</SelectItem>
            </SelectContent>
          </Select>

          {viewMode === "yearly" ? (
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 วัน</SelectItem>
                <SelectItem value="7">7 วัน</SelectItem>
                <SelectItem value="15">15 วัน</SelectItem>
                <SelectItem value="30">30 วัน</SelectItem>
                <SelectItem value="90">90 วัน</SelectItem>
                <SelectItem value="custom">กำหนดเอง</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกเวลา</SelectItem>
              <SelectItem value="morning">เช้า (6-12)</SelectItem>
              <SelectItem value="afternoon">บ่าย (12-18)</SelectItem>
              <SelectItem value="evening">เย็น (18-24)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {dateRange === "custom" && viewMode !== "yearly" && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="start-date">วันที่เริ่มต้น:</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="end-date">วันที่สิ้นสุด:</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">มูลค่าสต็อกรวม</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{inventoryAnalytics.totalStockValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{inventoryAnalytics.totalItems.toLocaleString()} ชิ้น</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สินค้าใกล้หมด</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{inventoryAnalytics.lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">สต็อก ≤ 5 ชิ้น</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สินค้าหมด</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inventoryAnalytics.outOfStockItems.length}</div>
            <p className="text-xs text-muted-foreground">ต้องเติมสต็อก</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">หมวดหมู่สินค้า</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length - 1}</div>
            <p className="text-xs text-muted-foreground">หมวดหมู่</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">รายการสินค้า</TabsTrigger>
          <TabsTrigger value="movement">การเคลื่อนไหว</TabsTrigger>
          <TabsTrigger value="categories">หมวดหมู่</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="กรองตามสต็อก" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="in">มีสต็อก ({">"}5)</SelectItem>
                    <SelectItem value="low">ใกล้หมด (≤5)</SelectItem>
                    <SelectItem value="out">หมดสต็อก</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="กรองตามหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {categories.slice(1).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>รายการสินค้าคงคลัง ({filteredProducts.length} รายการ)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>สินค้า</TableHead>
                    <TableHead>หมวดหมู่</TableHead>
                    <TableHead className="text-right">ราคา</TableHead>
                    <TableHead className="text-right">คงเหลือ</TableHead>
                    <TableHead className="text-right">มูลค่า</TableHead>
                    <TableHead className="text-right">ขายได้</TableHead>
                    <TableHead className="text-center">สถานะ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right">฿{product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{product.stock}</TableCell>
                      <TableCell className="text-right">฿{product.stockValue.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{product.sold}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            product.status === "out-of-stock"
                              ? "destructive"
                              : product.status === "low-stock"
                                ? "secondary"
                                : "default"
                          }
                        >
                          {product.status === "out-of-stock"
                            ? "หมด"
                            : product.status === "low-stock"
                              ? "ใกล้หมด"
                              : "มีสต็อก"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>การเคลื่อนไหวสินค้า</CardTitle>
              <CardDescription>
                สินค้าที่ขายได้มากที่สุดและอัตราการหมุนเวียน
                {viewMode === "yearly" ? ` ปี ${selectedYear}` : ` ${dateRange} วันที่แล้ว`}
                {timeFilter !== "all" &&
                  ` ช่วงเวลา${timeFilter === "morning" ? "เช้า" : timeFilter === "afternoon" ? "บ่าย" : "เย็น"}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>สินค้า</TableHead>
                    <TableHead className="text-right">ขายได้</TableHead>
                    <TableHead className="text-right">รายได้</TableHead>
                    <TableHead className="text-right">คงเหลือ</TableHead>
                    <TableHead className="text-right">อัตราหมุนเวียน</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryAnalytics.productAnalysis
                    .sort((a, b) => b.sold - a.sold)
                    .slice(0, 10)
                    .map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-right">{product.sold}</TableCell>
                        <TableCell className="text-right">฿{product.revenue.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{product.stock}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={product.turnoverRate > 1 ? "default" : "secondary"}>
                            {product.turnoverRate.toFixed(2)}x
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>วิเคราะห์ตามหมวดหมู่</CardTitle>
              <CardDescription>มูลค่าสต็อกและยอดขายแยกตามหมวดหมู่</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={inventoryAnalytics.categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "totalValue" ? `฿${Number(value).toLocaleString()}` : Number(value).toLocaleString(),
                      name === "totalValue" ? "มูลค่าสต็อก" : "จำนวนสต็อก",
                    ]}
                  />
                  <Bar dataKey="totalValue" fill="#10b981" name="มูลค่าสต็อก" />
                  <Bar dataKey="totalStock" fill="#3b82f6" name="จำนวนสต็อก" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>สรุปตามหมวดหมู่</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>หมวดหมู่</TableHead>
                    <TableHead className="text-right">จำนวนสต็อก</TableHead>
                    <TableHead className="text-right">มูลค่าสต็อก</TableHead>
                    <TableHead className="text-right">ขายได้</TableHead>
                    <TableHead className="text-right">รายได้</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryAnalytics.categoryData.map((category) => (
                    <TableRow key={category.category}>
                      <TableCell className="font-medium">{category.category}</TableCell>
                      <TableCell className="text-right">{category.totalStock}</TableCell>
                      <TableCell className="text-right">฿{category.totalValue.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{category.totalSold}</TableCell>
                      <TableCell className="text-right">฿{category.totalRevenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
