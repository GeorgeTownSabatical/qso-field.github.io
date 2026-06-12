import type { QSOObject } from "./qso-object.js";
import { validateQSOObject, type ValidationResult } from "./schema.js";

export interface ValidatorObservation {
  validatorId: string;
  subjectId: string;
  kind: "state" | "provenance" | "repair" | "availability" | "coherence";
  passed: boolean;
  score: number;
  message: string;
  observedAt: string;
}

export function validateStateObject(object: QSOObject, validatorId = "local.validator"): ValidatorObservation {
  const result: ValidationResult = validateQSOObject(object);
  return {
    validatorId,
    subjectId: object.objectId,
    kind: "state",
    passed: result.valid,
    score: result.valid ? 1 : Math.max(0, 1 - result.errors.length * 0.2),
    message: result.valid ? "QSO object schema valid" : result.errors.join("; "),
    observedAt: new Date().toISOString(),
  };
}

export function validateAvailability(subjectId: string, available: boolean, validatorId = "local.validator"): ValidatorObservation {
  return {
    validatorId,
    subjectId,
    kind: "availability",
    passed: available,
    score: available ? 1 : 0,
    message: available ? "state available" : "state unavailable",
    observedAt: new Date().toISOString(),
  };
}

export function combineValidatorObservations(observations: ValidatorObservation[]): ValidatorObservation {
  if (observations.length === 0) {
    throw new Error("at least one validator observation is required");
  }
  const score = observations.reduce((sum, observation) => sum + observation.score, 0) / observations.length;
  return {
    validatorId: "aggregate",
    subjectId: observations[0].subjectId,
    kind: "coherence",
    passed: observations.every((observation) => observation.passed),
    score,
    message: `combined ${observations.length} validator observations`,
    observedAt: new Date().toISOString(),
  };
}
