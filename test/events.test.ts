import assert from "node:assert/strict";
import test from "node:test";
import {
  createLocalFabricBridgeFixture,
  createProviderExecutionEvent,
  createRouteTelemetry,
  createStateEnvelope,
  createStateExchangeSession,
  createQSOObject,
  eventHash,
  routeTelemetryToEvent,
  validateAvailability,
  validatorObservationToEvent,
} from "../src/index.js";

test("provider execution event records provider and fallback semantics", () => {
  const fixture = createLocalFabricBridgeFixture();
  const result = {
    fabric_id: "fabric.qso-field.fixture",
    healthy: true,
    global_coherence: 0.99,
  };

  const event = createProviderExecutionEvent({
    envelope: fixture.envelope,
    result,
    createdAt: "2026-06-12T00:00:00.000Z",
    metadata: { test: true },
  });

  assert.equal(event.event_type, "provider.execution");
  assert.equal(event.fabric_id, "fabric.qso-field.fixture");
  assert.equal(event.provider, "qso-fabric");
  assert.equal(event.backend, "fabric_gluing");
  assert.equal(event.deterministic_fallback, true);
  assert.equal(event.itensor_runner, null);
  assert.equal(event.result_hash, "sha256:849f076e2e8a6639e5ce6325801b383546087dae9e4a6d7cf6482eadb39c8036");
  assert.equal(event.metadata.test, true);
  assert.equal(eventHash(event), "sha256:04c61de9eb539761b6475055d0769575d9694a4014c29fa83eaaa2a9f622388f");
});

test("route telemetry converts to documented event shape", () => {
  const object = createQSOObject({
    objectId: "qso:field:event:route",
    objectType: "event.route",
    state: { phase: "route" },
    now: "2026-06-12T00:00:00.000Z",
  });
  const envelope = createStateEnvelope(object, "2026-06-12T00:00:01.000Z");
  const session = createStateExchangeSession({
    routeId: "local-fabric",
    envelopes: [envelope],
    startedAt: "2026-06-12T00:00:02.000Z",
  });
  const telemetry = createRouteTelemetry({
    envelopeId: envelope.envelopeId,
    routeId: "local-fabric",
    eventType: "sent",
    timestamp: "2026-06-12T00:00:03.000Z",
    latencyMs: 2,
  });

  const event = routeTelemetryToEvent({ sessionId: session.sessionId, telemetry });

  assert.equal(event.event_type, "route.telemetry");
  assert.equal(event.session_id, session.sessionId);
  assert.equal(event.envelope_id, envelope.envelopeId);
  assert.equal(event.route_id, "local-fabric");
  assert.equal(event.status, "sent");
  assert.equal(event.latency_ms, 2);
});

test("validator observation converts to event with reasons", () => {
  const observation = validateAvailability("qso:field:event:validator", false, "validator.test");
  const event = validatorObservationToEvent({
    observation,
    metadata: { source: "unit-test" },
  });

  assert.equal(event.event_type, "validator.observation");
  assert.equal(event.target_ref, "qso:field:event:validator");
  assert.equal(event.validator_ref, "validator.test");
  assert.equal(event.passed, false);
  assert.deepEqual(event.reasons, ["state unavailable"]);
  assert.equal(event.metadata.kind, "availability");
  assert.equal(event.metadata.source, "unit-test");
});
