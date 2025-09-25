import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, tap, retry, delay } from 'rxjs/operators';

import { 
  Product, 
  ProductDto, 
  CreateProductRequest, 
  UpdateProductRequest, 
  ApiResponse,
  ProductFilters 
} from '../../../shared/models';
import { environment } from '../../../../environments/environment';
import { ProductStore } from '../../../core/services/product.store';

/**
 * Servicio API para productos con gestión de estado integrada
 * Implementa patrón Repository con transformación de DTOs
 */
@Injectable({
  providedIn: 'root'
})
export class ProductApiService {
  private readonly http = inject(HttpClient);
  private readonly productStore = inject(ProductStore);
  private readonly apiUrl = `${environment.apiUrl}/products`;

  /**
   * Obtiene todos los productos y actualiza el store
   */
  loadProducts(filters?: ProductFilters): Observable<Product[]> {
    this.productStore.setLoading(true);
    
    return this.http.get<ProductDto[]>(this.apiUrl).pipe(
      retry(2),
      map(dtos => dtos.map(this.transformDtoToProduct)),
      tap(products => {
        this.productStore.setProducts(products);
        if (filters) {
          this.productStore.setFilters(filters);
        }
      }),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Crea un nuevo producto
   */
  createProduct(request: CreateProductRequest): Observable<Product> {
    this.productStore.setLoading(true);
    
    return this.http.post<ApiResponse<ProductDto>>(this.apiUrl, request).pipe(
      map(response => this.transformDtoToProduct(response.data)),
      tap(product => {
        this.productStore.addProduct(product);
        this.productStore.setLoading(false);
      }),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Actualiza un producto existente
   */
  updateProduct(id: number, request: UpdateProductRequest): Observable<Product> {
    this.productStore.setLoading(true);
    
    return this.http.put<ApiResponse<ProductDto>>(`${this.apiUrl}/${id}`, request).pipe(
      map(response => this.transformDtoToProduct(response.data)),
      tap(product => {
        this.productStore.updateProduct(product);
        this.productStore.setLoading(false);
      }),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Elimina un producto
   */
  deleteProduct(id: number): Observable<void> {
    this.productStore.setLoading(true);
    
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.productStore.removeProduct(id);
        this.productStore.setLoading(false);
      }),
      map(() => void 0),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Obtiene productos con stock bajo
   */
  getLowStockProducts(): Observable<Product[]> {
    return this.http.get<ProductDto[]>(`${this.apiUrl}/low-inventory`).pipe(
      map(dtos => dtos.map(this.transformDtoToProduct)),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Obtiene un producto por ID (con optimistic loading del store)
   */
  getProductById(id: number): Observable<Product | null> {
    // Primero intenta desde el store
    const cachedProduct = this.productStore.getProductById(id);
    if (cachedProduct) {
      return of(cachedProduct);
    }

    // Si no está en cache, consulta la API
    return this.http.get<ProductDto>(`${this.apiUrl}/${id}`).pipe(
      map(dto => this.transformDtoToProduct(dto)),
      catchError(error => {
        if (error.status === 404) {
          return of(null);
        }
        return this.handleError(error);
      })
    );
  }

  // 🔄 Transformación de datos
  private transformDtoToProduct(dto: ProductDto): Product {
    return {
      id: dto.productId,
      name: dto.productName,
      description: dto.description,
      price: dto.price,
      quantity: dto.quantity,
      categoryId: dto.categoryId,
      createdAt: new Date(), // El backend debería proveer esto
      updatedAt: new Date()  // El backend debería proveer esto
    };
  }

  private transformProductToRequest(product: Partial<Product>): CreateProductRequest {
    return {
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '0',
      quantity: product.quantity || 0,
      category: product.categoryId || 0
    };
  }

  // 🛠 Manejo de errores
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Error de conexión';
          break;
        case 400:
          errorMessage = 'Datos inválidos';
          break;
        case 401:
          errorMessage = 'No autorizado';
          break;
        case 403:
          errorMessage = 'Sin permisos';
          break;
        case 404:
          errorMessage = 'Producto no encontrado';
          break;
        case 409:
          errorMessage = 'El producto ya existe';
          break;
        case 500:
          errorMessage = 'Error del servidor';
          break;
      }
    }
    
    this.productStore.setError(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}