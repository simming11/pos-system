"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Filter, Clock, Calendar } from "lucide-react"
import { useSettings } from "@/contexts/settings-context"

export function SalesAnalytics() {
  const { salesTransactions, members } = useSettings()
  const [dateFilter, setDateFilter] = useState("7")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [timeFilter, setTimeFilter] = useState("all") // all, morning, afternoon, evening
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString())
  const [viewMode, setViewMode] = useState("daily") // daily, monthly, yearly

  // Calculate date range
  const getDateRange = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    if (dateFilter === "custom") {
      return {
        start: customStartDate ? new Date(customStartDate) : new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: customEndDate ? new Date(customEndDate) : today,
      }
    }

    if (dateFilter === "yearly") {
      const year = Number.parseInt(yearFilter)
      return {
        start: new Date(year, 0, 1),
        end: new Date(year, 11, 31, 23, 59, 59),
      }
    }

    const days = Number.parseInt(dateFilter)
    return {
      start: new Date(today.getTime() - days * 24 * 60 * 60 * 1000),
      end: today,
    }
  }

  const { start: startDate, end: endDate } = getDateRange()

  const filteredTransactions = useMemo(() => {
    return salesTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      const hour = transactionDate.getHours()

      if (transactionDate < startDate || transactionDate > endDate) {
        return false
      }

      if (timeFilter !== "all") {
        if (timeFilter === "morning" && (hour < 6 || hour >= 12)) return false
        if (timeFilter === "afternoon" && (hour < 12 || hour >= 18)) return false
        if (timeFilter === "evening" && (hour < 18 || hour >= 24)) return false
      }

      return true
    })
  }, [salesTransactions, startDate, endDate, timeFilter])

  const analytics = useMemo(() => {
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0)
    const totalTransactions = filteredTransactions.length
    const totalItems = filteredTransactions.reduce(
      (sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    )
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    const salesData = new Map<string, number>()
    filteredTransactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      let key = ""

      if (viewMode === "daily") {
        key = date.toLocaleDateString("th-TH")
      } else if (viewMode === "monthly") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      } else if (viewMode === "yearly") {
        key = date.getFullYear().toString()
      }

      salesData.set(key, (salesData.get(key) || 0) + transaction.total)
    })

    const salesChartData = Array.from(salesData.entries())
      .map(([period, revenue]) => ({
        period,
        revenue,
      }))
      .sort((a, b) => a.period.localeCompare(b.period))

    const hourlyData = new Map<number, { transactions: number; revenue: number }>()
    filteredTransactions.forEach((transaction) => {
      const hour = new Date(transaction.date).getHours()
      const current = hourlyData.get(hour) || { transactions: 0, revenue: 0 }
      hourlyData.set(hour, {
        transactions: current.transactions + 1,
        revenue: current.revenue + transaction.total,
      })
    })

    const peakHoursData = Array.from(hourlyData.entries())
      .map(([hour, data]) => ({
        hour: `${hour}:00`,
        transactions: data.transactions,
        revenue: data.revenue,
      }))
      .sort((a, b) => Number.parseInt(a.hour) - Number.parseInt(b.hour))

    const productSales = new Map<string, { quantity: number; revenue: number }>()
    filteredTransactions.forEach((transaction) => {
      transaction.items.forEach((item) => {
        const current = productSales.get(item.name) || { quantity: 0, revenue: 0 }
        productSales.set(item.name, {
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + item.price * item.quantity,
        })
      })
    })

    const topProducts = Array.from(productSales.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)

    const bottomProducts = Array.from(productSales.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => a.quantity - b.quantity)

    const paymentMethods = new Map<string, number>()
    filteredTransactions.forEach((transaction) => {
      const method =
        transaction.paymentMethod === "cash" ? "เงินสด" : transaction.paymentMethod === "card" ? "บัตร" : "Mobile Banking"
      paymentMethods.set(method, (paymentMethods.get(method) || 0) + 1)
    })

    const paymentData = Array.from(paymentMethods.entries()).map(([method, count]) => ({
      method,
      count,
      percentage: ((count / totalTransactions) * 100).toFixed(1),
    }))

    const memberTransactions = filteredTransactions.filter((t) => t.memberId).length
    const memberRevenue = filteredTransactions.filter((t) => t.memberId).reduce((sum, t) => sum + t.total, 0)

    return {
      totalRevenue,
      totalTransactions,
      totalItems,
      averageOrderValue,
      salesChartData,
      peakHoursData,
      topProducts,
      bottomProducts,
      paymentData,
      memberTransactions,
      memberRevenue,
    }
  }, [filteredTransactions, viewMode])

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]

  const availableYears = useMemo(() => {
    const years = new Set<number>()
    salesTransactions.forEach((transaction) => {
      years.add(new Date(transaction.date).getFullYear())
    })
    return Array.from(years).sort((a, b) => b - a)
  }, [salesTransactions])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">รายงานการขาย</h2>
          <p className="text-gray-600">วิเคราะห์ยอดขายและประสิทธิภาพธุรกิจ</p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 วัน</SelectItem>
                <SelectItem value="7">7 วัน</SelectItem>
                <SelectItem value="15">15 วัน</SelectItem>
                <SelectItem value="30">30 วัน</SelectItem>
                <SelectItem value="yearly">รายปี</SelectItem>
                <SelectItem value="custom">กำหนดเอง</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dateFilter === "yearly" && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <Select value={yearFilter} onValueChange={setYearFilter}>
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
            </div>
          )}

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งวัน</SelectItem>
                <SelectItem value="morning">เช้า (6-12)</SelectItem>
                <SelectItem value="afternoon">บ่าย (12-18)</SelectItem>
                <SelectItem value="evening">เย็น (18-24)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
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
          </div>

          {dateFilter === "custom" && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-36"
              />
              <span>ถึง</span>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-36"
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ยอดขายรวม</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{analytics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ช่วง{" "}
              {dateFilter === "yearly" ? `ปี ${yearFilter}` : dateFilter === "custom" ? "ที่เลือก" : `${dateFilter} วันที่แล้ว`}
              {timeFilter !== "all" &&
                ` (${timeFilter === "morning" ? "เช้า" : timeFilter === "afternoon" ? "บ่าย" : "เย็น"})`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">จำนวนการขาย</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">รายการ ({analytics.totalItems} ชิ้น)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ยอดเฉลี่ยต่อรายการ</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{analytics.averageOrderValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">ต่อรายการขาย</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ยอดขายสมาชิก</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{analytics.memberRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.memberTransactions} รายการ (
              {analytics.totalTransactions > 0
                ? ((analytics.memberTransactions / analytics.totalTransactions) * 100).toFixed(1)
                : 0}
              %)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ยอดขาย{viewMode === "daily" ? "รายวัน" : viewMode === "monthly" ? "รายเดือน" : "รายปี"}</CardTitle>
            <CardDescription>แนวโน้มยอดขายในช่วงเวลาที่เลือก</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.salesChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => [`฿${Number(value).toLocaleString()}`, "ยอดขาย"]} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ช่วงเวลาขายดี</CardTitle>
            <CardDescription>การวิเคราะห์ยอดขายตามช่วงเวลา</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === "transactions" ? `${value} รายการ` : `฿${Number(value).toLocaleString()}`,
                    name === "transactions" ? "จำนวนการขาย" : "ยอดขาย",
                  ]}
                />
                <Bar dataKey="transactions" fill="#3b82f6" />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>วิธีการชำระเงิน</CardTitle>
          <CardDescription>สัดส่วนการชำระเงินแต่ละประเภท</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.paymentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ method, percentage }) => `${method} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.paymentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              สินค้าขายดี
            </CardTitle>
            <CardDescription>สินค้าที่ขายได้มากที่สุด</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>สินค้า</TableHead>
                  <TableHead>จำนวน</TableHead>
                  <TableHead>รายได้</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topProducts.slice(0, 5).map((product, index) => (
                  <TableRow key={product.name}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{index + 1}</Badge>
                        {product.name}
                      </div>
                    </TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>฿{product.revenue.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              สินค้าขายช้า
            </CardTitle>
            <CardDescription>สินค้าที่ขายได้น้อยที่สุด</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>สินค้า</TableHead>
                  <TableHead>จำนวน</TableHead>
                  <TableHead>รายได้</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.bottomProducts.slice(0, 5).map((product, index) => (
                  <TableRow key={product.name}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        {product.name}
                      </div>
                    </TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>฿{product.revenue.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
