"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Package, Search } from "lucide-react"
import type { Product } from "@/app/page"
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/lib/productService"
import { getCategories, type Category } from "@/lib/categoryService"

interface ProductManagementProps {
  products: Product[]
  onProductsChange: (products: Product[]) => void
}

export function ProductManagement({ products, onProductsChange }: ProductManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    image: "",
  })

  const [fetchedCategories, setFetchedCategories] = useState<Category[]>([])

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))]

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await getCategories()
        if (!mounted) return
        if (Array.isArray(res)) {
          setFetchedCategories(res.map((c: any) => ({ id: String(c.id ?? c._id ?? c.id ?? ''), name: c.name ?? c.category ?? 'อื่นๆ' })))
        }
      } catch (err) {
        console.error('Failed to load categories', err)
      }
    })()
    return () => { mounted = false }
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category: "",
      stock: "",
      image: "",
    })
  }

  const handleAddProduct = () => {
    if (!formData.name || !formData.price || !formData.category) return

    ;(async () => {
      try {
        const isUuid = /^[0-9a-fA-F-]{36}$/.test(formData.category)
        const payload: any = {
          name: formData.name,
          price: Number.parseFloat(formData.price),
          stock: Number.parseInt(formData.stock) || 0,
          image: formData.image || "/placeholder.svg",
        }
        if (isUuid) payload.categoryId = formData.category
        else payload.category = formData.category
        await createProduct(payload as any)
        // refresh list from server
        const fresh = await getProducts()
        if (Array.isArray(fresh)) {
          onProductsChange(fresh.map((p: any) => ({
            id: String(p.id ?? p._id ?? ''),
            name: p.name ?? 'Unnamed',
            price: Number(p.price ?? 0),
            category: p.category ?? p.categoryId ?? p.categoryName ?? 'อื่นๆ',
            stock: Number(p.stock ?? 0),
            image: p.image ?? '/placeholder.svg',
          })))
        }
        resetForm()
        setIsAddDialogOpen(false)
      } catch (e) {
        console.error('Failed to create product', e)
        alert('เกิดข้อผิดพลาดขณะสร้างสินค้า')
      }
    })()
  }

  const handleEditProduct = () => {
    if (!editingProduct || !formData.name || !formData.price || !formData.category) return

    ;(async () => {
      try {
        const isUuid = /^[0-9a-fA-F-]{36}$/.test(formData.category)
        const payload: any = {
          name: formData.name,
          price: Number.parseFloat(formData.price),
          stock: Number.parseInt(formData.stock) || 0,
          image: formData.image || "/placeholder.svg",
        }
        if (isUuid) payload.categoryId = formData.category
        else payload.category = formData.category
        await updateProduct(editingProduct.id, payload as any)
        const fresh = await getProducts()
        if (Array.isArray(fresh)) {
          onProductsChange(fresh.map((p: any) => ({
            id: String(p.id ?? p._id ?? ''),
            name: p.name ?? 'Unnamed',
            price: Number(p.price ?? 0),
            category: p.category ?? p.categoryId ?? p.categoryName ?? 'อื่นๆ',
            stock: Number(p.stock ?? 0),
            image: p.image ?? '/placeholder.svg',
          })))
        }
        resetForm()
        setEditingProduct(null)
      } catch (e) {
        console.error('Failed to update product', e)
        alert('เกิดข้อผิดพลาดขณะอัปเดตสินค้า')
      }
    })()
  }

  const handleDeleteProduct = (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?")) return

    ;(async () => {
      try {
        await deleteProduct(id)
        const fresh = await getProducts()
        if (Array.isArray(fresh)) {
          onProductsChange(fresh.map((p: any) => ({
            id: String(p.id ?? p._id ?? ''),
            name: p.name ?? 'Unnamed',
            price: Number(p.price ?? 0),
            category: p.category ?? p.categoryId ?? p.categoryName ?? 'อื่นๆ',
            stock: Number(p.stock ?? 0),
            image: p.image ?? '/placeholder.svg',
          })))
        } else {
          // fallback: remove locally
          onProductsChange(products.filter((product) => product.id !== id))
        }
      } catch (e) {
        console.error('Failed to delete product', e)
        alert('เกิดข้อผิดพลาดขณะลบสินค้า')
      }
    })()
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    // prefer to set category to the category id if we have it in fetchedCategories
    const found = fetchedCategories.find((c) => c.name === product.category || c.id === product.category)
    const categoryValue = found ? (found.id ?? found.name) : product.category
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: categoryValue,
      stock: product.stock.toString(),
      image: product.image || "",
    })
  }

  const closeEditDialog = () => {
    setEditingProduct(null)
    resetForm()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">จัดการสินค้า</h2>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มสินค้าใหม่
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby="add-product-desc">
              <DialogHeader>
                <DialogTitle>เพิ่มสินค้าใหม่</DialogTitle>
              </DialogHeader>
              <p id="add-product-desc" className="sr-only">แบบฟอร์มสำหรับเพิ่มสินค้าใหม่</p>
              <ProductForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleAddProduct}
              onCancel={() => {
                setIsAddDialogOpen(false)
                resetForm()
              }}
              submitLabel="เพิ่มสินค้า"
              serverCategories={fetchedCategories}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="เลือกหมวดหมู่" />
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

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการสินค้า ({filteredProducts.length} รายการ)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รูปภาพ</TableHead>
                  <TableHead>ชื่อสินค้า</TableHead>
                  <TableHead>หมวดหมู่</TableHead>
                  <TableHead className="text-right">ราคา</TableHead>
                  <TableHead className="text-right">คงเหลือ</TableHead>
                  <TableHead className="text-center">สถานะ</TableHead>
                  <TableHead className="text-center">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">฿{product.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{product.stock}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                        {product.stock > 0 ? "มีสินค้า" : "หมด"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(product)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredProducts.length === 0 && <div className="text-center py-8 text-muted-foreground">ไม่พบสินค้าที่ค้นหา</div>}
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent aria-describedby="edit-product-desc">
          <DialogHeader>
            <DialogTitle>แก้ไขสินค้า</DialogTitle>
          </DialogHeader>
          <p id="edit-product-desc" className="sr-only">แบบฟอร์มสำหรับแก้ไขข้อมูลสินค้า</p>
          <ProductForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleEditProduct}
            onCancel={closeEditDialog}
            submitLabel="บันทึกการแก้ไข"
            serverCategories={fetchedCategories}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ProductFormProps {
  formData: {
    name: string
    price: string
    category: string
    stock: string
    image: string
  }
  setFormData: (data: any) => void
  onSubmit: () => void
  onCancel: () => void
  submitLabel: string
}

function ProductForm({ formData, setFormData, onSubmit, onCancel, submitLabel, serverCategories }: ProductFormProps & { serverCategories?: Category[] }) {
  const localCategories = ["เครื่องดื่ม", "อาหาร", "ขนม", "อื่นๆ"]

  const categoryOptions = (serverCategories && serverCategories.length > 0)
    ? serverCategories.map((c) => ({ value: c.id ?? c.name, label: c.name }))
    : localCategories.map((c) => ({ value: c, label: c }))

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">ชื่อสินค้า *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="กรอกชื่อสินค้า"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">ราคา (บาท) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">จำนวนคงเหลือ</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">หมวดหมู่ *</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="เลือกหมวดหมู่" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">URL รูปภาพ</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={onSubmit} className="flex-1">
          {submitLabel}
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
          ยกเลิก
        </Button>
      </div>
    </div>
  )
}
