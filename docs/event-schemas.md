# Event Schemas

## Purpose

QSO Field events describe state movement, validation, and provider execution in
a transport-agnostic way.

These schemas are intentionally small so independent implementations can
produce compatible records before a full network exists.

The TypeScript framework exposes helpers in `src/core/events.ts`:

- `createProviderExecutionEvent(...)`
- `routeTelemetryToEvent(...)`
- `validatorObservationToEvent(...)`
- `eventHash(...)`

## Provider Execution Event

Emitted when a project hands a QSO Field envelope to a local provider.

```json
{
  "event_type": "provider.execution",
  "event_id": "evt_...",
  "fabric_id": "fabric.example",
  "provider": "qso-fabric",
  "provider_root": "/Users/ALISTAIRE/qso-fabric",
  "field_root": "/Users/ALISTAIRE/qso-field",
  "backend": "fabric_gluing",
  "deterministic_fallback": true,
  "itensor_runner": null,
  "input_hash": "sha256:...",
  "result_hash": "sha256:...",
  "created_at": "ISO-8601",
  "metadata": {}
}
```

## Route Telemetry Event

Emitted by the State Router surface.

```json
{
  "event_type": "route.telemetry",
  "telemetry_id": "telemetry_...",
  "session_id": "session_...",
  "envelope_id": "envelope_...",
  "route_id": "local-fabric",
  "status": "queued|sent|received|reconciled|failed",
  "latency_ms": 1,
  "created_at": "ISO-8601",
  "metadata": {}
}
```

## Validator Observation Event

Emitted by validators after checking state, provenance, repair, availability,
or provider execution output.

```json
{
  "event_type": "validator.observation",
  "observation_id": "validator_...",
  "target_ref": "qso:example:001",
  "validator_ref": "validator.local",
  "passed": true,
  "score": 1.0,
  "reasons": [],
  "created_at": "ISO-8601",
  "metadata": {}
}
```

## Security Rules

- Events must be append-only in audit logs.
- Events should include hashes for provider inputs and outputs.
- Events must make fallback behavior explicit.
- Events must not hide assumptions about external providers.
- Missing telemetry should be treated as lower confidence, not as proof of failure.

## Compatibility

Events may travel over ordinary infrastructure:

- local files
- HTTP
- gRPC
- NATS
- Kafka
- MQTT
- object storage

The transport must not change the event semantics.
