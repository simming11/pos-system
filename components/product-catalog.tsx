"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus } from "lucide-react"
import type { Product } from "@/app/page"

interface ProductCatalogProps {
  products: Product[]
  onAddToCart: (product: Product) => void
}

export function ProductCatalog({ products, onAddToCart }: ProductCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))]

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search and Filter */}
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
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === "all" ? "ทั้งหมด" : category}
                </Button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="aspect-square relative overflow-hidden rounded-md bg-muted">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm leading-tight">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">฿{product.price}</span>
                        <Badge variant="secondary" className="text-xs">
                          {product.stock} ชิ้น
                        </Badge>
                      </div>
                      <Button
                        onClick={() => onAddToCart(product)}
                        className="w-full"
                        size="sm"
                        disabled={product.stock === 0}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        เพิ่ม
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && <div className="text-center py-8 text-muted-foreground">ไม่พบสินค้าที่ค้นหา</div>}
        </div>
      </CardContent>
    </Card>
  )
}
