import type { QSOObject } from "./qso-object.js";
import { sha256 } from "./provenance.js";

export interface RouteCandidate {
  routeId: string;
  transport: "quic" | "wireguard" | "ipv6" | "mqtt" | "nats" | "kafka" | "grpc" | "local";
  latencyMs: number;
  availability: number;
  trust: number;
  coherence: number;
  repairCost: number;
  metadata?: Record<string, unknown>;
}

export interface RouteDecision {
  selected: RouteCandidate;
  score: number;
  ranked: Array<RouteCandidate & { score: number }>;
  reasons: string[];
}

export type RouteTelemetryEventType = "queued" | "sent" | "received" | "reconciled" | "failed";

export interface StateEnvelope {
  envelopeId: string;
  objectId: string;
  objectType: string;
  provenanceRefs: string[];
  confidenceScore: number;
  createdAt: string;
  updatedAt: string;
  repairRecords: Array<{ repairedAt: string; reason: string; method: string; previousHash?: string }>;
  synchronization: Record<string, unknown>;
  payloadHash: string;
  metadata: Record<string, unknown>;
}

export interface RouteTelemetry {
  telemetryId: string;
  envelopeId: string;
  routeId: string;
  eventType: RouteTelemetryEventType;
  timestamp: string;
  latencyMs?: number;
  metadata: Record<string, unknown>;
}

export interface StateExchangeSession {
  sessionId: string;
  routeId: string;
  envelopeIds: string[];
  status: "open" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
  telemetry: RouteTelemetry[];
  metadata: Record<string, unknown>;
}

export function scoreRoute(route: RouteCandidate, object?: QSOObject): number {
  const latencyScore = 1 / (1 + Math.max(0, route.latencyMs) / 100);
  const confidence = object?.confidence.score ?? 1;
  const repairPenalty = Math.max(0, Math.min(1, route.repairCost));
  return (
    route.coherence * 0.3 +
    route.trust * 0.25 +
    route.availability * 0.2 +
    latencyScore * 0.15 +
    confidence * 0.1 -
    repairPenalty * 0.2
  );
}

export function selectRoute(routes: RouteCandidate[], object?: QSOObject): RouteDecision {
  if (routes.length === 0) {
    throw new Error("at least one route candidate is required");
  }

  const ranked = routes
    .map((route) => ({ ...route, score: scoreRoute(route, object) }))
    .sort((a, b) => b.score - a.score || a.routeId.localeCompare(b.routeId));
  const selected = ranked[0];

  return {
    selected,
    score: selected.score,
    ranked,
    reasons: [
      `selected ${selected.routeId}`,
      `coherence=${selected.coherence}`,
      `trust=${selected.trust}`,
      `availability=${selected.availability}`,
    ],
  };
}

export function createStateEnvelope(object: QSOObject, now = object.updatedAt): StateEnvelope {
  const payloadHash = sha256(object.state);
  return {
    envelopeId: `envelope.${sha256({ objectId: object.objectId, payloadHash, now }).slice("sha256:".length, "sha256:".length + 16)}`,
    objectId: object.objectId,
    objectType: object.objectType,
    provenanceRefs: object.provenance.map((record) => record.hash ?? sha256(record)),
    confidenceScore: object.confidence.score,
    createdAt: now,
    updatedAt: object.updatedAt,
    repairRecords: object.repairHistory.map((record) => ({ ...record })),
    synchronization: { ...object.synchronization },
    payloadHash,
    metadata: {
      qsoVersion: object.qsoVersion,
      confidenceMethod: object.confidence.method,
    },
  };
}

export function createStateExchangeSession(input: {
  routeId: string;
  envelopes: StateEnvelope[];
  startedAt?: string;
  metadata?: Record<string, unknown>;
}): StateExchangeSession {
  const startedAt = input.startedAt ?? new Date().toISOString();
  const envelopeIds = input.envelopes.map((envelope) => envelope.envelopeId).sort();
  return {
    sessionId: `session.${sha256({ routeId: input.routeId, envelopeIds, startedAt }).slice("sha256:".length, "sha256:".length + 16)}`,
    routeId: input.routeId,
    envelopeIds,
    status: "open",
    startedAt,
    telemetry: [],
    metadata: input.metadata ?? {},
  };
}

export function createRouteTelemetry(input: {
  envelopeId: string;
  routeId: string;
  eventType: RouteTelemetryEventType;
  timestamp?: string;
  latencyMs?: number;
  metadata?: Record<string, unknown>;
}): RouteTelemetry {
  const timestamp = input.timestamp ?? new Date().toISOString();
  return {
    telemetryId: `telemetry.${sha256({ ...input, timestamp }).slice("sha256:".length, "sha256:".length + 16)}`,
    envelopeId: input.envelopeId,
    routeId: input.routeId,
    eventType: input.eventType,
    timestamp,
    ...(input.latencyMs === undefined ? {} : { latencyMs: input.latencyMs }),
    metadata: input.metadata ?? {},
  };
}

export function appendRouteTelemetry(
  session: StateExchangeSession,
  telemetry: RouteTelemetry,
  completedAt?: string,
): StateExchangeSession {
  const terminalStatus =
    telemetry.eventType === "failed" ? "failed" : telemetry.eventType === "reconciled" ? "completed" : session.status;
  return {
    ...session,
    status: terminalStatus,
    ...(terminalStatus === "open" ? {} : { completedAt: completedAt ?? telemetry.timestamp }),
    telemetry: [...session.telemetry, telemetry],
  };
}
