export function createQSOObject(input) {
    const now = input.now ?? new Date().toISOString();
    return {
        qsoVersion: "0.1",
        objectId: input.objectId,
        objectType: input.objectType,
        createdAt: now,
        updatedAt: now,
        state: input.state,
        confidence: input.confidence ?? { score: 1, method: "declared" },
        provenance: input.provenance ?? [],
        repairHistory: [],
        synchronization: input.synchronization ?? {},
        extensions: input.extensions ?? {},
    };
}
