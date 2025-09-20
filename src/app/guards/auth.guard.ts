import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    console.log('🔍 AuthGuard.canActivate() called');
    
    // Obtener roles requeridos desde la configuración de la ruta
    const requiredRoles = route.data['roles'] as string[] || [];
    const requireAll = route.data['requireAll'] as boolean || false; // AND vs OR logic
    
    console.log('🔍 Required roles:', requiredRoles);
    console.log('🔍 Require all roles:', requireAll);
    console.log('🔍 Current auth status:', this.auth.isAuthenticated());
    
    // Si ya está autenticado, verificar roles inmediatamente
    if (this.auth.isAuthenticated()) {
      return this.checkRoleAccess(requiredRoles, requireAll);
    }

    // Si no está autenticado, esperar validación de sesión
    console.log('🔍 Not authenticated, waiting for session validation...');
    return new Observable(observer => {
      const checkAuthAndRole = () => {
        if (this.auth.isAuthenticated()) {
          console.log('✅ Session validated, checking roles...');
          this.checkRoleAccess(requiredRoles, requireAll).subscribe(
            hasAccess => {
              observer.next(hasAccess);
              observer.complete();
            }
          );
        } else {
          // Verificar cada 100ms
          setTimeout(checkAuthAndRole, 100);
        }
      };
      
      checkAuthAndRole();
      
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

  private checkRoleAccess(requiredRoles: string[], requireAll: boolean): Observable<boolean> {
    // Si no se requieren roles específicos, solo verificar autenticación
    if (requiredRoles.length === 0) {
      console.log('✅ No specific roles required, access granted');
      return of(true);
    }

    let hasAccess = false;

    if (requireAll) {
      // Usuario debe tener TODOS los roles requeridos
      hasAccess = requiredRoles.every(role => this.auth.hasRole(role));
      console.log('🔍 Checking ALL roles required:', hasAccess);
    } else {
      // Usuario debe tener AL MENOS UNO de los roles requeridos
      hasAccess = requiredRoles.some(role => this.auth.hasRole(role));
      console.log('🔍 Checking ANY role required:', hasAccess);
    }

    if (hasAccess) {
      console.log('✅ Role access granted');
      return of(true);
    } else {
      console.log('❌ Role access denied - insufficient permissions');
      // Redirigir basado en el rol del usuario
      if (this.auth.hasRole('ROLE_EMPLOYEE')) {
        this.router.navigate(['/products']); // Empleados van a productos
      } else {
        this.router.navigate(['/login']); // Sin rol válido, al login
      }
      return of(false);
    }
  }
}