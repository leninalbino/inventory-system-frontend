/**
 * Modelos de dominio para autenticación
 */

export interface User {
  readonly id: number;
  readonly username: string;
  readonly email: string;
  readonly document: string;
  readonly roles: string[];
}

export interface LoginRequest {
  document: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    refreshToken: string;
    username: string;
    roles: string[];
  };
}

export interface RegisterRequest {
  document: string;
  username: string;
  email: string;
  password: string;
  roles: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Tipos de roles
export enum UserRole {
  ADMIN = 'ROLE_ADMIN',
  EMPLOYEE = 'ROLE_EMPLOYEE'
}

// Guards data
export interface RouteData {
  title?: string;
  roles?: UserRole[];
  requireAll?: boolean;
}