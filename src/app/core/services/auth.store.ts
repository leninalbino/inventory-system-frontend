import { Injectable, computed, signal } from '@angular/core';
import { AuthState, User, UserRole } from '../../shared/models';
import { APP_CONSTANTS } from '../constants/app.constants';

/**
 * Store centralizado para autenticación usando Angular Signals
 */
@Injectable({
  providedIn: 'root'
})
export class AuthStore {
  // 📊 Estado privado
  private readonly _state = signal<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  });

  // 📖 Selectores públicos
  readonly user = computed(() => this._state().user);
  readonly token = computed(() => this._state().token);
  readonly isAuthenticated = computed(() => this._state().isAuthenticated);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);

  // 📈 Selectores derivados
  readonly username = computed(() => this.user()?.username || '');
  readonly userRoles = computed(() => this.user()?.roles || []);
  
  readonly isAdmin = computed(() => 
    this.userRoles().includes(APP_CONSTANTS.ROLES.ADMIN)
  );
  
  readonly isEmployee = computed(() => 
    this.userRoles().includes(APP_CONSTANTS.ROLES.EMPLOYEE)
  );

  // 🔧 Actions
  setLoading(loading: boolean): void {
    this._state.update(state => ({
      ...state,
      loading,
      error: loading ? null : state.error
    }));
  }

  setError(error: string | null): void {
    this._state.update(state => ({
      ...state,
      error,
      loading: false
    }));
  }

  setAuthenticated(user: User, token: string): void {
    this._state.update(state => ({
      ...state,
      user,
      token,
      isAuthenticated: true,
      loading: false,
      error: null
    }));
    
    // Persist to localStorage
    localStorage.setItem(APP_CONSTANTS.STORAGE.AUTH_TOKEN, token);
    localStorage.setItem(APP_CONSTANTS.STORAGE.USER_DATA, JSON.stringify(user));
  }

  clearAuth(): void {
    this._state.update(state => ({
      ...state,
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null
    }));
    
    // Clear localStorage
    localStorage.removeItem(APP_CONSTANTS.STORAGE.AUTH_TOKEN);
    localStorage.removeItem(APP_CONSTANTS.STORAGE.USER_DATA);
  }

  updateUser(user: Partial<User>): void {
    this._state.update(state => ({
      ...state,
      user: state.user ? { ...state.user, ...user } : null
    }));
    
    if (this.user()) {
      localStorage.setItem(APP_CONSTANTS.STORAGE.USER_DATA, JSON.stringify(this.user()));
    }
  }

  // 🔍 Utility methods
  hasRole(role: UserRole): boolean {
    return this.userRoles().includes(role);
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const userRoles = this.userRoles();
    return roles.some(role => userRoles.includes(role));
  }

  hasAllRoles(roles: UserRole[]): boolean {
    const userRoles = this.userRoles();
    return roles.every(role => userRoles.includes(role));
  }

  // 🔄 Initialization
  initializeFromStorage(): void {
    const token = localStorage.getItem(APP_CONSTANTS.STORAGE.AUTH_TOKEN);
    const userData = localStorage.getItem(APP_CONSTANTS.STORAGE.USER_DATA);
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData) as User;
        this.setAuthenticated(user, token);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearAuth();
      }
    }
  }
}