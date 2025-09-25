import { Injectable } from '@angular/core';
import { FormGroup, AbstractControl, ValidationErrors, FormArray } from '@angular/forms';
import { APP_CONSTANTS } from '../constants/app.constants';

/**
 * Servicio utilitario para manejo de formularios y validaciones
 */
@Injectable({
  providedIn: 'root'
})
export class FormService {

  /**
   * Marca todos los campos de un formulario como touched
   */
  markAllFieldsAsTouched(form: FormGroup | FormArray): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markAllFieldsAsTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  /**
   * Verifica si un campo específico es inválido
   */
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  /**
   * Obtiene el primer error de un campo y lo convierte a mensaje amigable
   */
  getFieldError(form: FormGroup, fieldName: string): string | null {
    const field = form.get(fieldName);
    
    if (!this.isFieldInvalid(form, fieldName)) {
      return null;
    }

    const errors = field?.errors;
    if (!errors) return null;

    return this.getErrorMessage(errors, fieldName);
  }

  /**
   * Convierte un objeto de errores en mensaje amigable
   */
  getErrorMessage(errors: ValidationErrors, fieldName?: string): string {
    const errorKey = Object.keys(errors)[0];
    const errorValue = errors[errorKey];

    const errorMessages: Record<string, (error: any, field?: string) => string> = {
      required: () => APP_CONSTANTS.ERRORS.REQUIRED,
      email: () => APP_CONSTANTS.ERRORS.INVALID_EMAIL,
      minlength: (error) => APP_CONSTANTS.ERRORS.MIN_LENGTH(error.requiredLength),
      maxlength: (error) => APP_CONSTANTS.ERRORS.MAX_LENGTH(error.requiredLength),
      min: (error) => APP_CONSTANTS.ERRORS.MIN_VALUE(error.min),
      max: (error) => APP_CONSTANTS.ERRORS.MAX_VALUE(error.max),
      pattern: () => `Formato inválido${fieldName ? ` para ${fieldName}` : ''}`,
      onlyWhitespace: () => 'No puede contener solo espacios en blanco',
      positiveNumber: () => 'Debe ser un número positivo',
      integer: () => 'Debe ser un número entero',
      duplicate: (error) => `${error.resource} con ${error.field} '${error.value}' ya existe`,
      custom: (error) => error.message || 'Campo inválido'
    };

    const messageFactory = errorMessages[errorKey];
    return messageFactory ? messageFactory(errorValue, fieldName) : 'Campo inválido';
  }

  /**
   * Obtiene todos los errores de un formulario
   */
  getAllErrors(form: FormGroup | FormArray): Record<string, string> {
    const errors: Record<string, string> = {};

    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      
      if (control instanceof FormGroup || control instanceof FormArray) {
        const nestedErrors = this.getAllErrors(control);
        Object.keys(nestedErrors).forEach(nestedKey => {
          errors[`${key}.${nestedKey}`] = nestedErrors[nestedKey];
        });
      } else if (control?.invalid && control?.errors) {
        errors[key] = this.getErrorMessage(control.errors, key);
      }
    });

    return errors;
  }

  /**
   * Verifica si un formulario completo es válido
   */
  isFormValid(form: FormGroup): boolean {
    if (form.valid) {
      return true;
    }

    this.markAllFieldsAsTouched(form);
    return false;
  }

  /**
   * Resetea un formulario a su estado inicial
   */
  resetForm(form: FormGroup, initialValues?: any): void {
    form.reset(initialValues);
    this.clearFormErrors(form);
  }

  /**
   * Limpia los errores de validación de un formulario
   */
  clearFormErrors(form: FormGroup | FormArray): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.clearFormErrors(control);
      } else {
        control?.setErrors(null);
        control?.markAsUntouched();
        control?.markAsPristine();
      }
    });
  }

  /**
   * Aplica errores del servidor a los campos correspondientes
   */
  applyServerErrors(form: FormGroup, serverErrors: Record<string, string>): void {
    Object.keys(serverErrors).forEach(fieldName => {
      const control = form.get(fieldName);
      if (control) {
        control.setErrors({
          server: {
            message: serverErrors[fieldName]
          }
        });
        control.markAsTouched();
      }
    });
  }

  /**
   * Convierte los datos del formulario a formato para API
   */
  sanitizeFormData<T = any>(formValue: any): T {
    const sanitized: any = {};
    
    Object.keys(formValue).forEach(key => {
      const value = formValue[key];
      
      if (typeof value === 'string') {
        sanitized[key] = value.trim();
      } else if (value !== null && value !== undefined) {
        sanitized[key] = value;
      }
    });
    
    return sanitized as T;
  }

  /**
   * Crea un validador personalizado para duplicados
   */
  createDuplicateValidator(checkFn: (value: any) => boolean) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && checkFn(control.value)) {
        return {
          duplicate: {
            resource: 'Elemento',
            field: 'valor',
            value: control.value
          }
        };
      }
      return null;
    };
  }
}