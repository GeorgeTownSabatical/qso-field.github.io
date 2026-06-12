import { validateQSOObject } from "./schema.js";
export function validateStateObject(object, validatorId = "local.validator") {
    const result = validateQSOObject(object);
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
export function validateAvailability(subjectId, available, validatorId = "local.validator") {
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
export function combineValidatorObservations(observations) {
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
