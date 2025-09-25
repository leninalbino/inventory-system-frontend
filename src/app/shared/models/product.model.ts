/**
 * Modelos de dominio para productos
 */

export interface Product {
  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly quantity: number;
  readonly categoryId: number;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: string; // Backend espera string
  quantity: number;
  category: number; // Backend espera "category" no "categoryId"
}

export interface UpdateProductRequest extends CreateProductRequest {
  readonly id: number;
}

export interface ProductFilters {
  name?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  lowStock?: boolean;
}

export interface Category {
  readonly id: number;
  readonly name: string;
  readonly description?: string;
}

// Estado de carga para UI
export interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
}

// DTOs para API responses (backend format)
export interface ProductDto {
  productId: number;
  productName: string;
  description: string;
  price: number;
  quantity: number;
  categoryId: number;
}

// Utility types
export type ProductFormData = Omit<CreateProductRequest, 'category'> & {
  categoryId: number;
};

export type ProductTableItem = Product & {
  categoryName?: string;
  isLowStock?: boolean;
};