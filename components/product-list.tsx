'use client';

import { useEffect, useState } from 'react';
import { Product, getProducts } from '@/lib/productService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="flex justify-center p-4">Loading products...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.length === 0 ? (
        <div className="col-span-full text-center p-4">No products found</div>
      ) : (
        products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle>{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-lg font-bold">${product.price.toFixed(2)}</div>
              <div className="text-sm text-gray-500">Stock: {product.stock}</div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
