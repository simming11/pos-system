"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Users, TrendingUp, Clock, Award, Star, UserCheck, Calendar, DollarSign } from "lucide-react"
import { useSettings } from "@/contexts/settings-context"

export function CustomerAnalytics() {
  const { salesTransactions, members } = useSettings()
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

  const availableYears = useMemo(() => {
    const years = new Set<number>()
    salesTransactions.forEach((transaction) => {
      years.add(new Date(transaction.date).getFullYear())
    })
    return Array.from(years).sort((a, b) => b - a)
  }, [salesTransactions])

  const filteredTransactions = useMemo(() => {
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

  const customerAnalytics = useMemo(() => {
    const memberTransactions = filteredTransactions.filter((t) => t.memberId)
    const nonMemberTransactions = filteredTransactions.filter((t) => !t.memberId)

    const memberRevenue = memberTransactions.reduce((sum, t) => sum + t.total, 0)
    const nonMemberRevenue = nonMemberTransactions.reduce((sum, t) => sum + t.total, 0)
    const totalRevenue = memberRevenue + nonMemberRevenue

    const customerFrequency = new Map<
      string,
      {
        transactions: number
        totalSpent: number
        lastVisit: string
        member?: any
      }
    >()

    filteredTransactions.forEach((transaction) => {
      if (transaction.memberId) {
        const member = members.find((m) => m.id === transaction.memberId)
        const current = customerFrequency.get(transaction.memberId) || {
          transactions: 0,
          totalSpent: 0,
          lastVisit: transaction.date,
          member,
        }

        customerFrequency.set(transaction.memberId, {
          transactions: current.transactions + 1,
          totalSpent: current.totalSpent + transaction.total,
          lastVisit: transaction.date > current.lastVisit ? transaction.date : current.lastVisit,
          member,
        })
      }
    })

    const topCustomers = Array.from(customerFrequency.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)

    const frequentCustomers = Array.from(customerFrequency.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.transactions - a.transactions)
      .slice(0, 10)

    const hourlyData = new Map<number, number>()
    filteredTransactions.forEach((transaction) => {
      const hour = new Date(transaction.date).getHours()
      hourlyData.set(hour, (hourlyData.get(hour) || 0) + 1)
    })

    const peakHours = Array.from(hourlyData.entries())
      .map(([hour, count]) => ({
        hour: `${hour.toString().padStart(2, "0")}:00`,
        count,
        hourNum: hour,
      }))
      .sort((a, b) => a.hourNum - b.hourNum)

    const dailyCustomers = new Map<string, Set<string>>()
    filteredTransactions.forEach((transaction) => {
      const date = new Date(transaction.date).toLocaleDateString("th-TH")
      if (!dailyCustomers.has(date)) {
        dailyCustomers.set(date, new Set())
      }
      if (transaction.memberId) {
        dailyCustomers.get(date)?.add(transaction.memberId)
      }
    })

    const customerTrends = Array.from(dailyCustomers.entries())
      .map(([date, customers]) => ({
        date,
        uniqueCustomers: customers.size,
        dateObj: new Date(date),
      }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())

    const avgCustomerValue = customerFrequency.size > 0 ? memberRevenue / customerFrequency.size : 0

    const segments = {
      vip: Array.from(customerFrequency.values()).filter((c) => c.totalSpent > 1000).length,
      regular: Array.from(customerFrequency.values()).filter((c) => c.totalSpent >= 500 && c.totalSpent <= 1000).length,
      occasional: Array.from(customerFrequency.values()).filter((c) => c.totalSpent < 500).length,
    }

    const totalPointsEarned = filteredTransactions.reduce((sum, t) => sum + (t.pointsEarned || 0), 0)
    const totalPointsUsed = filteredTransactions.reduce((sum, t) => sum + (t.pointsUsed || 0), 0)

    return {
      memberTransactions: memberTransactions.length,
      nonMemberTransactions: nonMemberTransactions.length,
      memberRevenue,
      nonMemberRevenue,
      totalRevenue,
      memberPercentage: totalRevenue > 0 ? (memberRevenue / totalRevenue) * 100 : 0,
      topCustomers,
      frequentCustomers,
      peakHours,
      customerTrends,
      avgCustomerValue,
      segments,
      totalPointsEarned,
      totalPointsUsed,
      uniqueCustomers: customerFrequency.size,
    }
  }, [filteredTransactions, members])

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">วิเคราะห์ลูกค้า</h2>
          <p className="text-gray-600">พฤติกรรมลูกค้า การใช้แต้ม และแนวโน้มการซื้อ</p>
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
            <CardTitle className="text-sm font-medium">ลูกค้าสมาชิก</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerAnalytics.uniqueCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {customerAnalytics.memberTransactions} รายการ ({customerAnalytics.memberPercentage.toFixed(1)}% ของยอดขาย)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">มูลค่าเฉลี่ยต่อลูกค้า</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{customerAnalytics.avgCustomerValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Customer Lifetime Value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">แต้มที่ใช้</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerAnalytics.totalPointsUsed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              จาก {customerAnalytics.totalPointsEarned.toLocaleString()} แต้มที่ได้รับ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ลูกค้า VIP</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerAnalytics.segments.vip}</div>
            <p className="text-xs text-muted-foreground">ซื้อมากกว่า ฿1,000</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="customers">ลูกค้าชั้นนำ</TabsTrigger>
          <TabsTrigger value="behavior">พฤติกรรม</TabsTrigger>
          <TabsTrigger value="segments">กลุ่มลูกค้า</TabsTrigger>
          <TabsTrigger value="trends">แนวโน้ม</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  ลูกค้าใช้จ่ายสูงสุด
                </CardTitle>
                <CardDescription>ลูกค้าที่ใช้จ่ายมากที่สุดในช่วงเวลาที่เลือก</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ลูกค้า</TableHead>
                      <TableHead className="text-right">ยอดซื้อ</TableHead>
                      <TableHead className="text-right">ครั้ง</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerAnalytics.topCustomers.map((customer, index) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{index + 1}</Badge>
                            <div>
                              <p className="font-medium">{customer.member?.name || "ไม่ระบุชื่อ"}</p>
                              <p className="text-sm text-muted-foreground">{customer.member?.memberCode}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">฿{customer.totalSpent.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{customer.transactions}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  ลูกค้าประจำ
                </CardTitle>
                <CardDescription>ลูกค้าที่มาใช้บริการบ่อยที่สุด</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ลูกค้า</TableHead>
                      <TableHead className="text-right">ครั้ง</TableHead>
                      <TableHead className="text-right">ยอดซื้อ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerAnalytics.frequentCustomers.map((customer, index) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{index + 1}</Badge>
                            <div>
                              <p className="font-medium">{customer.member?.name || "ไม่ระบุชื่อ"}</p>
                              <p className="text-sm text-muted-foreground">{customer.member?.memberCode}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{customer.transactions}</TableCell>
                        <TableCell className="text-right">฿{customer.totalSpent.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  ช่วงเวลาขายดี
                </CardTitle>
                <CardDescription>จำนวนลูกค้าแยกตามช่วงเวลา</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={customerAnalytics.peakHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} รายการ`, "จำนวนการขาย"]} />
                    <Bar dataKey="count" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>สมาชิก vs ไม่ใช่สมาชิก</CardTitle>
                <CardDescription>เปรียบเทียบยอดขายระหว่างสมาชิกและไม่ใช่สมาชิก</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={
                        [
                          {
                            name: "สมาชิก",
                            value: customerAnalytics.memberRevenue || 0,
                            count: customerAnalytics.memberTransactions || 0,
                          },
                          {
                            name: "ไม่ใช่สมาชิก",
                            value: customerAnalytics.nonMemberRevenue || 0,
                            count: customerAnalytics.nonMemberTransactions || 0,
                          },
                        ]
                      }
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, count }) =>
                        `${name}: ฿${(Number(value) || 0).toLocaleString()} (${Number(count) || 0} รายการ)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#6b7280" />
                    </Pie>
                    <Tooltip formatter={(value) => [`฿${Number(value).toLocaleString()}`, "ยอดขาย"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>กลุ่มลูกค้า</CardTitle>
                <CardDescription>แบ่งกลุ่มลูกค้าตามยอดซื้อ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">ลูกค้า VIP</p>
                        <p className="text-sm text-muted-foreground">ซื้อมากกว่า ฿1,000</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{customerAnalytics.segments.vip} คน</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">ลูกค้าปกติ</p>
                        <p className="text-sm text-muted-foreground">ซื้อ ฿500-1,000</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{customerAnalytics.segments.regular} คน</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">ลูกค้าเป็นครั้งคราว</p>
                        <p className="text-sm text-muted-foreground">ซื้อน้อยกว่า ฿500</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{customerAnalytics.segments.occasional} คน</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  การใช้แต้มสะสม
                </CardTitle>
                <CardDescription>สถิติการใช้และสะสมแต้ม</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">แต้มที่ได้รับ</p>
                      <p className="text-sm text-green-600">
                        ในช่วง {viewMode === "yearly" ? `ปี ${selectedYear}` : `${dateRange} วันที่แล้ว`}
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-green-700">
                      {customerAnalytics.totalPointsEarned.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-800">แต้มที่ใช้</p>
                      <p className="text-sm text-blue-600">อัตราการใช้แต้ม</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-700">
                        {customerAnalytics.totalPointsUsed.toLocaleString()}
                      </div>
                      <div className="text-sm text-blue-600">
                        {customerAnalytics.totalPointsEarned > 0
                          ? ((customerAnalytics.totalPointsUsed / customerAnalytics.totalPointsEarned) * 100).toFixed(1)
                          : 0}
                        %
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                แนวโน้มลูกค้าประจำวัน
              </CardTitle>
              <CardDescription>จำนวนลูกค้าสมาชิกที่มาใช้บริการแต่ละวัน</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={customerAnalytics.customerTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} คน`, "ลูกค้าสมาชิก"]} />
                  <Line type="monotone" dataKey="uniqueCustomers" stroke="#6366f1" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
