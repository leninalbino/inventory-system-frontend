import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

import { Product } from '../../models';

/**
 * Componente de tabla para productos
 */
@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    FormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <!-- Filtro -->
      <div class="flex justify-content-between align-items-center mb-3" *ngIf="showFilters">
        <span class="p-input-icon-left">
          <i class="pi pi-search"></i>
          <input 
            pInputText 
            type="text" 
            [(ngModel)]="nameFilter"
            (input)="onFilterChange()"
            placeholder="Buscar por nombre..."
            class="w-20rem">
        </span>
        
        <div class="flex align-items-center gap-2" *ngIf="totalValue > 0">
          <span class="text-sm text-600">
            Valor total: <strong>{{ totalValue | currency:'USD':'symbol':'1.2-2' }}</strong>
          </span>
        </div>
      </div>

      <!-- Tabla -->
      <p-table 
        [value]="filteredProducts"
        [loading]="loading"
        [rowHover]="true"
        [responsive]="true">
        
        <ng-template pTemplate="header">
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Estado</th>
            <th *ngIf="showActions">Acciones</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-product>
          <tr [class]="getRowClass(product)">
            <td>{{ product.name }}</td>
            <td>{{ product.description || '-' }}</td>
            <td>{{ product.price | currency:'USD':'symbol':'1.2-2' }}</td>
            <td>{{ product.quantity }}</td>
            <td>
              <p-tag 
                [value]="getStockLabel(product)"
                [severity]="getStockSeverity(product)">
              </p-tag>
            </td>
            <td *ngIf="showActions">
              <div class="flex gap-2">
                <p-button
                  icon="pi pi-pencil"
                  size="small"
                  severity="secondary"
                  [outlined]="true"
                  pTooltip="Editar"
                  (onClick)="onEdit(product)"
                  [disabled]="!canEdit">
                </p-button>
                
                <p-button
                  icon="pi pi-trash"
                  size="small"
                  severity="danger"
                  [outlined]="true"
                  pTooltip="Eliminar"
                  (onClick)="onDelete(product)"
                  [disabled]="!canDelete">
                </p-button>
              </div>
            </td>
          </tr>
        </ng-template>

        <!-- Empty state -->
        <ng-template pTemplate="emptymessage">
          <tr>
            <td [attr.colspan]="showActions ? 6 : 5" class="text-center p-4">
              <div class="flex flex-column align-items-center gap-3">
                <i class="pi pi-inbox text-4xl text-400"></i>
                <span class="text-lg text-600">{{ emptyMessage }}</span>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Footer -->
      <div class="flex justify-content-between align-items-center mt-3 pt-3 border-top-1 surface-border">
        <span class="text-sm text-600">
          {{ filteredProducts.length }} productos
          <span *ngIf="lowStockCount > 0" class="text-orange-500">
            ({{ lowStockCount }} con stock bajo)
          </span>
        </span>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .p-datatable-tbody > tr.low-stock > td {
      background-color: var(--orange-50);
    }
    
    :host ::ng-deep .p-datatable-tbody > tr.out-of-stock > td {
      background-color: var(--red-50);
    }
  `]
})
export class ProductTableComponent {
  @Input() products: Product[] = [];
  @Input() loading = false;
  @Input() showFilters = true;
  @Input() showActions = true;
  @Input() canEdit = true;
  @Input() canDelete = true;
  @Input() emptyMessage = 'No hay productos para mostrar';

  @Output() edit = new EventEmitter<Product>();
  @Output() delete = new EventEmitter<Product>();
  @Output() filterChange = new EventEmitter<{ name?: string }>();

  nameFilter = '';

  get filteredProducts(): Product[] {
    if (!this.nameFilter) {
      return this.products;
    }
    return this.products.filter(p => 
      p.name.toLowerCase().includes(this.nameFilter.toLowerCase())
    );
  }

  get totalValue(): number {
    return this.filteredProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  }

  get lowStockCount(): number {
    return this.filteredProducts.filter(p => this.isLowStock(p)).length;
  }

  onEdit(product: Product): void {
    this.edit.emit(product);
  }

  onDelete(product: Product): void {
    this.delete.emit(product);
  }

  onFilterChange(): void {
    this.filterChange.emit({ 
      name: this.nameFilter || undefined 
    });
  }

  isLowStock(product: Product): boolean {
    return product.quantity > 0 && product.quantity < 5;
  }

  isOutOfStock(product: Product): boolean {
    return product.quantity === 0;
  }

  getStockLabel(product: Product): string {
    if (this.isOutOfStock(product)) return 'Agotado';
    if (this.isLowStock(product)) return 'Stock Bajo';
    return 'Disponible';
  }

  getStockSeverity(product: Product): 'success' | 'warn' | 'danger' {
    if (this.isOutOfStock(product)) return 'danger';
    if (this.isLowStock(product)) return 'warn';
    return 'success';
  }

  getRowClass(product: Product): string {
    if (this.isOutOfStock(product)) return 'out-of-stock';
    if (this.isLowStock(product)) return 'low-stock';
    return '';
  }
}