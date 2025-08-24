"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Award } from "lucide-react"
import { useSettings, type Member } from "@/contexts/settings-context"
import { useAuth } from "@/contexts/auth-context"

export function MemberManagement() {
  const { members, addMember, updateMember, deleteMember } = useSettings()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [formData, setFormData] = useState({
    memberCode: "",
    name: "",
    phone: "",
  })

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm),
  )

  const generateMemberCode = () => {
    const code = "M" + Date.now().toString().slice(-6)
    setFormData({ ...formData, memberCode: code })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingMember) {
      updateMember(editingMember.id, formData)
      setEditingMember(null)
    } else {
      addMember(formData)
      setIsAddDialogOpen(false)
    }
    setFormData({ memberCode: "", name: "", phone: "" })
  }

  const handleEdit = (member: Member) => {
    setEditingMember(member)
    setFormData({
      memberCode: member.memberCode,
      name: member.name,
      phone: member.phone,
    })
  }

  const handleDelete = (id: string) => {
    if (user?.role === "admin") {
      deleteMember(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">จัดการสมาชิก</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={generateMemberCode}>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มสมาชิกใหม่
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มสมาชิกใหม่</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="memberCode">รหัสสมาชิก</Label>
                <div className="flex gap-2">
                  <Input
                    id="memberCode"
                    value={formData.memberCode}
                    onChange={(e) => setFormData({ ...formData, memberCode: e.target.value })}
                    required
                  />
                  <Button type="button" variant="outline" onClick={generateMemberCode}>
                    สร้างรหัส
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                เพิ่มสมาชิก
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="ค้นหาสมาชิก (ชื่อ, รหัส, เบอร์โทร)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัสสมาชิก</TableHead>
                <TableHead>ชื่อ-นามสกุล</TableHead>
                <TableHead>เบอร์โทร</TableHead>
                <TableHead>แต้มสะสม</TableHead>
                <TableHead>ยอดซื้อรวม</TableHead>
                <TableHead>วันที่สมัคร</TableHead>
                <TableHead>เยี่ยมชมล่าสุด</TableHead>
                <TableHead>จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <Badge variant="outline">{member.memberCode}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-yellow-500" />
                      {member.points.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>฿{member.totalSpent.toLocaleString()}</TableCell>
                  <TableCell>{new Date(member.joinDate).toLocaleDateString("th-TH")}</TableCell>
                  <TableCell>{new Date(member.lastVisit).toLocaleDateString("th-TH")}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(member)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      {user?.role === "admin" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(member.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Member Dialog */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลสมาชิก</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="editMemberCode">รหัสสมาชิก</Label>
              <Input
                id="editMemberCode"
                value={formData.memberCode}
                onChange={(e) => setFormData({ ...formData, memberCode: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="editName">ชื่อ-นามสกุล</Label>
              <Input
                id="editName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="editPhone">เบอร์โทรศัพท์</Label>
              <Input
                id="editPhone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              บันทึกการแก้ไข
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
