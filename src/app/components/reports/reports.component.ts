import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <div class="reports-container">
      <h1>Reportes de Inventario</h1>
      <p>Solo los administradores pueden acceder a los reportes del sistema.</p>
      
      <div class="reports-grid">
        <p-card header="Inventario Bajo" styleClass="report-card">
          <p>Generar reporte de productos con stock bajo.</p>
          <button pButton label="Generar Reporte" icon="pi pi-download" (click)="generateLowInventoryReport()"></button>
        </p-card>
        
        <p-card header="Estadísticas Generales" styleClass="report-card">
          <p>Resumen general del inventario y movimientos.</p>
          <button pButton label="Ver Estadísticas" icon="pi pi-chart-pie" (click)="viewStatistics()"></button>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
      padding: 2rem;
    }
    
    .reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
      margin-top: 2rem;
    }
    
    h1 {
      color: var(--primary-color);
      margin-bottom: 1rem;
    }
  `]
})
export class ReportsComponent {
  constructor(private auth: AuthService) {}
  
  generateLowInventoryReport() {
    // TODO: Implementar llamada al endpoint de reportes
    console.log('Generando reporte de inventario bajo...');
  }
  
  viewStatistics() {
    // TODO: Implementar vista de estadísticas
    console.log('Mostrando estadísticas...');
  }
}