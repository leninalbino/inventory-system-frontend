import { Injectable, computed, signal } from '@angular/core';
import { Product, ProductFilters, ProductState } from '../../shared/models';
import { APP_CONSTANTS } from '../constants/app.constants';

/**
 * Store centralizado para productos usando Angular Signals
 * Implementa patrón de gestión de estado reactivo y type-safe
 */
@Injectable({
  providedIn: 'root'
})
export class ProductStore {
  // 📊 Estado privado (writable signals)
  private readonly _state = signal<ProductState>({
    products: [],
    loading: false,
    error: null,
    filters: {}
  });

  // 📖 Selectores públicos (readonly computed)
  readonly products = computed(() => this._state().products);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);
  readonly filters = computed(() => this._state().filters);

  // 📈 Selectores derivados
  readonly filteredProducts = computed(() => {
    const products = this.products();
    const filters = this.filters();
    
    return products.filter(product => {
      if (filters.name && !product.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      if (filters.categoryId && product.categoryId !== filters.categoryId) {
        return false;
      }
      if (filters.minPrice && product.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && product.price > filters.maxPrice) {
        return false;
      }
      if (filters.lowStock && product.quantity >= APP_CONSTANTS.UI.LOW_STOCK_THRESHOLD) {
        return false;
      }
      return true;
    });
  });

  readonly lowStockProducts = computed(() => 
    this.products().filter(p => p.quantity < APP_CONSTANTS.UI.LOW_STOCK_THRESHOLD)
  );

  readonly totalProducts = computed(() => this.products().length);
  readonly totalValue = computed(() => 
    this.products().reduce((sum, p) => sum + (p.price * p.quantity), 0)
  );

  // 🔧 Actions (métodos para mutar el estado)
  
  setLoading(loading: boolean): void {
    this._state.update(state => ({
      ...state,
      loading,
      error: loading ? null : state.error // Clear error when starting new operation
    }));
  }

  setError(error: string | null): void {
    this._state.update(state => ({
      ...state,
      error,
      loading: false
    }));
  }

  setProducts(products: Product[]): void {
    this._state.update(state => ({
      ...state,
      products,
      loading: false,
      error: null
    }));
  }

  addProduct(product: Product): void {
    this._state.update(state => ({
      ...state,
      products: [...state.products, product]
    }));
  }

  updateProduct(updatedProduct: Product): void {
    this._state.update(state => ({
      ...state,
      products: state.products.map(p => 
        p.id === updatedProduct.id ? updatedProduct : p
      )
    }));
  }

  removeProduct(productId: number): void {
    this._state.update(state => ({
      ...state,
      products: state.products.filter(p => p.id !== productId)
    }));
  }

  setFilters(filters: ProductFilters): void {
    this._state.update(state => ({
      ...state,
      filters: { ...state.filters, ...filters }
    }));
  }

  clearFilters(): void {
    this._state.update(state => ({
      ...state,
      filters: {}
    }));
  }

  reset(): void {
    this._state.set({
      products: [],
      loading: false,
      error: null,
      filters: {}
    });
  }

  // 🔍 Utility methods
  getProductById(id: number): Product | undefined {
    return this.products().find(p => p.id === id);
  }

  hasProducts(): boolean {
    return this.totalProducts() > 0;
  }

  isProductLowStock(product: Product): boolean {
    return product.quantity < APP_CONSTANTS.UI.LOW_STOCK_THRESHOLD;
  }
}