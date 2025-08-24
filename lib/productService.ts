// Product service for interacting with the product API
import { get, post, put, del } from './api';

export type Product = {
  id?: string;
  name: string;
  price: number;
  categoryId: string;
  image?: string;
  stock: number;
  branch_id?: string;
};

const PRODUCT_API = 'product';

/**
 * Get all products
 * @returns Promise with all products
 */
export const getProducts = () => {
  return get(PRODUCT_API);
};

/**
 * Get product by ID
 * @param id - Product ID
 * @returns Promise with the product data
 */
export const getProductById = (id: string) => {
  return get(`${PRODUCT_API}/${id}`);
};

/**
 * Create a new product
 * @param product - Product data
 * @returns Promise with the created product
 */
export const createProduct = (product: Product) => {
  return post(PRODUCT_API, {
    ...product,
    created_at: new Date(),
    updated_at: new Date(),
  });
};

/**
 * Update an existing product
 * @param id - Product ID
 * @param product - Updated product data
 * @returns Promise with the updated product
 */
export const updateProduct = (id: string, product: Partial<Product>) => {
  return put(`${PRODUCT_API}/${id}`, {
    ...product,
    updated_at: new Date(),
  });
};

/**
 * Delete a product
 * @param id - Product ID
 * @returns Promise with the delete result
 */
export const deleteProduct = (id: string) => {
  return del(`${PRODUCT_API}/${id}`);
};
