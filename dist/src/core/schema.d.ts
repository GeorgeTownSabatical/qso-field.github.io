export interface ValidationResult {
    valid: boolean;
    errors: string[];
}
export declare function validateQSOObject(value: unknown): ValidationResult;
