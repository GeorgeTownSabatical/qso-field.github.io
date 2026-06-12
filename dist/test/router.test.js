import assert from "node:assert/strict";
import test from "node:test";
import { appendRouteTelemetry, createConfidence, createProvenanceRecord, createQSOObject, createRouteTelemetry, createStateEnvelope, createStateExchangeSession, } from "../src/index.js";
test("state envelope captures routing metadata from qso object", () => {
    const object = createQSOObject({
        objectId: "qso:field:router:001",
        objectType: "router.fixture",
        now: "2026-06-11T00:00:00.000Z",
        state: { phase: "route", value: 7 },
        confidence: createConfidence(0.86, "fixture"),
        provenance: [
            createProvenanceRecord({
                source: "router.test",
                value: { input: true },
                recordedAt: "2026-06-11T00:00:00.000Z",
            }),
        ],
        synchronization: {
            sessionId: "session.prior",
            sequence: 2,
        },
    });
    const envelope = createStateEnvelope(object, "2026-06-11T00:00:01.000Z");
    assert.equal(envelope.objectId, object.objectId);
    assert.equal(envelope.objectType, "router.fixture");
    assert.equal(envelope.confidenceScore, 0.86);
    assert.equal(envelope.provenanceRefs.length, 1);
    assert.equal(envelope.synchronization.sessionId, "session.prior");
    assert.equal(envelope.payloadHash, "sha256:d43343eb81cc07be577f00f20806fc01a08717010b9d094ef1e06e6badf29b6d");
});
test("state exchange session and telemetry are deterministic for fixed inputs", () => {
    const object = createQSOObject({
        objectId: "qso:field:router:002",
        objectType: "router.fixture",
        now: "2026-06-11T00:00:00.000Z",
        state: { phase: "queued" },
    });
    const envelope = createStateEnvelope(object, "2026-06-11T00:00:01.000Z");
    const first = createStateExchangeSession({
        routeId: "local-fabric",
        envelopes: [envelope],
        startedAt: "2026-06-11T00:00:02.000Z",
    });
    const second = createStateExchangeSession({
        routeId: "local-fabric",
        envelopes: [envelope],
        startedAt: "2026-06-11T00:00:02.000Z",
    });
    const telemetry = createRouteTelemetry({
        envelopeId: envelope.envelopeId,
        routeId: "local-fabric",
        eventType: "sent",
        timestamp: "2026-06-11T00:00:03.000Z",
        latencyMs: 1,
    });
    assert.deepEqual(second, first);
    assert.equal(first.status, "open");
    assert.equal(telemetry.eventType, "sent");
    assert.equal(telemetry.latencyMs, 1);
});
test("route telemetry append returns completed or failed session without mutating input", () => {
    const object = createQSOObject({
        objectId: "qso:field:router:003",
        objectType: "router.fixture",
        now: "2026-06-11T00:00:00.000Z",
        state: { phase: "reconcile" },
    });
    const envelope = createStateEnvelope(object, "2026-06-11T00:00:01.000Z");
    const session = createStateExchangeSession({
        routeId: "local-fabric",
        envelopes: [envelope],
        startedAt: "2026-06-11T00:00:02.000Z",
    });
    const reconciled = createRouteTelemetry({
        envelopeId: envelope.envelopeId,
        routeId: "local-fabric",
        eventType: "reconciled",
        timestamp: "2026-06-11T00:00:04.000Z",
    });
    const completed = appendRouteTelemetry(session, reconciled);
    const failedTelemetry = createRouteTelemetry({
        envelopeId: envelope.envelopeId,
        routeId: "local-fabric",
        eventType: "failed",
        timestamp: "2026-06-11T00:00:05.000Z",
    });
    const failed = appendRouteTelemetry(session, failedTelemetry);
    assert.equal(session.status, "open");
    assert.equal(session.telemetry.length, 0);
    assert.equal(completed.status, "completed");
    assert.equal(completed.completedAt, "2026-06-11T00:00:04.000Z");
    assert.equal(completed.telemetry.length, 1);
    assert.equal(failed.status, "failed");
    assert.equal(failed.completedAt, "2026-06-11T00:00:05.000Z");
});
