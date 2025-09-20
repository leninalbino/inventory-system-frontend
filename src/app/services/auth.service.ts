import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError, BehaviorSubject } from 'rxjs';

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    refreshToken: string;
    username: string;
    roles: string[];
  };
}

interface RefreshResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    refreshToken: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiUrl;
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private sessionTimer: any;

  constructor(private http: HttpClient, private router: Router) {
    this.loadSessionFromCookies();
  }

  login(document: string, password: string) {
    console.log('🔍 AuthService.login called with:', { document, password: '***' });
    
    const deviceId = this.getOrCreateDeviceId();
    console.log('🔍 Device ID:', deviceId);
    
    const headers = { 'X-Device-ID': deviceId };
    const url = `${this.base}/auth/login`;
    const payload = { document, password };
    const options = { withCredentials: true, headers };
    
    console.log('🔍 Making HTTP request to:', url);
    console.log('🔍 Payload:', { document, password: '***' });
    console.log('🔍 Options:', options);
    
    return this.http.post<LoginResponse>(url, payload, options).pipe(
      tap(res => {
        console.log('✅ HTTP Response received:', res);
        if (res?.data?.token) {
          console.log('✅ Token found, setting session data');
          this.tokenSubject.next(res.data.token);
          sessionStorage.setItem('auth_token', res.data.token);
          this.setSessionData(res.data);
          this.startSessionTimer();
        } else {
          console.log('❌ No token in response');
        }
      }),
      tap({
        error: (error) => {
          console.error('❌ HTTP Error in AuthService:', error);
        }
      })
    );
  }

  register(document: string, username: string, email: string, password: string, roles: string[]) {
    return this.http.post<any>(`${this.base}/auth/register`, { document, username, email, password, roles });
  }

  logout() {
    this.http.post(`${this.base}/auth/logout`, {}, { withCredentials: true }).subscribe();
    this.clearSession();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  getRoles(): string[] {
    try {
      return JSON.parse(sessionStorage.getItem('roles') || '[]');
    } catch {
      return [];
    }
  }

  getUsername(): string | null {
    return sessionStorage.getItem('username');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    const roles = this.getRoles().map(r => r.toUpperCase());
    return roles.includes(role.toUpperCase());
  }

  refreshToken(): Observable<RefreshResponse> {
    return this.http.post<RefreshResponse>(`${this.base}/auth/refresh`, {}, { withCredentials: true })
      .pipe(
        tap(res => {
          if (res?.data?.token) {
            this.tokenSubject.next(res.data.token);
            this.startSessionTimer();
          }
        }),
        catchError(error => {
          this.clearSession();
          this.router.navigate(['/login']);
          return throwError(() => error);
        })
      );
  }

  private setSessionData(data: any) {
    sessionStorage.setItem('username', data.username);
    sessionStorage.setItem('roles', JSON.stringify(data.roles || []));
  }

  private loadSessionFromCookies() {
    console.log('🔍 Loading session from cookies...');
    this.http.get<{ token: string; deviceId?: string }>(`${this.base}/auth/validate`, { withCredentials: true })
      .subscribe({
        next: (res) => {
          console.log('✅ Session validation response:', res);
          if (res?.token) {
            this.tokenSubject.next(res.token);
            sessionStorage.setItem('auth_token', res.token);
            // Decodificar el token para obtener la información del usuario
            try {
              const payload = JSON.parse(atob(res.token.split('.')[1]));
              console.log('✅ Token payload:', payload);
              // Guardar información del usuario en sessionStorage
              sessionStorage.setItem('username', payload.username || '');
              sessionStorage.setItem('roles', JSON.stringify(payload.roles || []));
            } catch (e) {
              console.error('❌ Error decoding token:', e);
            }
            this.checkDeviceSession(res.deviceId);
            this.startSessionTimer();
          }
        },
        error: (error) => {
          console.log('❌ Session validation failed:', error);
          this.clearSession();
        }
      });
  }

  private getOrCreateDeviceId(): string {
    let deviceId = sessionStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = this.generateDeviceId();
      sessionStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  private checkDeviceSession(serverDeviceId?: string) {
    const localDeviceId = sessionStorage.getItem('deviceId');
    
    if (!localDeviceId) {
      const newDeviceId = this.generateDeviceId();
      sessionStorage.setItem('deviceId', newDeviceId);
      this.notifyNewDevice();
    } else if (serverDeviceId && localDeviceId !== serverDeviceId) {
      this.handleMultipleDevices();
    }
  }

  private generateDeviceId(): string {
    return 'device_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
  }

  private notifyNewDevice() {
    console.log('Nueva sesión iniciada desde este dispositivo');
  }

  private handleMultipleDevices() {
    const confirmContinue = confirm(
      'Se detectó una sesión activa en otro dispositivo. ¿Desea continuar? Esto cerrará la otra sesión.'
    );
    
    if (!confirmContinue) {
      this.logout();
    } else {
      this.http.post(`${this.base}/auth/force-device`, { 
        deviceId: sessionStorage.getItem('deviceId') 
      }, { withCredentials: true }).subscribe();
    }
  }

  private clearSession() {
    this.tokenSubject.next(null);
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('roles');
    sessionStorage.removeItem('deviceId');
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
  }

  private startSessionTimer() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
    this.sessionTimer = setTimeout(() => {
      this.refreshToken().subscribe();
    }, 45 * 60 * 1000);
  }
}
