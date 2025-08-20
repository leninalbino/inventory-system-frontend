import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
// import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';

import { AppComponent } from './shared/app.component';
import { LoginComponent } from './components/auth/login/login.component';
import { ProductsComponent } from './components/products/products.component';

import { AuthInterceptor } from './interceptors/auth.interceptor';

import { MessageService, ConfirmationService } from 'primeng/api';
import Aura from '@primeuix/themes/aura';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ProductsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
  // HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    // PrimeNG
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    TableModule,
    DialogModule,
    DropdownModule,
    InputNumberModule,
    ToastModule,
    TagModule,
    ToolbarModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  providers: [
    MessageService,
    ConfirmationService,
  // { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

