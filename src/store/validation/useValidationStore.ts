import { defineStore } from "pinia";

export interface ValidationErrors {
  [key: string]: string[];
}

export const useValidationStore = defineStore("validation", {
    state: () => {
        return { 
          validatorError: null as ValidationErrors | null 
        };
    },
    getters: {
        getValidatorError(): ValidationErrors | null {
            return this.validatorError;
        },
        getFieldError(): (fieldName: string) => string[] {
            return (fieldName: string) => {
                return this.validatorError?.[fieldName] || [];
            };
        },
        hasFieldError(): (fieldName: string) => boolean {
            return (fieldName: string) => {
                return !!(this.validatorError?.[fieldName]?.length);
            };
        }
    },
    actions: {
        setValidatorError(errors: ValidationErrors | null): void {
            this.validatorError = errors;
        },
        setFieldError(fieldName: string, error: string): void {
            if (!this.validatorError) {
                this.validatorError = {};
            }
            this.validatorError[fieldName] = [error];
        },
        clearValidatorError(): void {
            this.validatorError = null;
        },
        clearFieldError(fieldName: string): void {
            if (this.validatorError && this.validatorError[fieldName]) {
                delete this.validatorError[fieldName];
                
                // Si no quedan errores, limpiar completamente
                if (Object.keys(this.validatorError).length === 0) {
                    this.validatorError = null;
                }
            }
        }
    },
    persist: {
        storage: sessionStorage,
        pick: ['validatorError'], // Only persist the validatorError property
    },
});
