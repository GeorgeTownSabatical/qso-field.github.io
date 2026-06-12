import assert from "node:assert/strict";
import test from "node:test";
import { createCognitiveRenderProjection, createConfidence, createQSOObject, evaluateFabric, renderProjectionHash, } from "../src/index.js";
test("cognitive render projection is deterministic and sorted", () => {
    const right = createQSOObject({
        objectId: "qso:render:right",
        objectType: "render.memory",
        now: "2026-06-12T00:00:00.000Z",
        state: { phase: "right" },
        confidence: createConfidence(0.7, "fixture"),
    });
    const left = createQSOObject({
        objectId: "qso:render:left",
        objectType: "render.intent",
        now: "2026-06-12T00:00:00.000Z",
        state: { phase: "left" },
        confidence: createConfidence(0.95, "fixture"),
    });
    const relations = [
        {
            from: right.objectId,
            to: left.objectId,
            semanticDistance: 0.2,
            temporalDistance: 0.1,
            goalDistance: 0.1,
            trustDistance: 0.05,
        },
    ];
    const projection = createCognitiveRenderProjection({
        fabricId: "fabric.render",
        objects: [right, left],
        relations,
        now: "2026-06-12T00:00:01.000Z",
    });
    const again = createCognitiveRenderProjection({
        fabricId: "fabric.render",
        objects: [left, right],
        relations,
        now: "2026-06-12T00:00:01.000Z",
    });
    assert.deepEqual(projection, again);
    assert.deepEqual(projection.nodes.map((node) => node.id), ["qso:render:left", "qso:render:right"]);
    assert.equal(renderProjectionHash(projection), renderProjectionHash(again));
});
test("cognitive render projection exposes stability and obstruction cues", () => {
    const stable = createQSOObject({
        objectId: "qso:render:stable",
        objectType: "render.memory",
        now: "2026-06-12T00:00:00.000Z",
        state: { phase: "stable" },
        confidence: createConfidence(0.98, "fixture"),
        extensions: { contradictionDensity: 0.05 },
    });
    const obstructed = createQSOObject({
        objectId: "qso:render:obstructed",
        objectType: "render.contradiction",
        now: "2026-06-12T00:00:00.000Z",
        state: { phase: "obstructed" },
        confidence: createConfidence(0.35, "fixture"),
        extensions: { contradictionDensity: 0.8 },
    });
    const relations = [
        {
            from: stable.objectId,
            to: obstructed.objectId,
            semanticDistance: 1,
            temporalDistance: 1,
            goalDistance: 1,
            trustDistance: 1,
            weight: 0.3,
        },
    ];
    const projection = createCognitiveRenderProjection({
        fabricId: "fabric.render.obstruction",
        objects: [stable, obstructed],
        relations,
        evaluation: evaluateFabric([stable, obstructed], relations),
    });
    assert.equal(projection.summary.objectCount, 2);
    assert.equal(projection.summary.relationCount, 1);
    assert.equal(projection.nodes.find((node) => node.id === stable.objectId)?.color, "#2f8f83");
    assert.equal(projection.nodes.find((node) => node.id === obstructed.objectId)?.color, "#d64f45");
    assert.equal(projection.edges[0]?.status, "obstructed");
    assert.ok(projection.edges[0].width < 0.3);
});
test("cognitive render projection does not mutate QSO objects or relations", () => {
    const object = createQSOObject({
        objectId: "qso:render:immutable",
        objectType: "render.system",
        now: "2026-06-12T00:00:00.000Z",
        state: { phase: "immutable" },
    });
    const relation = {
        from: object.objectId,
        to: object.objectId,
        semanticDistance: 0,
        temporalDistance: 0,
        goalDistance: 0,
        trustDistance: 0,
    };
    const objectBefore = JSON.stringify(object);
    const relationBefore = JSON.stringify(relation);
    createCognitiveRenderProjection({
        fabricId: "fabric.render.immutable",
        objects: [object],
        relations: [relation],
    });
    assert.equal(JSON.stringify(object), objectBefore);
    assert.equal(JSON.stringify(relation), relationBefore);
});
