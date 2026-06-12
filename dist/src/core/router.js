import { sha256 } from "./provenance.js";
export function scoreRoute(route, object) {
    const latencyScore = 1 / (1 + Math.max(0, route.latencyMs) / 100);
    const confidence = object?.confidence.score ?? 1;
    const repairPenalty = Math.max(0, Math.min(1, route.repairCost));
    return (route.coherence * 0.3 +
        route.trust * 0.25 +
        route.availability * 0.2 +
        latencyScore * 0.15 +
        confidence * 0.1 -
        repairPenalty * 0.2);
}
export function selectRoute(routes, object) {
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
export function createStateEnvelope(object, now = object.updatedAt) {
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
export function createStateExchangeSession(input) {
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
export function createRouteTelemetry(input) {
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
export function appendRouteTelemetry(session, telemetry, completedAt) {
    const terminalStatus = telemetry.eventType === "failed" ? "failed" : telemetry.eventType === "reconciled" ? "completed" : session.status;
    return {
        ...session,
        status: terminalStatus,
        ...(terminalStatus === "open" ? {} : { completedAt: completedAt ?? telemetry.timestamp }),
        telemetry: [...session.telemetry, telemetry],
    };
}
