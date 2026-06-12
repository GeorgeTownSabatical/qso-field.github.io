import type { QSOObject } from "./qso-object.js";
export interface ValidatorObservation {
    validatorId: string;
    subjectId: string;
    kind: "state" | "provenance" | "repair" | "availability" | "coherence";
    passed: boolean;
    score: number;
    message: string;
    observedAt: string;
}
export declare function validateStateObject(object: QSOObject, validatorId?: string): ValidatorObservation;
export declare function validateAvailability(subjectId: string, available: boolean, validatorId?: string): ValidatorObservation;
export declare function combineValidatorObservations(observations: ValidatorObservation[]): ValidatorObservation;
