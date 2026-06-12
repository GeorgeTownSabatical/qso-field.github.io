import type { QSOFabricExecutionEnvelope } from "./local-fabric.js";
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
export declare function createProviderExecutionEvent(input: {
    envelope: QSOFabricExecutionEnvelope;
    result?: unknown;
    providerRoot?: string;
    fieldRoot?: string;
    deterministicFallback?: boolean;
    itensorRunner?: string | null;
    createdAt?: string;
    metadata?: Record<string, unknown>;
}): ProviderExecutionEvent;
export declare function routeTelemetryToEvent(input: {
    sessionId: string;
    telemetry: RouteTelemetry;
    metadata?: Record<string, unknown>;
}): RouteTelemetryEvent;
export declare function validatorObservationToEvent(input: {
    observation: ValidatorObservation;
    reasons?: string[];
    metadata?: Record<string, unknown>;
}): ValidatorObservationEvent;
export declare function eventHash(event: QSOFieldEvent): string;
