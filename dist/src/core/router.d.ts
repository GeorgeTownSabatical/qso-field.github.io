import type { QSOObject } from "./qso-object.js";
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
    ranked: Array<RouteCandidate & {
        score: number;
    }>;
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
    repairRecords: Array<{
        repairedAt: string;
        reason: string;
        method: string;
        previousHash?: string;
    }>;
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
export declare function scoreRoute(route: RouteCandidate, object?: QSOObject): number;
export declare function selectRoute(routes: RouteCandidate[], object?: QSOObject): RouteDecision;
export declare function createStateEnvelope(object: QSOObject, now?: string): StateEnvelope;
export declare function createStateExchangeSession(input: {
    routeId: string;
    envelopes: StateEnvelope[];
    startedAt?: string;
    metadata?: Record<string, unknown>;
}): StateExchangeSession;
export declare function createRouteTelemetry(input: {
    envelopeId: string;
    routeId: string;
    eventType: RouteTelemetryEventType;
    timestamp?: string;
    latencyMs?: number;
    metadata?: Record<string, unknown>;
}): RouteTelemetry;
export declare function appendRouteTelemetry(session: StateExchangeSession, telemetry: RouteTelemetry, completedAt?: string): StateExchangeSession;
