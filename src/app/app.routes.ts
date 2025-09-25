import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ProductsPageComponent } from './features/products/components/products-page/products-page.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard.component';
import { ReportsComponent } from './components/reports/reports.component';
import { AuthGuard } from './guards/auth.guard';

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'products', 
    component: ProductsPageComponent, 
    canActivate: [AuthGuard],
    data: { 
      title: 'Productos', 
      roles: ['ROLE_EMPLOYEE', 'ROLE_ADMIN'],
      requireAll: false // Usuario necesita AL MENOS uno de estos roles
    }
  },
  { 
    path: 'admin', 
    component: AdminDashboardComponent, 
    canActivate: [AuthGuard],
    data: { 
      title: 'Administración', 
      roles: ['ROLE_ADMIN'],
      requireAll: true // Usuario debe tener específicamente el rol ADMIN
    }
  },
  { 
    path: 'reports', 
    component: ReportsComponent, 
    canActivate: [AuthGuard],
    data: { 
      title: 'Reportes', 
      roles: ['ROLE_ADMIN'],
      requireAll: true // Usuario debe tener específicamente el rol ADMIN
    }
  },
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: '**', redirectTo: 'products' }
];
