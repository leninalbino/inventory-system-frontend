import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    username: string;
    roles: string[];
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  login(document: string, password: string) {
    return this.http.post<LoginResponse>(`${this.base}/auth/login`, { document, password })
      .pipe(tap(res => {
        if (res?.data?.token) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('username', res.data.username);
          localStorage.setItem('roles', JSON.stringify(res.data.roles || []));
        }
      }));
  }

  register(document: string, username: string, email: string, password: string, roles: string[]) {
    return this.http.post<any>(`${this.base}/auth/register`, { document, username, email, password, roles });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('roles');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRoles(): string[] {
    try {
      return JSON.parse(localStorage.getItem('roles') || '[]');
    } catch {
      return [];
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role.toLocaleUpperCase());
  }
}
