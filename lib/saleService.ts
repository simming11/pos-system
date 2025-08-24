// Sale service for interacting with the sale API
import { get, post, put } from './api';

export type SaleItem = {
  id?: string;
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
  saleId?: string;
};

export type Sale = {
  id?: string;
  date: Date;
  subtotal: number;
  discount: number;
  tax: number;
  tax_rate?: number;
  total: number;
  paymentMethod: string;
  memberId?: string;
  pointsEarned?: number;
  pointsUsed?: number;
  branch_id?: string;
  locale?: string;
  currency?: string;
  saleItems: SaleItem[];
};

const SALE_API = 'sale';

/**
 * Get all sales
 * @returns Promise with all sales
 */
export const getSales = () => {
  return get(SALE_API);
};

/**
 * Get sale by ID
 * @param id - Sale ID
 * @returns Promise with the sale data
 */
export const getSaleById = (id: string) => {
  return get(`${SALE_API}/${id}`);
};

/**
 * Get sales by date range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Promise with the sales data
 */
export const getSalesByDateRange = (startDate: Date, endDate: Date) => {
  return get(`${SALE_API}/range?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
};

/**
 * Create a new sale
 * @param sale - Sale data
 * @returns Promise with the created sale
 */
export const createSale = (sale: Sale) => {
  return post(SALE_API, {
    ...sale,
    created_at: new Date(),
    updated_at: new Date(),
  });
};

/**
 * Update an existing sale
 * @param id - Sale ID
 * @param sale - Updated sale data
 * @returns Promise with the updated sale
 */
export const updateSale = (id: string, sale: Partial<Sale>) => {
  return put(`${SALE_API}/${id}`, {
    ...sale,
    updated_at: new Date(),
  });
};
