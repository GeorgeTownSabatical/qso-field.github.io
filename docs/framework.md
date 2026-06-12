# Framework

## Purpose

The QSO Field framework turns the documentation surface into an executable TypeScript scaffold.

It implements the first local path through the architecture:

```text
QSO object
  -> contract execution
  -> state-aware route selection
  -> tensor-fabric coherence scoring
  -> kernel branch commit
  -> state-chain record
  -> Proof of Coherence validation
  -> validator observation
```

## Implemented Modules

| Module | Purpose |
| --- | --- |
| `src/core/qso-object.ts` | QSO object creation and metadata shape |
| `src/core/schema.ts` | QSO object validation |
| `src/core/provenance.ts` | canonical serialization and SHA-256 hashing |
| `src/core/confidence.ts` | confidence creation and combination |
| `src/core/kernel.ts` | kernel records, worldlines, state frames, morphisms, branches, runtime projections |
| `src/core/contracts.ts` | smart and genius contract execution |
| `src/core/events.ts` | provider execution, route telemetry, and validator observation events |
| `src/core/router.ts` | state-aware route scoring, envelopes, exchange sessions, and telemetry |
| `src/core/fabric.ts` | tensor-fabric inspired relation and coherence scoring |
| `src/core/render.ts` | non-VR cognitive render projections for fabric topology |
| `src/core/local-fabric.ts` | adapter from QSO Field objects to local `qso-fabric` execution envelopes |
| `src/core/local-fabric-fixture.ts` | deterministic bridge fixture for examples and smoke tests |
| `src/core/chain.ts` | append-only chain records and Proof of Coherence checks |
| `src/core/validators.ts` | validator observations and aggregation |

## Contract Modes

### Smart Contracts

Smart contracts are deterministic executable commitments over QSO state.

They must:

- accept explicit state input,
- emit explicit state output,
- validate their output,
- remain replayable from provenance and hashes.

### Genius Contracts

Genius contracts are fabric-aware commitments.

They may inspect:

- provenance score,
- confidence score,
- contradiction density,
- repair debt,
- trust score,
- training trace score.

They still settle through deterministic QSO events and do not bypass the local fabric boundary.

## Local Fabric Connection

The local environment connects to the public QSO Field through the central fabric helper:

```bash
source /Users/ALISTAIRE/Codex/tools/qso_fabric_env.sh
qso_fabric_status
qso_field_status
```

The local `qso-fabric` repo is the execution substrate. This repo defines the public QSO Field framework surface and TypeScript scaffold.

The bridge adapter emits the JSON shape consumed by qso-fabric:

```ts
import { buildQSOFabricExecutionEnvelope } from "qso-field";

const envelope = buildQSOFabricExecutionEnvelope({
  fabricId: "fabric.field.demo",
  objects,
  relations,
  coherenceThreshold: 0.9,
});
```

That envelope can be passed to the local fabric runtime's `execute_fabric_payload(...)` path. ITensor remains optional; deterministic fallback remains the default public behavior.

## Non-VR Cognitive Render Projection

QSO Field renders topology first as deterministic JSON. Browser, terminal,
canvas, and later VR surfaces should consume the same projection rather than
inventing their own scoring layer.

```ts
import { createCognitiveRenderProjection } from "qso-field";

const projection = createCognitiveRenderProjection({
  fabricId: "fabric.example",
  objects,
  relations,
});
```

To print a ready-to-execute fixture envelope:

```bash
npm run bridge:envelope
```

## State Router Surface

The router follows `docs/state-router.md` by exposing:

- `RouteCandidate`
- `RouteDecision`
- `StateEnvelope`
- `StateExchangeSession`
- `RouteTelemetry`

This gives ordinary network paths a state-aware control plane without requiring
specialized hardware.

## Validation

Run:

```bash
npm run typecheck
npm test
npm run build
npm run bridge:envelope
```

The framework test exercises a complete object-to-validation path.
