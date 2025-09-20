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
    PasswordModule,
    RouterModule
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
    console.log('🔍 Submit method called');
    console.log('🔍 Form valid:', this.form.valid);
    console.log('🔍 Form value:', this.form.value);
    console.log('🔍 Form errors:', this.form.errors);
    console.log('🔍 Document control errors:', this.form.get('document')?.errors);
    console.log('🔍 Password control errors:', this.form.get('password')?.errors);
    
    if (this.form.invalid) {
      console.log('❌ Form is invalid, marking all as touched');
      this.form.markAllAsTouched();
      return;
    }
    
    const { document, password } = this.form.value as any;
    console.log('🔍 About to call auth.login with:', { document, password: '***' });
    
    this.loading = true;
    
    this.auth.login(document, password).subscribe({
      next: (res) => {
        console.log('✅ Login success:', res);
        this.toast.add({severity:'success', summary:'OK', detail:'Bienvenido'});
        this.router.navigate(['/products']);
      },
      error: (e) => {
        console.error('❌ Login error:', e);
        this.toast.add({severity:'error', summary:'Error', detail:'Credenciales inválidas'});
        this.loading = false;
      },
      complete: () => {
        console.log('🔍 Login observable completed');
        this.loading = false;
      }
    });
  }
}
