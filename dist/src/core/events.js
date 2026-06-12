import { sha256 } from "./provenance.js";
export function createProviderExecutionEvent(input) {
    const provider = input.envelope.metadata.provider;
    const providerRoot = input.providerRoot ?? provider?.fabricRoot ?? "/Users/ALISTAIRE/qso-fabric";
    const fieldRoot = input.fieldRoot ?? provider?.fieldRoot ?? "/Users/ALISTAIRE/qso-field";
    const deterministicFallback = input.deterministicFallback ?? provider?.deterministicFallback ?? true;
    const itensorRunner = input.itensorRunner ?? provider?.itensorRunner ?? null;
    const inputHash = sha256(input.envelope);
    const resultHash = input.result === undefined ? null : sha256(input.result);
    const createdAt = input.createdAt ?? new Date().toISOString();
    return {
        event_type: "provider.execution",
        event_id: eventId("evt.provider", {
            fabricId: input.envelope.fabric_payload.id,
            inputHash,
            resultHash,
            createdAt,
        }),
        fabric_id: input.envelope.fabric_payload.id,
        provider: "qso-fabric",
        provider_root: providerRoot,
        field_root: fieldRoot,
        backend: input.envelope.backend,
        deterministic_fallback: deterministicFallback,
        itensor_runner: itensorRunner,
        input_hash: inputHash,
        result_hash: resultHash,
        created_at: createdAt,
        metadata: input.metadata ?? {},
    };
}
export function routeTelemetryToEvent(input) {
    return {
        event_type: "route.telemetry",
        telemetry_id: input.telemetry.telemetryId,
        session_id: input.sessionId,
        envelope_id: input.telemetry.envelopeId,
        route_id: input.telemetry.routeId,
        status: input.telemetry.eventType,
        ...(input.telemetry.latencyMs === undefined ? {} : { latency_ms: input.telemetry.latencyMs }),
        created_at: input.telemetry.timestamp,
        metadata: { ...input.telemetry.metadata, ...(input.metadata ?? {}) },
    };
}
export function validatorObservationToEvent(input) {
    const reasons = input.reasons ?? [input.observation.message].filter((reason) => reason.length > 0);
    return {
        event_type: "validator.observation",
        observation_id: eventId("validator", input.observation),
        target_ref: input.observation.subjectId,
        validator_ref: input.observation.validatorId,
        passed: input.observation.passed,
        score: input.observation.score,
        reasons,
        created_at: input.observation.observedAt,
        metadata: {
            kind: input.observation.kind,
            ...(input.metadata ?? {}),
        },
    };
}
export function eventHash(event) {
    return sha256(event);
}
function eventId(prefix, value) {
    return `${prefix}.${sha256(value).slice("sha256:".length, "sha256:".length + 16)}`;
}
