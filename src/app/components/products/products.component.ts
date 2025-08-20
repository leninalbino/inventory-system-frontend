import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { Product, ProductService } from '../../services/product.service';
import { ReportService } from '../../services/report.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-products',
  standalone: true,
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    InputTextModule,
    DialogModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    TooltipModule,
    InputNumberModule,
    DropdownModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  dialog = false;
  editing: Product | null = null;
  isAdmin = false;
  filterName = '';
  filterCategory = '';

  form;

  categories = [
    {label:'Electrónica', value:'Electronics'},
    {label:'Hogar', value:'Home'},
    {label:'Ropa', value:'Clothes'},
    {label:'Otros', value:'Others'}
  ];

  constructor(
    private fb: FormBuilder,
    private api: ProductService,
    private toast: MessageService,
    private confirm: ConfirmationService,
    private auth: AuthService,
    private reports: ReportService
  ) {
    this.form = this.fb.group({
      id: [{value: '', disabled: true}], // string solo para mostrar
      name: ['', [Validators.required, Validators.maxLength(120)]],
      description: ['',[Validators.maxLength(300)]],
      price: [0, [Validators.required, Validators.min(0)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required, Validators.maxLength(60)]],
    });
  }

  ngOnInit(): void {
  this.isAdmin = this.auth.hasRole('ROLE_ADMIN') || this.auth.hasRole('ADMIN');
    this.load();
  }

  load() {
    this.loading = true;
    this.api.findAll().subscribe({
      next: (res) => {
        // Mapear los campos de la respuesta a Product
        this.products = res.map((p: any) => ({
          id: p.productId ?? p.id,
          name: p.productName ?? p.name,
          description: p.description,
          price: p.price,
          quantity: p.quantity,
          category: p.category ?? p.categoryId // Ajusta si necesitas mostrar el nombre de la categoría
        }));
      },
      error: () => this.toast.add({severity:'error', summary:'Error', detail:'No se pudo cargar productos'}),
      complete: () => this.loading = false
    });
  }

  openNew() {
  this.editing = null;
  this.form.reset({ id: '', price: 0, quantity: 0 });
  this.dialog = true;
  }

  edit(p: Product) {
  
    const mapped: Product = {
      id: (p as any).productId ?? p.id,
      name: (p as any).productName ?? p.name,
      description: p.description,
      price: p.price,
      quantity: p.quantity,
      category: (p as any).category ?? (p as any).categoryId
    };
    this.editing = mapped;
    this.form.patchValue({
      name: mapped.name,
      description: mapped.description,
      price: mapped.price,
      quantity: mapped.quantity,
      category: mapped.category
    });
    if (mapped.id !== undefined && mapped.id !== null) {
      this.form.get('id')?.setValue(String(mapped.id));
    } else {
      this.form.get('id')?.reset();
    }
    this.dialog = true;
  }

  save() {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const value: Product = {
      name: raw.name ?? '',
      description: raw.description ?? '',
      price: raw.price ?? 0,
      quantity: raw.quantity ?? 0,
      category: raw.category ?? ''
    };
    // El id solo se usa para mostrar, no se envía en el payload
    if (this.editing?.id) {
      this.api.update(this.editing.id, value).subscribe({
        next: () => { this.toast.add({severity:'success', summary:'Actualizado'}); this.dialog=false; this.load(); },
        error: () => this.toast.add({severity:'error', summary:'Error', detail:'No se pudo actualizar'})
      });
    } else {
      // Por si acaso, elimina id si existe en el objeto
      if ('id' in value) delete (value as any).id;
      this.api.create(value).subscribe({
        next: () => { this.toast.add({severity:'success', summary:'Creado'}); this.dialog=false; this.load(); },
        error: () => this.toast.add({severity:'error', summary:'Error', detail:'No se pudo crear'})
      });
    }
  }

  remove(p: Product) {
    const id = (p as any).productId ?? p.id;
    this.confirm.confirm({
      message: `¿Eliminar "${p.name}"?`,
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.api.delete(id!).subscribe({
          next: () => { this.toast.add({severity:'success', summary:'Eliminado'}); this.load(); },
          error: () => this.toast.add({severity:'error', summary:'Error', detail:'No se pudo eliminar'})
        });
      }
    });
  }

  lowStockClass(rowData: any) {
    return rowData.quantity < 5 ? 'low-stock-row' : '';
  }

  downloadLowStockPdf() {
    this.reports.downloadLowInventory().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'low_inventory_report.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.toast.add({severity:'error', summary:'Error', detail:'No se pudo descargar el reporte'})
    });
  }

  get filteredProducts() {
    return this.products.filter(p => {
      const name = (p as any).name ?? (p as any).productName ?? '';
      const category = (p as any).category ?? (p as any).categoryId ?? '';
      return (
        (!this.filterName || name.toLowerCase().includes(this.filterName.toLowerCase())) &&
        (!this.filterCategory || category.toString().toLowerCase().includes(this.filterCategory.toLowerCase()))
      );
    });
  }
}
