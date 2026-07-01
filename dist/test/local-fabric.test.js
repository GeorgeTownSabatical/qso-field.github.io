import assert from "node:assert/strict";
import test from "node:test";
import { buildQSOFabricExecutionEnvelope, buildQSOFabricPayload, createLocalFabricBridgeFixture, createConfidence, createProvenanceRecord, createQSOObject, detectLocalFabricProvider, fabricPatchId, qsoObjectToFabricPatch, } from "../src/index.js";
test("local fabric provider defaults to deterministic fallback and canonical field roots", () => {
    const provider = detectLocalFabricProvider({});
    assert.equal(provider.fabricRoot, "/Users/ALISTAIRE/qso-fabric");
    assert.equal(provider.fieldRoot, "/Users/ALISTAIRE/qso-field");
    assert.equal(provider.fieldRepo, "aevespers2/qso-field.github.io");
    assert.equal(provider.fieldSiteUrl, "https://vespersinc.com/");
    assert.equal(provider.deterministicFallback, true);
    assert.deepEqual(provider.contractModes, ["smart", "genius"]);
});
test("qso field object converts to qso-fabric patch payload", () => {
    const object = createQSOObject({
        objectId: "qso:field:bridge:001",
        objectType: "bridge.demo",
        now: "2026-06-11T00:00:00.000Z",
        state: { phase: "ready", value: 3 },
        confidence: createConfidence(0.8, "fixture"),
        provenance: [
            createProvenanceRecord({
                source: "test.bridge",
                value: { fixture: true },
                recordedAt: "2026-06-11T00:00:00.000Z",
            }),
        ],
        extensions: {
            contradictionDensity: 0.2,
        },
    });
    const patch = qsoObjectToFabricPatch(object);
    assert.equal(patch.id, fabricPatchId(object.objectId));
    assert.equal(patch.domain, "bridge.demo");
    assert.deepEqual(patch.basis, ["|confidence>", "|support>"]);
    assert.deepEqual(patch.state.vector_real, [0.8, 0.8666666666666667]);
    assert.deepEqual(patch.state.vector_imag, [0, 0]);
    assert.equal(patch.state.uncertainty, 0.2);
    assert.equal(patch.state.metadata.qso_field_object_id, object.objectId);
    assert.equal(patch.state.metadata.continuity_role, "field_patch");
    assert.equal(patch.metadata.state_hash, "sha256:22517d5aa767d62b1bfe4ef93d5545d71b0e354d0f9043c4fd3beb80ff617a89");
});
test("bridge builds deterministic qso-fabric execution envelope", () => {
    const left = createQSOObject({
        objectId: "qso:field:bridge:left",
        objectType: "bridge.left",
        now: "2026-06-11T00:00:00.000Z",
        state: { phase: "left" },
        confidence: createConfidence(0.9, "fixture"),
    });
    const right = createQSOObject({
        objectId: "qso:field:bridge:right",
        objectType: "bridge.right",
        now: "2026-06-11T00:00:00.000Z",
        state: { phase: "right" },
        confidence: createConfidence(0.7, "fixture"),
    });
    const relation = {
        from: left.objectId,
        to: right.objectId,
        semanticDistance: 0.1,
        temporalDistance: 0.05,
        goalDistance: 0.2,
        trustDistance: 0.1,
    };
    const payload = buildQSOFabricPayload({
        fabricId: "fabric.qso-field.bridge",
        objects: [left, right],
        relations: [relation],
        provider: detectLocalFabricProvider({ QSO_ITENSOR_RUNNER: "/tmp/itensor-runner" }),
    });
    const envelope = buildQSOFabricExecutionEnvelope({
        fabricId: "fabric.qso-field.bridge",
        objects: [left, right],
        relations: [relation],
        coherenceThreshold: 0.9,
    });
    assert.equal(Object.keys(payload.patches).length, 2);
    assert.equal(Object.keys(payload.overlaps).length, 1);
    assert.equal(payload.metadata.deterministic_fallback, false);
    assert.equal(envelope.object_kind, "fabric");
    assert.equal(envelope.backend, "fabric_gluing");
    assert.equal(envelope.coherence_threshold, 0.9);
    assert.equal(envelope.fabric_payload.id, "fabric.qso-field.bridge");
    assert.equal(envelope.metadata.execute_with, "services.quantum.fabric.runtime.execute_fabric_payload");
});
test("local fabric bridge fixture emits a runnable fabric envelope", () => {
    const fixture = createLocalFabricBridgeFixture();
    const envelope = fixture.envelope;
    assert.equal(fixture.objects.length, 2);
    assert.equal(fixture.relations.length, 1);
    assert.equal(envelope.object_kind, "fabric");
    assert.equal(envelope.backend, "fabric_gluing");
    assert.equal(envelope.fabric_payload.id, "fabric.qso-field.fixture");
    assert.equal(envelope.fabric_payload.metadata.fixture, "local-fabric-bridge");
    assert.equal(Object.keys(envelope.fabric_payload.patches).length, 2);
    assert.equal(Object.keys(envelope.fabric_payload.overlaps).length, 1);
});
