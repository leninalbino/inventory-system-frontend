import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('[AuthInterceptor] Token encontrado:', token);
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      console.log('[AuthInterceptor] Header Authorization agregado:', authReq.headers.get('Authorization'));
      return next.handle(authReq);
    } else {
      console.log('[AuthInterceptor] No se encontró token en localStorage');
    }
    return next.handle(req);
  }
}
