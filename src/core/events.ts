import type { QSOFabricExecutionEnvelope } from "./local-fabric.js";
import { sha256 } from "./provenance.js";
import type { RouteTelemetry } from "./router.js";
import type { ValidatorObservation } from "./validators.js";

export interface ProviderExecutionEvent {
  event_type: "provider.execution";
  event_id: string;
  fabric_id: string;
  provider: "qso-fabric" | string;
  provider_root: string;
  field_root: string;
  backend: string;
  deterministic_fallback: boolean;
  itensor_runner: string | null;
  input_hash: string;
  result_hash: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface RouteTelemetryEvent {
  event_type: "route.telemetry";
  telemetry_id: string;
  session_id: string;
  envelope_id: string;
  route_id: string;
  status: RouteTelemetry["eventType"];
  latency_ms?: number;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface ValidatorObservationEvent {
  event_type: "validator.observation";
  observation_id: string;
  target_ref: string;
  validator_ref: string;
  passed: boolean;
  score: number;
  reasons: string[];
  created_at: string;
  metadata: Record<string, unknown>;
}

export type QSOFieldEvent = ProviderExecutionEvent | RouteTelemetryEvent | ValidatorObservationEvent;

export function createProviderExecutionEvent(input: {
  envelope: QSOFabricExecutionEnvelope;
  result?: unknown;
  providerRoot?: string;
  fieldRoot?: string;
  deterministicFallback?: boolean;
  itensorRunner?: string | null;
  createdAt?: string;
  metadata?: Record<string, unknown>;
}): ProviderExecutionEvent {
  const provider = input.envelope.metadata.provider as { fabricRoot?: string; fieldRoot?: string; deterministicFallback?: boolean; itensorRunner?: string | null } | undefined;
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

export function routeTelemetryToEvent(input: {
  sessionId: string;
  telemetry: RouteTelemetry;
  metadata?: Record<string, unknown>;
}): RouteTelemetryEvent {
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

export function validatorObservationToEvent(input: {
  observation: ValidatorObservation;
  reasons?: string[];
  metadata?: Record<string, unknown>;
}): ValidatorObservationEvent {
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

export function eventHash(event: QSOFieldEvent): string {
  return sha256(event);
}

function eventId(prefix: string, value: unknown): string {
  return `${prefix}.${sha256(value).slice("sha256:".length, "sha256:".length + 16)}`;
}
