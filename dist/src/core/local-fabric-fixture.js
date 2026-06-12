import { createConfidence } from "./confidence.js";
import { buildQSOFabricExecutionEnvelope } from "./local-fabric.js";
import { createQSOObject } from "./qso-object.js";
export function createLocalFabricBridgeFixture() {
    const left = createQSOObject({
        objectId: "qso:field:fixture:left",
        objectType: "field.fixture.left",
        now: "2026-06-11T00:00:00.000Z",
        state: {
            role: "source",
            phase: "ready",
        },
        confidence: createConfidence(0.91, "fixture"),
        extensions: {
            contradictionDensity: 0.03,
            trainingTraceScore: 0.82,
        },
    });
    const right = createQSOObject({
        objectId: "qso:field:fixture:right",
        objectType: "field.fixture.right",
        now: "2026-06-11T00:00:00.000Z",
        state: {
            role: "target",
            phase: "ready",
        },
        confidence: createConfidence(0.89, "fixture"),
        extensions: {
            contradictionDensity: 0.04,
            trainingTraceScore: 0.8,
        },
    });
    const relations = [
        {
            from: left.objectId,
            to: right.objectId,
            semanticDistance: 0.02,
            temporalDistance: 0.01,
            goalDistance: 0.02,
            trustDistance: 0.01,
            weight: 1,
        },
    ];
    return {
        objects: [left, right],
        relations,
        envelope: buildQSOFabricExecutionEnvelope({
            fabricId: "fabric.qso-field.fixture",
            objects: [left, right],
            relations,
            coherenceThreshold: 0.8,
            metadata: {
                fixture: "local-fabric-bridge",
            },
        }),
    };
}
