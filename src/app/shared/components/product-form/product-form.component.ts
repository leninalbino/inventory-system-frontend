import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

import { Product, CreateProductRequest, SelectOption } from '../../models';

/**
 * Componente de formulario para productos
 */
@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextarea,
    InputNumberModule,
    DropdownModule,
    ButtonModule,
    MessageModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="p-fluid product-form">

      <!-- Nombre del producto -->
      <div class="field">
        <label for="name" class="block text-900 font-medium mb-2">
          Nombre del producto *
        </label>
        <input
          id="name"
          type="text"
          pInputText
          formControlName="name"
          placeholder="Ingrese el nombre del producto"
          [class.ng-invalid]="isFieldInvalid('name')"
          class="w-full" />

        <small
          *ngIf="getFieldError('name')"
          class="p-error block mt-1">
          {{ getFieldError('name') }}
        </small>
      </div>

      <!-- Descripción -->
      <div class="field">
        <label for="description" class="block text-900 font-medium mb-2">
          Descripción
        </label>
        <textarea
          id="description"
          pInputTextarea
          formControlName="description"
          placeholder="Descripción del producto (opcional)"
          [rows]="3"
          class="w-full">
        </textarea>
      </div>

      <!-- Precio -->
      <div class="field">
        <label for="price" class="block text-900 font-medium mb-2">
          Precio *
        </label>
        <p-inputNumber
          inputId="price"
          formControlName="price"
          mode="currency"
          currency="USD"
          locale="en-US"
          [min]="0.01"
          placeholder="0.00"
          class="w-full">
        </p-inputNumber>

        <small
          *ngIf="getFieldError('price')"
          class="p-error block mt-1">
          {{ getFieldError('price') }}
        </small>
      </div>

      <!-- Cantidad -->
      <div class="field">
        <label for="quantity" class="block text-900 font-medium mb-2">
          Cantidad *
        </label>
        <p-inputNumber
          inputId="quantity"
          formControlName="quantity"
          [useGrouping]="false"
          [min]="0"
          placeholder="0"
          class="w-full">
        </p-inputNumber>

        <small
          *ngIf="getFieldError('quantity')"
          class="p-error block mt-1">
          {{ getFieldError('quantity') }}
        </small>
      </div>

      <!-- Categoría -->
      <div class="field">
        <label for="category" class="block text-900 font-medium mb-2">
          Categoría *
        </label>
        <p-dropdown
          inputId="category"
          formControlName="categoryId"
          [options]="categories"
          placeholder="Seleccione una categoría"
          optionLabel="label"
          optionValue="value"
          class="w-full">
        </p-dropdown>

        <small
          *ngIf="getFieldError('categoryId')"
          class="p-error block mt-1">
          {{ getFieldError('categoryId') }}
        </small>
      </div>

      <!-- Mensaje de error general -->
      <p-message
        *ngIf="formError"
        severity="error"
        [text]="formError"
        class="mb-3">
      </p-message>

      <!-- Botones -->
      <div class="form-actions">
        <button
          type="button"
          class="form-btn cancel-btn"
          (click)="onCancel()"
          [disabled]="loading">
          <i class="pi pi-times"></i>
          <span>Cancelar</span>
        </button>

        <button
          type="submit"
          class="form-btn submit-btn"
          [disabled]="productForm.invalid || loading"
          [class.loading]="loading">
          <i [class]="loading ? 'pi pi-spin pi-spinner' : (isEditMode ? 'pi pi-check' : 'pi pi-plus')"></i>
          <span>{{ isEditMode ? 'Actualizar Producto' : 'Crear Producto' }}</span>
        </button>
      </div>
    </form>
  `,
  styles: [`
    .product-form {
      max-width: 100%;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 1rem;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--surface-border);
    }

    .form-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      border: 1px solid transparent;
      font-size: 0.875rem;
      font-weight: 600;
      line-height: 1.25;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      text-decoration: none;
      min-width: 8rem;
      justify-content: center;
    }

    .form-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .cancel-btn {
      color: #6b7280;
      border-color: #d1d5db;
      background-color: white;
    }

    .cancel-btn:hover:not(:disabled) {
      background-color: #f9fafb;
      border-color: #9ca3af;
      color: #374151;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .submit-btn {
      color: white;
      background-color: #10b981;
      border-color: #10b981;
    }

    .submit-btn:hover:not(:disabled) {
      background-color: #059669;
      border-color: #047857;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
    }

    .submit-btn.loading {
      background-color: #6ee7b7;
      border-color: #6ee7b7;
      cursor: wait;
    }

    .form-btn i {
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .form-actions {
        gap: 0.75rem;
        margin-top: 1rem;
        padding-top: 1rem;
      }

      .form-btn {
        padding: 0.625rem 1rem;
        font-size: 0.8125rem;
        min-width: 6rem;
      }
    }

    @media (max-width: 480px) {
      .form-actions {
        flex-direction: column-reverse;
        gap: 0.5rem;
      }

      .form-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ProductFormComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() product: Product | null = null;
  @Input() categories: SelectOption<number>[] = [];
  @Input() loading = false;
  @Input() formError: string | null = null;

  @Output() save = new EventEmitter<CreateProductRequest>();
  @Output() cancel = new EventEmitter<void>();

  productForm!: FormGroup;
  isEditMode = false;

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.productForm) {
      this.updateFormWithProduct();
    }
  }

  private initializeForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      categoryId: [null, [Validators.required]]
    });

    this.updateFormWithProduct();
  }

  private updateFormWithProduct(): void {
    this.isEditMode = this.product !== null;

    if (this.product) {
      this.productForm.patchValue({
        name: this.product.name,
        description: this.product.description,
        price: this.product.price,
        quantity: this.product.quantity,
        categoryId: this.product.categoryId
      });
    } else {
      this.productForm.reset({
        name: '',
        description: '',
        price: 0,
        quantity: 0,
        categoryId: null
      });
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const formValue = this.productForm.getRawValue();

      const productRequest: CreateProductRequest = {
        name: formValue.name.trim(),
        description: formValue.description?.trim() || '',
        price: formValue.price.toString(),
        quantity: formValue.quantity,
        category: formValue.categoryId
      };

      this.save.emit(productRequest);
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  getFieldError(fieldName: string): string | null {
    const field = this.productForm.get(fieldName);

    if (!this.isFieldInvalid(fieldName)) {
      return null;
    }

    const errors = field?.errors;
    if (!errors) return null;

    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['min']) return `El valor mínimo es ${errors['min'].min}`;

    return 'Campo inválido';
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }
}
