import { randomBytes } from "node:crypto";
import { sha256 } from "./provenance.js";
export function createMorphism(input) {
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
export function createKernelId(prefix, seed) {
    const entropy = seed === undefined ? randomBytes(16).toString("hex") : sha256(seed).slice("sha256:".length, 32);
    return `${prefix}_${entropy}`;
}
export function createTrustVector(confidence) {
    return {
        id: createKernelId("trust", confidence),
        confidence: confidence.score,
        provenance: confidence.method === "declared" ? 0.6 : 0.8,
        availability: 1,
        repair: 1,
    };
}
export function createEntropyReport(input) {
    const report = {
        contradictionCount: input?.contradictionCount ?? 0,
        repairDebt: input?.repairDebt ?? 0,
        confidenceDrift: input?.confidenceDrift ?? 0,
    };
    return { id: createKernelId("entropy", report), ...report };
}
export function createStateFrame(input) {
    const frameWithoutHash = {
        type: "state_frame",
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
export function createKernelRecord(object) {
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
    const event = {
        type: "kernel_event",
        eventId: createKernelId("evt", { qsoId, frameId: frame.frameId, eventType: "create" }),
        eventType: "create",
        qsoId,
        frameId: frame.frameId,
        timestamp: object.createdAt,
        provenance: object.provenance[0],
        metadata: { objectId: object.objectId, objectType: object.objectType },
    };
    const worldline = {
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
export function createBranch(input) {
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
export function commitBranch(record, branch, timestamp = new Date().toISOString()) {
    const event = {
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
