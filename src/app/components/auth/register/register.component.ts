import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { PasswordModule } from 'primeng/password';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    ToastModule,
    PasswordModule,
    MultiSelectModule,
    RouterModule
  ],
  providers: [MessageService]
})
export class RegisterComponent {
  loading = false;

  form;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: MessageService
  ) {
    this.form = this.fb.group({
      document: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      roles: [[], Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) return;
  const { document, username, email, password, confirmPassword, roles } = this.form.value as any;
    if (password !== confirmPassword) {
      this.toast.add({severity:'error', summary:'Error', detail:'Las contraseñas no coinciden'});
      return;
    }
    this.loading = true;
  this.auth.register(document, username, email, password, roles).subscribe({
      next: () => {
        this.toast.add({severity:'success', summary:'OK', detail:'Usuario registrado'});
        this.router.navigate(['/login']);
      },
      error: (e) => {
        this.toast.add({severity:'error', summary:'Error', detail:'No se pudo registrar'});
        this.loading = false;
      },
      complete: () => this.loading = false
    });
  }
}
