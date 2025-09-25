import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { MessageService, ConfirmationService } from 'primeng/api';

import { Product } from '../../../../shared/models';
import { ProductStore } from '../../../../core/services/product.store';
import { AuthStore } from '../../../../core/services/auth.store';
import { ProductApiService } from '../../services/product-api.service';
import { ProductTableComponent } from '../../../../shared/components/product-table/product-table.component';
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
              <p-button
                label="Reporte Stock Bajo"
                icon="pi pi-file-pdf"
                severity="warn"
                [outlined]="true"
                [disabled]="productStore.lowStockProducts().length === 0"
                (onClick)="downloadLowStockReport()"
                pTooltip="Descargar PDF de productos con stock bajo">
              </p-button>
              
              <!-- Refrescar -->
              <p-button
                icon="pi pi-refresh"
                severity="secondary"
                [outlined]="true"
                [loading]="productStore.loading()"
                (onClick)="refreshProducts()"
                pTooltip="Actualizar lista">
              </p-button>
              
              <!-- Crear producto -->
              <p-button
                label="Nuevo Producto"
                icon="pi pi-plus"
                [disabled]="!canCreateProduct()"
                (onClick)="openCreateDialog()"
                pTooltip="Crear nuevo producto">
              </p-button>
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
        <p-button 
          label="Reintentar" 
          icon="pi pi-refresh"
          (onClick)="refreshProducts()">
        </p-button>
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

      <!-- Dialog para crear/editar (placeholder) -->
      <p-dialog 
        header="{{ isEditing() ? 'Editar Producto' : 'Nuevo Producto' }}"
        [modal]="true"
        [(visible)]="showDialog"
        [style]="{width: '600px'}"
        [closable]="!productStore.loading()">
        
        <div class="text-center p-4">
          <p>Formulario de producto (por implementar)</p>
          <p *ngIf="selectedProduct()">Editando: {{ selectedProduct()?.name }}</p>
        </div>
        
        <div class="flex justify-content-end gap-2 pt-4">
          <p-button 
            label="Cancelar" 
            severity="secondary" 
            [outlined]="true"
            (onClick)="closeDialog()">
          </p-button>
          <p-button 
            label="{{ isEditing() ? 'Actualizar' : 'Crear' }}"
            (onClick)="saveProduct()">
          </p-button>
        </div>
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
    
    @media (max-width: 768px) {
      .layout-content {
        padding: 0.5rem;
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

  // 📊 Computed properties
  isEditing = computed(() => this.selectedProduct() !== null);
  canCreateProduct = computed(() => this.authStore.isAdmin());
  canEditProduct = computed(() => this.authStore.isAdmin());
  canDeleteProduct = computed(() => this.authStore.isAdmin());
  showStats = computed(() => this.productStore.hasProducts());
  
  availableProducts = computed(() => 
    this.productStore.products().filter(p => p.quantity > 0).length
  );

  ngOnInit(): void {
    this.loadProducts();
  }

  // 📊 Data loading
  loadProducts(): void {
    this.productApi.loadProducts().subscribe({
      next: () => {
        console.log('Products loaded successfully');
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los productos'
        });
        console.error('Error loading products:', error);
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
    this.selectedProduct.set(null);
    this.showDialog = true;
  }

  openEditDialog(product: Product): void {
    this.selectedProduct.set(product);
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.selectedProduct.set(null);
  }

  saveProduct(): void {
    // Placeholder - aquí iría la lógica de guardado
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Funcionalidad de guardado por implementar'
    });
    this.closeDialog();
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