import type { FabricRelation } from "./fabric.js";
import type { JSONObject, QSOObject } from "./qso-object.js";
export interface LocalFabricProvider {
    fabricRoot: string;
    fieldRoot: string;
    fieldRepo: string;
    fieldRepoUrl: string;
    fieldSiteUrl: string;
    contractModes: string[];
    itensorRunner: string | null;
    deterministicFallback: boolean;
}
export interface QSOFabricStatePayload {
    id: string;
    vector_real: number[];
    vector_imag: number[];
    phase: number;
    uncertainty: number;
    metadata: JSONObject;
}
export interface QSOFabricPatchPayload {
    id: string;
    domain: string;
    basis: string[];
    state: QSOFabricStatePayload;
    metadata: JSONObject;
}
export interface QSOFabricRestrictionPayload {
    id: string;
    source_patch: string;
    target_patch: string;
    projection_real: number[][];
    projection_imag: number[][];
    validation_rule: string;
    metadata: JSONObject;
}
export interface QSOFabricOverlapPayload {
    id: string;
    patch_a: string;
    patch_b: string;
    shared_domain: string[];
    restriction_a: QSOFabricRestrictionPayload;
    restriction_b: QSOFabricRestrictionPayload;
    metadata: JSONObject;
}
export interface QSOFabricPayload {
    id: string;
    patches: Record<string, QSOFabricPatchPayload>;
    overlaps: Record<string, QSOFabricOverlapPayload>;
    metadata: JSONObject;
}
export interface QSOFabricExecutionEnvelope {
    object_kind: "fabric";
    backend: "fabric_gluing";
    coherence_threshold: number;
    fabric_payload: QSOFabricPayload;
    metadata: JSONObject;
}
export interface BuildFabricPayloadInput {
    fabricId: string;
    objects: QSOObject[];
    relations?: FabricRelation[];
    provider?: LocalFabricProvider;
    metadata?: JSONObject;
}
export interface BuildFabricExecutionEnvelopeInput extends BuildFabricPayloadInput {
    coherenceThreshold?: number;
}
export declare function detectLocalFabricProvider(env?: NodeJS.ProcessEnv): LocalFabricProvider;
export declare function qsoObjectToFabricPatch(object: QSOObject): QSOFabricPatchPayload;
export declare function buildQSOFabricPayload(input: BuildFabricPayloadInput): QSOFabricPayload;
export declare function buildQSOFabricExecutionEnvelope(input: BuildFabricExecutionEnvelopeInput): QSOFabricExecutionEnvelope;
export declare function fabricPatchId(objectId: string): string;
