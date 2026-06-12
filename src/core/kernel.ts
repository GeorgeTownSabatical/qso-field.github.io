import { randomBytes } from "node:crypto";
import type { Confidence, JSONObject, ProvenanceRecord, QSOObject } from "./qso-object.js";
import { sha256 } from "./provenance.js";

export type KernelObjectType =
  | "qso"
  | "worldline"
  | "state_frame"
  | "hyperedge"
  | "morphism"
  | "branch"
  | "runtime_projection"
  | "kernel_event";

export type KernelEventType =
  | "create"
  | "observe"
  | "morph"
  | "fork"
  | "merge"
  | "repair"
  | "migrate"
  | "project_runtime"
  | "commit_branch"
  | "reject_branch"
  | "archive";

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
  roles: Array<{ role: string; qsoId: string }>;
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

export function createMorphism<TPayload extends JSONObject>(input: {
  morphismId: string;
  name: string;
  apply: (payload: TPayload) => TPayload;
  description?: string;
  policyRefs?: string[];
  cost?: number;
}): Morphism<TPayload> {
  return {
    type: "morphism",
    morphismId: input.morphismId,
    name: input.name,
    apply: input.apply,
    ...(input.description ? { description: input.description } : {}),
    policyRefs: input.policyRefs ?? [],
    cost: input.cost ?? 0,
  };
}

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

export function createKernelId(prefix: string, seed?: unknown): string {
  const entropy = seed === undefined ? randomBytes(16).toString("hex") : sha256(seed).slice("sha256:".length, 32);
  return `${prefix}_${entropy}`;
}

export function createTrustVector(confidence: Confidence): TrustVector {
  return {
    id: createKernelId("trust", confidence),
    confidence: confidence.score,
    provenance: confidence.method === "declared" ? 0.6 : 0.8,
    availability: 1,
    repair: 1,
  };
}

export function createEntropyReport(input?: Partial<Omit<EntropyReport, "id">>): EntropyReport {
  const report = {
    contradictionCount: input?.contradictionCount ?? 0,
    repairDebt: input?.repairDebt ?? 0,
    confidenceDrift: input?.confidenceDrift ?? 0,
  };
  return { id: createKernelId("entropy", report), ...report };
}

export function createStateFrame<TPayload extends JSONObject>(input: {
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
}): StateFrame<TPayload> {
  const frameWithoutHash = {
    type: "state_frame" as const,
    frameId: createKernelId("frame", {
      qsoId: input.qsoId,
      sequence: input.sequence,
      payload: input.payload,
      previousFrameHash: input.previousFrameHash ?? null,
    }),
    qsoId: input.qsoId,
    worldlineId: input.worldlineId,
    sequence: input.sequence,
    payload: input.payload,
    memoryRefs: input.memoryRefs ?? [],
    goalVector: input.goalVector ?? {},
    policyRefs: input.policyRefs ?? [],
    resourceState: input.resourceState ?? {},
    trustVector: input.trustVector,
    entropyReport: input.entropyReport ?? createEntropyReport(),
    previousFrameHash: input.previousFrameHash ?? null,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };

  return {
    ...frameWithoutHash,
    frameHash: sha256(frameWithoutHash),
  };
}

export function createKernelRecord<TPayload extends JSONObject>(object: QSOObject<TPayload>): KernelRecord<TPayload> {
  const qsoId = createKernelId("qso", object.objectId);
  const worldlineId = createKernelId("wl", { qsoId, objectId: object.objectId });
  const trustVector = createTrustVector(object.confidence);
  const frame = createStateFrame({
    qsoId,
    worldlineId,
    sequence: 0,
    payload: object.state,
    trustVector,
    createdAt: object.createdAt,
  });
  const event: KernelEvent = {
    type: "kernel_event",
    eventId: createKernelId("evt", { qsoId, frameId: frame.frameId, eventType: "create" }),
    eventType: "create",
    qsoId,
    frameId: frame.frameId,
    timestamp: object.createdAt,
    provenance: object.provenance[0],
    metadata: { objectId: object.objectId, objectType: object.objectType },
  };
  const worldline: Worldline = {
    type: "worldline",
    worldlineId,
    rootQsoId: qsoId,
    parentWorldlineId: null,
    forkedFromFrameId: null,
    events: [event],
  };

  return {
    type: "qso",
    kernelVersion: "0.1.0",
    qsoId,
    worldlineId,
    species: object.objectType,
    genome: object.extensions,
    currentStateHash: frame.frameHash,
    currentFrameId: frame.frameId,
    trustVector,
    policyRefs: [],
    resourceEnvelope: {},
    provenanceHead: object.provenance[0]?.hash ?? sha256(object),
    createdAt: object.createdAt,
    updatedAt: object.updatedAt,
    object,
    worldline,
  };
}

export function createBranch<TPayload extends JSONObject>(input: {
  record: KernelRecord<TPayload>;
  parentFrame: StateFrame<TPayload>;
  morphism: Morphism<TPayload>;
  score: number;
  rationale: string[];
}): Branch<TPayload> {
  const candidatePayload = input.morphism.apply(input.parentFrame.payload);
  const candidateFrame = createStateFrame({
    qsoId: input.record.qsoId,
    worldlineId: input.record.worldlineId,
    sequence: input.parentFrame.sequence + 1,
    payload: candidatePayload,
    previousFrameHash: input.parentFrame.frameHash,
    trustVector: input.record.trustVector,
  });

  return {
    type: "branch",
    branchId: createKernelId("branch", {
      parentFrameId: input.parentFrame.frameId,
      morphismId: input.morphism.morphismId,
      candidateHash: candidateFrame.frameHash,
    }),
    qsoId: input.record.qsoId,
    parentFrameId: input.parentFrame.frameId,
    candidateFrame,
    morphismId: input.morphism.morphismId,
    score: input.score,
    status: "candidate",
    rationale: input.rationale,
  };
}

export function commitBranch<TPayload extends JSONObject>(
  record: KernelRecord<TPayload>,
  branch: Branch<TPayload>,
  timestamp = new Date().toISOString(),
): KernelRecord<TPayload> {
  const event: KernelEvent = {
    type: "kernel_event",
    eventId: createKernelId("evt", { branchId: branch.branchId, eventType: "commit_branch" }),
    eventType: "commit_branch",
    qsoId: record.qsoId,
    frameId: branch.candidateFrame.frameId,
    timestamp,
    metadata: { branchId: branch.branchId, score: branch.score, rationale: branch.rationale },
  };

  return {
    ...record,
    currentStateHash: branch.candidateFrame.frameHash,
    currentFrameId: branch.candidateFrame.frameId,
    updatedAt: timestamp,
    object: {
      ...record.object,
      state: branch.candidateFrame.payload,
      updatedAt: timestamp,
    },
    worldline: {
      ...record.worldline,
      events: [...record.worldline.events, event],
    },
  };
}
