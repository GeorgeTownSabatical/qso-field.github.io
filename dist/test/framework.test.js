import assert from "node:assert/strict";
import test from "node:test";
import { appendChainRecord, combineValidatorObservations, commitBranch, createBranch, createConfidence, createKernelRecord, createMorphism, createProvenanceRecord, createQSOObject, deriveContractContext, evaluateFabric, executeContract, selectRoute, validateStateObject, verifyProofOfCoherence, } from "../src/index.js";
test("framework moves QSO state through contract, route, fabric, chain, and validators", () => {
    const object = createQSOObject({
        objectId: "qso:field:framework:001",
        objectType: "framework.demo",
        now: "2026-06-10T00:00:00.000Z",
        state: {
            phase: "draft",
            value: 1,
        },
        confidence: createConfidence(0.92, "fixture"),
        provenance: [
            createProvenanceRecord({
                source: "test.fixture",
                value: { fixture: "framework" },
                recordedAt: "2026-06-10T00:00:00.000Z",
            }),
        ],
        extensions: {
            contradictionDensity: 0.05,
            trainingTraceScore: 0.88,
        },
    });
    const smartContract = {
        mode: "smart",
        contractId: "contract.smart.promote",
        description: "Promote a framework object into candidate state.",
        execute: (state) => ({ ...state, phase: "candidate", value: Number(state.value) + 1 }),
        validate: (state) => (state.phase === "candidate" ? [] : ["phase must be candidate"]),
    };
    const smartResult = executeContract(object, smartContract);
    assert.equal(smartResult.accepted, true);
    assert.equal(smartResult.object.state.phase, "candidate");
    const geniusContract = {
        mode: "genius",
        contractId: "contract.genius.commit",
        description: "Commit only when fabric context has enough trust.",
        threshold: 0.7,
        propose: (state, context) => ({
            ...state,
            phase: "committed",
            trustScore: context.trustScore,
        }),
    };
    const geniusResult = executeContract(smartResult.object, geniusContract, deriveContractContext(smartResult.object));
    assert.equal(geniusResult.accepted, true);
    assert.equal(geniusResult.object.state.phase, "committed");
    const route = selectRoute([
        { routeId: "slow-untrusted", transport: "mqtt", latencyMs: 220, availability: 0.7, trust: 0.4, coherence: 0.5, repairCost: 0.4 },
        { routeId: "local-fabric", transport: "local", latencyMs: 1, availability: 1, trust: 0.96, coherence: 0.97, repairCost: 0.02 },
    ], geniusResult.object);
    assert.equal(route.selected.routeId, "local-fabric");
    const fabric = evaluateFabric([object, geniusResult.object], [
        {
            from: object.objectId,
            to: geniusResult.object.objectId,
            semanticDistance: 0.1,
            temporalDistance: 0.05,
            goalDistance: 0.08,
            trustDistance: 0.03,
        },
    ]);
    assert.ok(fabric.globalCoherence > 0.85);
    assert.ok(fabric.confidenceMean > 0.9);
    const record = createKernelRecord(geniusResult.object);
    const morphism = createMorphism({
        morphismId: "morphism.framework.mark-routed",
        name: "mark routed",
        apply: (state) => ({ ...state, routedVia: route.selected.routeId }),
        policyRefs: ["policy.local-fabric"],
        cost: 0.1,
    });
    const parentFrame = {
        type: "state_frame",
        frameId: record.currentFrameId,
        qsoId: record.qsoId,
        worldlineId: record.worldlineId,
        sequence: 0,
        payload: record.object.state,
        memoryRefs: [],
        goalVector: {},
        policyRefs: [],
        resourceState: {},
        trustVector: record.trustVector,
        entropyReport: { id: "entropy.test", contradictionCount: 0, repairDebt: 0, confidenceDrift: 0 },
        previousFrameHash: null,
        frameHash: record.currentStateHash,
        createdAt: record.createdAt,
    };
    const branch = createBranch({ record, parentFrame, morphism, score: fabric.globalCoherence, rationale: route.reasons });
    const committed = commitBranch(record, branch, "2026-06-10T00:00:01.000Z");
    assert.equal(committed.object.state.routedVia, "local-fabric");
    assert.equal(committed.worldline.events.at(-1)?.eventType, "commit_branch");
    const chain = [appendChainRecord([], committed.worldline.events[0])];
    const updatedChain = [...chain, appendChainRecord(chain, committed.worldline.events.at(-1))];
    const proof = verifyProofOfCoherence({ chain: updatedChain, available: true });
    assert.equal(proof.valid, true);
    assert.equal(proof.score, 1);
    const stateObservation = validateStateObject(committed.object);
    const aggregate = combineValidatorObservations([stateObservation]);
    assert.equal(aggregate.passed, true);
});
