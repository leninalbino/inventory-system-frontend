import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    console.log('🔍 RoleGuard.canActivate() called');
    console.log('🔍 Current auth status:', this.auth.isAuthenticated());
    
    // Si ya está autenticado, permitir acceso inmediatamente
    if (this.auth.isAuthenticated()) {
      console.log('✅ Already authenticated, allowing access');
      return of(true);
    }

    // Si no está autenticado, esperar un momento para la validación de sesión
    console.log('🔍 Not authenticated, waiting for session validation...');
    return new Observable(observer => {
      // Esperar hasta 3 segundos para que se complete la validación de sesión
      const checkAuth = () => {
        if (this.auth.isAuthenticated()) {
          console.log('✅ Session validated, allowing access');
          observer.next(true);
          observer.complete();
        } else {
          // Verificar cada 100ms
          setTimeout(checkAuth, 100);
        }
      };
      
      checkAuth();
      
      // Timeout después de 3 segundos
      setTimeout(() => {
        if (!this.auth.isAuthenticated()) {
          console.log('❌ Session validation timeout, redirecting to login');
          this.router.navigate(['/login']);
          observer.next(false);
          observer.complete();
        }
      }, 3000);
    });
  }
}
