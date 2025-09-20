import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isAuthEndpoint = req.url.includes('/login') || 
                        req.url.includes('/register') || 
                        req.url.includes('/refresh') ||
                        req.url.includes('/validate') ||
                        req.url.includes('/logout') ||
                        req.url.includes('/force-device');
  
  if (isAuthEndpoint) {
    return next(req);
  }

  // Obtener token directamente del BehaviorSubject para evitar dependencia circular
  const tokenKey = 'auth_token';
  const token = sessionStorage.getItem(tokenKey);
  let authReq = req;
  
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/refresh')) {
        // En caso de 401, redirigir a login sin intentar refresh automático
        // para evitar la dependencia circular
        console.log('❌ 401 Unauthorized, redirecting to login');
        window.location.href = '/login';
        return throwError(() => error);
      }
      return throwError(() => error);
    })
  );
};
