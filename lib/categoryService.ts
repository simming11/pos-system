// Category service for interacting with the category API
import { get, post, put, del } from './api';

export type Category = {
  id?: string;
  name: string;
  description?: string;
};

const CATEGORY_API = 'category';

/**
 * Get all categories
 * @returns Promise with all categories
 */
export const getCategories = () => {
  return get(CATEGORY_API);
};

/**
 * Get category by ID
 * @param id - Category ID
 * @returns Promise with the category data
 */
export const getCategoryById = (id: string) => {
  return get(`${CATEGORY_API}/${id}`);
};

/**
 * Create a new category
 * @param category - Category data
 * @returns Promise with the created category
 */
export const createCategory = (category: Category) => {
  return post(CATEGORY_API, {
    ...category,
    created_at: new Date(),
    updated_at: new Date(),
  });
};

/**
 * Update an existing category
 * @param id - Category ID
 * @param category - Updated category data
 * @returns Promise with the updated category
 */
export const updateCategory = (id: string, category: Partial<Category>) => {
  return put(`${CATEGORY_API}/${id}`, {
    ...category,
    updated_at: new Date(),
  });
};

/**
 * Delete a category
 * @param id - Category ID
 * @returns Promise with the delete result
 */
export const deleteCategory = (id: string) => {
  return del(`${CATEGORY_API}/${id}`);
};
