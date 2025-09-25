/**
 * Constantes de la aplicación
 */

export const APP_CONSTANTS = {
  // API Endpoints
  API: {
    AUTH: '/auth',
    PRODUCTS: '/products',
    REPORTS: '/reports',
    CATEGORIES: '/categories'
  },

  // Roles de usuario
  ROLES: {
    ADMIN: 'ROLE_ADMIN',
    EMPLOYEE: 'ROLE_EMPLOYEE'
  } as const,

  // Configuración de formularios
  FORM: {
    PRODUCT: {
      NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 100
      },
      DESCRIPTION: {
        MAX_LENGTH: 500
      },
      PRICE: {
        MIN: 0.01,
        MAX: 999999
      },
      QUANTITY: {
        MIN: 0,
        MAX: 999999
      }
    }
  },

  // Configuración de UI
  UI: {
    DEBOUNCE_TIME: 300,
    TOAST_DURATION: 3000,
    LOW_STOCK_THRESHOLD: 5,
    ITEMS_PER_PAGE: 10
  },

  // Mensajes de error
  ERRORS: {
    REQUIRED: 'Este campo es obligatorio',
    INVALID_EMAIL: 'Email inválido',
    MIN_LENGTH: (min: number) => `Mínimo ${min} caracteres`,
    MAX_LENGTH: (max: number) => `Máximo ${max} caracteres`,
    MIN_VALUE: (min: number) => `El valor mínimo es ${min}`,
    MAX_VALUE: (max: number) => `El valor máximo es ${max}`,
    GENERIC: 'Ha ocurrido un error',
    NETWORK: 'Error de conexión',
    UNAUTHORIZED: 'No tienes permisos para realizar esta acción'
  },

  // Mensajes de éxito
  SUCCESS: {
    CREATED: 'Creado exitosamente',
    UPDATED: 'Actualizado exitosamente',
    DELETED: 'Eliminado exitosamente',
    LOGIN: 'Bienvenido',
    LOGOUT: 'Sesión cerrada'
  },

  // Configuración de storage
  STORAGE: {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    THEME: 'app_theme'
  }
} as const;

// Tipos derivados de constantes
export type UserRole = typeof APP_CONSTANTS.ROLES[keyof typeof APP_CONSTANTS.ROLES];
export type ApiEndpoint = typeof APP_CONSTANTS.API[keyof typeof APP_CONSTANTS.API];