import type { ProvenanceRecord, QSOObject } from "./qso-object.js";
export declare function stableStringify(value: unknown): string;
export declare function sha256(value: unknown): string;
export interface CreateProvenanceInput {
    source: string;
    value?: unknown;
    description?: string;
    recordedAt?: string;
}
export declare function createProvenanceRecord(input: CreateProvenanceInput): ProvenanceRecord;
export declare function withProvenance<T extends QSOObject>(object: T, record: ProvenanceRecord): T;
