import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule],
  template: `
    <div class="admin-dashboard">
      <h1>Panel de Administración</h1>
      <p>Bienvenido, {{getUsername()}}. Solo los administradores pueden ver esta página.</p>
      
      <div class="admin-actions">
        <p-card header="Gestión de Productos" styleClass="admin-card">
          <p>Crear, editar y eliminar productos del inventario.</p>
          <button pButton routerLink="/products" label="Gestionar Productos" icon="pi pi-box"></button>
        </p-card>
        
        <p-card header="Reportes" styleClass="admin-card">
          <p>Generar reportes de inventario bajo y estadísticas.</p>
          <button pButton routerLink="/reports" label="Ver Reportes" icon="pi pi-chart-bar"></button>
        </p-card>
        
        <p-card header="Gestión de Usuarios" styleClass="admin-card">
          <p>Administrar usuarios y permisos del sistema.</p>
          <button pButton routerLink="/users" label="Gestionar Usuarios" icon="pi pi-users"></button>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 2rem;
    }
    
    .admin-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
      margin-top: 2rem;
    }
    
    .admin-card {
      margin-bottom: 1rem;
    }
    
    h1 {
      color: var(--primary-color);
      margin-bottom: 1rem;
    }
  `]
})
export class AdminDashboardComponent {
  constructor(private auth: AuthService) {}
  
  getUsername(): string {
    return this.auth.getUsername() || 'Administrador';
  }
}