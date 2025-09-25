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
import { TooltipModule } from 'primeng/tooltip';
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
    TooltipModule,
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
              <div class="action-buttons">
                <button
                  type="button"
                  class="action-btn edit-btn"
                  pTooltip="Editar producto"
                  tooltipPosition="top"
                  (click)="onEdit(product)"
                  [disabled]="!canEdit"
                  [attr.aria-label]="'Editar producto ' + product.name">
                  <i class="pi pi-pencil"></i>
                  <span class="btn-text">Editar</span>
                </button>

                <button
                  type="button"
                  class="action-btn delete-btn"
                  pTooltip="Eliminar producto"
                  tooltipPosition="top"
                  (click)="onDelete(product)"
                  [disabled]="!canDelete"
                  [attr.aria-label]="'Eliminar producto ' + product.name">
                  <i class="pi pi-trash"></i>
                  <span class="btn-text">Eliminar</span>
                </button>
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

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      align-items: center;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid transparent;
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      text-decoration: none;
      background: transparent;
      min-height: 2.25rem;
    }

    .action-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .edit-btn {
      color: #0ea5e9;
      border-color: #0ea5e9;
      background-color: rgba(14, 165, 233, 0.1);
    }

    .edit-btn:hover:not(:disabled) {
      background-color: #0ea5e9;
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(14, 165, 233, 0.3);
    }

    .delete-btn {
      color: #ef4444;
      border-color: #ef4444;
      background-color: rgba(239, 68, 68, 0.1);
    }

    .delete-btn:hover:not(:disabled) {
      background-color: #ef4444;
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
    }

    .btn-text {
      font-size: 0.75rem;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .action-buttons {
        flex-direction: column;
        gap: 0.25rem;
      }

      .action-btn {
        padding: 0.375rem 0.5rem;
        min-width: auto;
      }

      .btn-text {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .action-buttons {
        flex-direction: row;
        gap: 0.25rem;
      }

      .action-btn {
        padding: 0.25rem;
        border-radius: 0.375rem;
      }
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
    console.log('Table: Edit button clicked for product:', product);
    this.edit.emit(product);
  }

  onDelete(product: Product): void {
    console.log('Table: Delete button clicked for product:', product);
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
