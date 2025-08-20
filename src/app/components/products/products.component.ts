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
      name: ['', [Validators.required, Validators.maxLength(120)]],
      description: ['',[Validators.maxLength(300)]],
      price: [0, [Validators.required, Validators.min(0)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required, Validators.maxLength(60)]],
    });
  }

  ngOnInit(): void {
    this.isAdmin = this.auth.hasRole('ROLE_ADMIN');
    this.load();
  }

  load() {
    this.loading = true;
    this.api.findAll().subscribe({
      next: (res) => this.products = res,
      error: () => this.toast.add({severity:'error', summary:'Error', detail:'No se pudo cargar productos'}),
      complete: () => this.loading = false
    });
  }

  openNew() {
    this.editing = null;
    this.form.reset({ price: 0, quantity: 0 });
    this.dialog = true;
  }

  edit(p: Product) {
    this.editing = p;
    this.form.patchValue(p);
    this.dialog = true;
  }

  save() {
    if (this.form.invalid) return;
    const value = this.form.value as Product;
    if (this.editing?.id) {
      this.api.update(this.editing.id, value).subscribe({
        next: () => { this.toast.add({severity:'success', summary:'Actualizado'}); this.dialog=false; this.load(); },
        error: () => this.toast.add({severity:'error', summary:'Error', detail:'No se pudo actualizar'})
      });
    } else {
      this.api.create(value).subscribe({
        next: () => { this.toast.add({severity:'success', summary:'Creado'}); this.dialog=false; this.load(); },
        error: () => this.toast.add({severity:'error', summary:'Error', detail:'No se pudo crear'})
      });
    }
  }

  remove(p: Product) {
    this.confirm.confirm({
      message: `¿Eliminar "${p.name}"?`,
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.api.delete(p.id!).subscribe({
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
    return this.products.filter(p =>
      (!this.filterName || p.name.toLowerCase().includes(this.filterName.toLowerCase())) &&
      (!this.filterCategory || p.category?.toLowerCase().includes(this.filterCategory.toLowerCase()))
    );
  }
}
