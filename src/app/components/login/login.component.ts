import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    ToastModule,
    PasswordModule
  ],
  providers: [MessageService]
})
export class LoginComponent {
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
      password: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) return;
    const { document, password } = this.form.value as any;
    this.loading = true;
    this.auth.login(document, password).subscribe({
      next: () => {
        this.toast.add({severity:'success', summary:'OK', detail:'Bienvenido'});
        this.router.navigate(['/products']);
      },
      error: (e) => {
        this.toast.add({severity:'error', summary:'Error', detail:'Credenciales inválidas'});
        this.loading = false;
      },
      complete: () => this.loading = false
    });
  }
}
