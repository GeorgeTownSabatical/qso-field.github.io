export function validateQSOObject(value) {
    const errors = [];
    if (!value || typeof value !== "object") {
        return { valid: false, errors: ["QSO object must be an object"] };
    }
    const object = value;
    if (object.qsoVersion !== "0.1")
        errors.push("qsoVersion must be 0.1");
    if (!object.objectId || typeof object.objectId !== "string")
        errors.push("objectId must be a string");
    if (!object.objectType || typeof object.objectType !== "string")
        errors.push("objectType must be a string");
    if (!object.createdAt || typeof object.createdAt !== "string")
        errors.push("createdAt must be a string");
    if (!object.updatedAt || typeof object.updatedAt !== "string")
        errors.push("updatedAt must be a string");
    if (!object.state || typeof object.state !== "object")
        errors.push("state must be an object");
    if (!object.confidence || typeof object.confidence !== "object")
        errors.push("confidence must be an object");
    if (object.confidence) {
        const score = object.confidence.score;
        if (typeof score !== "number" || score < 0 || score > 1) {
            errors.push("confidence.score must be a number between 0 and 1");
        }
    }
    if (!Array.isArray(object.provenance))
        errors.push("provenance must be an array");
    if (!Array.isArray(object.repairHistory))
        errors.push("repairHistory must be an array");
    return { valid: errors.length === 0, errors };
}
