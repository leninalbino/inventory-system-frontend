/**
 * Modelos para respuestas de API y manejo de errores
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  data?: {
    errorCode?: string;
    field?: string;
    value?: any;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

// Estados de carga para componentes
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

// Opciones para dropdowns
export interface SelectOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
}

// Configuración de tabla
export interface TableColumn<T = any> {
  field: keyof T;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
}

// Paginación
export interface PaginationConfig {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}