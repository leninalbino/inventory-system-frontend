import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { MessageService, ConfirmationService } from 'primeng/api';

import { Product, CreateProductRequest, UpdateProductRequest, SelectOption } from '../../../../shared/models';
import { ProductStore } from '../../../../core/services/product.store';
import { AuthStore } from '../../../../core/services/auth.store';
import { ProductApiService } from '../../services/product-api.service';
import { ProductTableComponent } from '../../../../shared/components/product-table/product-table.component';
import { ProductFormComponent } from '../../../../shared/components/product-form/product-form.component';
import { APP_CONSTANTS } from '../../../../core/constants/app.constants';

/**
 * Smart Component para la página de productos
 * Responsabilidades: Gestión de estado, lógica de negocio, coordinación
 */
@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    CommonModule,
    ProductTableComponent,
    ProductFormComponent,
    ToastModule,
    ToolbarModule,
    ButtonModule,
    DialogModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="layout-content">
      <!-- Header con acciones -->
      <div class="card mb-4">
        <p-toolbar>
          <div class="p-toolbar-group-start">
            <h2 class="text-2xl font-semibold m-0">Gestión de Productos</h2>
            <span class="text-500 ml-2" *ngIf="productStore.totalProducts() > 0">
              ({{ productStore.totalProducts() }} productos)
            </span>
          </div>

          <div class="p-toolbar-group-end">
            <div class="flex gap-2">
              <!-- Reportes -->
              <button
                class="toolbar-btn report-btn"
                [disabled]="productStore.lowStockProducts().length === 0"
                (click)="downloadLowStockReport()"
                pTooltip="Descargar PDF de productos con stock bajo">
                <i class="pi pi-file-pdf"></i>
                <span>Reporte Stock Bajo</span>
              </button>

              <!-- Refrescar -->
              <button
                class="toolbar-btn refresh-btn"
                [class.loading]="productStore.loading()"
                (click)="refreshProducts()"
                pTooltip="Actualizar lista">
                <i [class]="productStore.loading() ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"></i>
                <span class="btn-text-desktop">Actualizar</span>
              </button>

              <!-- Crear producto -->
              <button
                class="toolbar-btn create-btn"
                [disabled]="!canCreateProduct()"
                (click)="openCreateDialog()"
                pTooltip="Crear nuevo producto">
                <i class="pi pi-plus"></i>
                <span>Nuevo Producto</span>
              </button>
            </div>
          </div>
        </p-toolbar>
      </div>

      <!-- Estadísticas rápidas -->
      <div class="grid mb-4" *ngIf="showStats()">
        <div class="col-12 md:col-3">
          <div class="card text-center">
            <div class="text-900 font-medium text-xl">{{ productStore.totalProducts() }}</div>
            <div class="text-500">Total Productos</div>
          </div>
        </div>
        <div class="col-12 md:col-3">
          <div class="card text-center">
            <div class="text-900 font-medium text-xl">{{ productStore.totalValue() | currency:'USD':'symbol':'1.0-0' }}</div>
            <div class="text-500">Valor Total</div>
          </div>
        </div>
        <div class="col-12 md:col-3">
          <div class="card text-center">
            <div class="text-orange-500 font-medium text-xl">{{ productStore.lowStockProducts().length }}</div>
            <div class="text-500">Stock Bajo</div>
          </div>
        </div>
        <div class="col-12 md:col-3">
          <div class="card text-center">
            <div class="text-green-500 font-medium text-xl">{{ availableProducts() }}</div>
            <div class="text-500">Disponibles</div>
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div class="card text-center p-5" *ngIf="productStore.error()">
        <i class="pi pi-exclamation-triangle text-4xl text-red-500 mb-3"></i>
        <h3 class="text-xl text-red-500 mb-2">Error al cargar productos</h3>
        <p class="text-600 mb-4">{{ productStore.error() }}</p>
        <button
          class="toolbar-btn retry-btn"
          (click)="refreshProducts()">
          <i class="pi pi-refresh"></i>
          <span>Reintentar</span>
        </button>
      </div>

      <!-- Tabla de productos -->
      <app-product-table
        *ngIf="!productStore.error()"
        [products]="productStore.filteredProducts()"
        [loading]="productStore.loading()"
        [canEdit]="canEditProduct()"
        [canDelete]="canDeleteProduct()"
        (edit)="openEditDialog($event)"
        (delete)="confirmDelete($event)"
        (filterChange)="onFilterChange($event)">
      </app-product-table>

      <!-- Dialog para crear/editar -->
      <p-dialog
        header="{{ isEditing() ? 'Editar Producto' : 'Nuevo Producto' }}"
        [modal]="true"
        [(visible)]="showDialog"
        [style]="{width: '600px'}"
        [closable]="!formLoading">

        <app-product-form
          [product]="selectedProduct()"
          [categories]="categories"
          [loading]="formLoading"
          [formError]="formError"
          (save)="onSaveProduct($event)"
          (cancel)="closeDialog()">
        </app-product-form>
      </p-dialog>
    </div>

    <!-- Toast notifications -->
    <p-toast></p-toast>

    <!-- Confirm dialogs -->
    <p-confirmDialog></p-confirmDialog>
  `,
  styles: [`
    .layout-content {
      padding: 1rem;
    }

    .toolbar-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      border-radius: 0.5rem;
      border: 1px solid transparent;
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1.25;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      text-decoration: none;
      background: transparent;
    }

    .toolbar-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .report-btn {
      color: #f59e0b;
      border-color: #f59e0b;
      background-color: rgba(245, 158, 11, 0.1);
    }

    .report-btn:hover:not(:disabled) {
      background-color: #f59e0b;
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
    }

    .refresh-btn {
      color: #6b7280;
      border-color: #d1d5db;
      background-color: rgba(107, 114, 128, 0.1);
    }

    .refresh-btn:hover:not(:disabled) {
      background-color: #6b7280;
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(107, 114, 128, 0.3);
    }

    .refresh-btn.loading {
      background-color: rgba(107, 114, 128, 0.2);
      cursor: wait;
    }

    .create-btn {
      color: white;
      background-color: #10b981;
      border-color: #10b981;
    }

    .create-btn:hover:not(:disabled) {
      background-color: #059669;
      border-color: #047857;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
    }

    .retry-btn {
      color: #3b82f6;
      border-color: #3b82f6;
      background-color: rgba(59, 130, 246, 0.1);
    }

    .retry-btn:hover:not(:disabled) {
      background-color: #3b82f6;
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
    }

    @media (max-width: 768px) {
      .layout-content {
        padding: 0.5rem;
      }

      .toolbar-btn {
        padding: 0.5rem 0.75rem;
        font-size: 0.8125rem;
      }

      .btn-text-desktop {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .toolbar-btn {
        padding: 0.375rem 0.5rem;
      }

      .toolbar-btn span {
        display: none;
      }
    }
  `]
})
export class ProductsPageComponent implements OnInit {
  // 🏪 Stores y servicios
  readonly productStore = inject(ProductStore);
  readonly authStore = inject(AuthStore);
  private readonly productApi = inject(ProductApiService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  // 🔄 Estado local del componente
  showDialog = false;
  selectedProduct = signal<Product | null>(null);
  formLoading = false;
  formError: string | null = null;

  // 📝 Datos para el formulario
  categories: SelectOption<number>[] = [
    { label: 'Electrónica', value: 1 },
    { label: 'Hogar', value: 2 },
    { label: 'Ropa', value: 3 },
    { label: 'Deportes', value: 4 }
  ];

  // 📊 Computed properties
  isEditing = computed(() => this.selectedProduct() !== null);
  canCreateProduct = computed(() => {
    console.log('isAdmin:', this.authStore.isAdmin());
    return true; // Temporal: siempre permitir para pruebas
  });
  canEditProduct = computed(() => {
    return true; // Temporal: siempre permitir para pruebas
  });
  canDeleteProduct = computed(() => {
    return true; // Temporal: siempre permitir para pruebas
  });
  showStats = computed(() => this.productStore.hasProducts());

  availableProducts = computed(() =>
    this.productStore.products().filter(p => p.quantity > 0).length
  );

  ngOnInit(): void {
    console.log('ProductsPageComponent initialized');
    console.log('Products in store:', this.productStore.products());
    console.log('Filtered products:', this.productStore.filteredProducts());
    this.loadProducts();
  }

  // 📊 Data loading
  loadProducts(): void {
    console.log('Loading products...');
    this.productApi.loadProducts().subscribe({
      next: (products) => {
        console.log('Products loaded successfully:', products);
        console.log('Products in store after load:', this.productStore.products());
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los productos'
        });
      }
    });
  }

  refreshProducts(): void {
    this.productStore.clearFilters();
    this.loadProducts();
  }

  // 🎯 Event handlers
  onFilterChange(filters: { name?: string }): void {
    this.productStore.setFilters(filters);
  }

  openCreateDialog(): void {
    console.log('Opening create dialog');
    this.selectedProduct.set(null);
    this.formError = null;
    this.showDialog = true;
  }

  openEditDialog(product: Product): void {
    console.log('Opening edit dialog for product:', product);
    this.selectedProduct.set(product);
    this.formError = null;
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.selectedProduct.set(null);
    this.formError = null;
    this.formLoading = false;
  }

  onSaveProduct(request: CreateProductRequest): void {
    this.formLoading = true;
    this.formError = null;

    const isEditing = this.selectedProduct() !== null;
    const apiCall = isEditing
      ? this.productApi.updateProduct(this.selectedProduct()!.id!, { ...request, id: this.selectedProduct()!.id! })
      : this.productApi.createProduct(request);

    apiCall.subscribe({
      next: (product) => {
        this.messageService.add({
          severity: 'success',
          summary: isEditing ? 'Producto Actualizado' : 'Producto Creado',
          detail: `"${product.name}" ${isEditing ? 'actualizado' : 'creado'} correctamente`
        });
        this.closeDialog();
      },
      error: (error) => {
        this.formError = error.message || 'Error al guardar el producto';
        this.formLoading = false;
      }
    });
  }

  confirmDelete(product: Product): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el producto "${product.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.deleteProduct(product);
      }
    });
  }


  // 🔧 Business logic
  private deleteProduct(product: Product): void {
    this.productApi.deleteProduct(product.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: APP_CONSTANTS.SUCCESS.DELETED,
          detail: `Producto "${product.name}" eliminado`
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'No se pudo eliminar el producto'
        });
      }
    });
  }

  downloadLowStockReport(): void {
    // Placeholder para descarga de reporte
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Funcionalidad de reporte por implementar'
    });
  }
}
