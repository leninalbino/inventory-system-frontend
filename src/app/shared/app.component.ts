import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterModule, CommonModule, ButtonModule]
})
export class AppComponent {
  title = 'Inventory System Frontend';
  constructor(public auth: AuthService) {}

  logout() {
    this.auth.logout();
  }
}
