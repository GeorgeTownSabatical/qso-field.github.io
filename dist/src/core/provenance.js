import { createHash } from "node:crypto";
export function stableStringify(value) {
    if (value === null || typeof value !== "object")
        return JSON.stringify(value);
    if (Array.isArray(value)) {
        return `[${value.map(stableStringify).join(",")}]`;
    }
    const object = value;
    return `{${Object.keys(object)
        .sort()
        .map((key) => `${JSON.stringify(key)}:${stableStringify(object[key])}`)
        .join(",")}}`;
}
export function sha256(value) {
    return `sha256:${createHash("sha256").update(stableStringify(value)).digest("hex")}`;
}
export function createProvenanceRecord(input) {
    return {
        source: input.source,
        hash: input.value === undefined ? undefined : sha256(input.value),
        recordedAt: input.recordedAt ?? new Date().toISOString(),
        ...(input.description ? { description: input.description } : {}),
    };
}
export function withProvenance(object, record) {
    return {
        ...object,
        updatedAt: new Date().toISOString(),
        provenance: [...object.provenance, record],
    };
}
