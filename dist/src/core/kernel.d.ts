import type { Confidence, JSONObject, ProvenanceRecord, QSOObject } from "./qso-object.js";
export type KernelObjectType = "qso" | "worldline" | "state_frame" | "hyperedge" | "morphism" | "branch" | "runtime_projection" | "kernel_event";
export type KernelEventType = "create" | "observe" | "morph" | "fork" | "merge" | "repair" | "migrate" | "project_runtime" | "commit_branch" | "reject_branch" | "archive";
export interface KernelEvent {
    type: "kernel_event";
    eventId: string;
    eventType: KernelEventType;
    qsoId: string;
    frameId?: string;
    timestamp: string;
    provenance?: ProvenanceRecord;
    metadata: JSONObject;
}
export interface Worldline {
    type: "worldline";
    worldlineId: string;
    rootQsoId: string;
    parentWorldlineId: string | null;
    forkedFromFrameId: string | null;
    events: KernelEvent[];
}
export interface TrustVector {
    id: string;
    confidence: number;
    provenance: number;
    availability: number;
    repair: number;
}
export interface EntropyReport {
    id: string;
    contradictionCount: number;
    repairDebt: number;
    confidenceDrift: number;
}
export interface StateFrame<TPayload extends JSONObject = JSONObject> {
    type: "state_frame";
    frameId: string;
    qsoId: string;
    worldlineId: string;
    sequence: number;
    payload: TPayload;
    memoryRefs: string[];
    goalVector: JSONObject;
    policyRefs: string[];
    resourceState: JSONObject;
    trustVector: TrustVector;
    entropyReport: EntropyReport;
    previousFrameHash: string | null;
    frameHash: string;
    createdAt: string;
}
export interface Hyperedge {
    type: "hyperedge";
    hyperedgeId: string;
    roles: Array<{
        role: string;
        qsoId: string;
    }>;
    relation: string;
    weight: number;
    metadata: JSONObject;
}
export interface Morphism<TPayload extends JSONObject = JSONObject> {
    type: "morphism";
    morphismId: string;
    name: string;
    description?: string;
    apply: (payload: TPayload) => TPayload;
    policyRefs: string[];
    cost: number;
}
export declare function createMorphism<TPayload extends JSONObject>(input: {
    morphismId: string;
    name: string;
    apply: (payload: TPayload) => TPayload;
    description?: string;
    policyRefs?: string[];
    cost?: number;
}): Morphism<TPayload>;
export interface Branch<TPayload extends JSONObject = JSONObject> {
    type: "branch";
    branchId: string;
    qsoId: string;
    parentFrameId: string;
    candidateFrame: StateFrame<TPayload>;
    morphismId: string;
    score: number;
    status: "candidate" | "committed" | "rejected";
    rationale: string[];
}
export interface RuntimeProjectionRequest {
    qsoId: string;
    frameId: string;
    substrate: "local" | "container" | "agent" | "external";
    resourceEnvelope: JSONObject;
    purpose: string;
}
export interface RuntimeProjection {
    type: "runtime_projection";
    projectionId: string;
    request: RuntimeProjectionRequest;
    status: "requested" | "allowed" | "denied" | "completed";
    result?: JSONObject;
    createdAt: string;
    completedAt?: string;
}
export interface KernelRecord<TPayload extends JSONObject = JSONObject> {
    type: "qso";
    kernelVersion: "0.1.0";
    qsoId: string;
    worldlineId: string;
    species: string;
    genome: JSONObject;
    currentStateHash: string;
    currentFrameId: string;
    trustVector: TrustVector;
    policyRefs: string[];
    resourceEnvelope: JSONObject;
    provenanceHead: string;
    createdAt: string;
    updatedAt: string;
    object: QSOObject<TPayload>;
    worldline: Worldline;
}
export declare function createKernelId(prefix: string, seed?: unknown): string;
export declare function createTrustVector(confidence: Confidence): TrustVector;
export declare function createEntropyReport(input?: Partial<Omit<EntropyReport, "id">>): EntropyReport;
export declare function createStateFrame<TPayload extends JSONObject>(input: {
    qsoId: string;
    worldlineId: string;
    sequence: number;
    payload: TPayload;
    previousFrameHash?: string | null;
    trustVector: TrustVector;
    entropyReport?: EntropyReport;
    memoryRefs?: string[];
    goalVector?: JSONObject;
    policyRefs?: string[];
    resourceState?: JSONObject;
    createdAt?: string;
}): StateFrame<TPayload>;
export declare function createKernelRecord<TPayload extends JSONObject>(object: QSOObject<TPayload>): KernelRecord<TPayload>;
export declare function createBranch<TPayload extends JSONObject>(input: {
    record: KernelRecord<TPayload>;
    parentFrame: StateFrame<TPayload>;
    morphism: Morphism<TPayload>;
    score: number;
    rationale: string[];
}): Branch<TPayload>;
export declare function commitBranch<TPayload extends JSONObject>(record: KernelRecord<TPayload>, branch: Branch<TPayload>, timestamp?: string): KernelRecord<TPayload>;
