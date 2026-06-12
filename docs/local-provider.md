# Local Provider Contract

## Purpose

The local provider contract explains how any repo, Codex surface, cloud shell,
or mobile handoff can use QSO Field without creating a parallel fabric.

QSO Field is the public contract surface.

QSO Fabric is the local execution substrate.

```text
project repo
  -> qso-field contract / SDK shape
  -> qso-fabric local provider
  -> deterministic fallback or optional ITensor runner
```

## Canonical Environment

```bash
source /Users/ALISTAIRE/Codex/tools/qso_fabric_env.sh
qso_fabric_status
qso_field_status
```

Expected defaults:

```text
QSO_FABRIC_ROOT=/Users/ALISTAIRE/qso-fabric
QSO_FIELD_ROOT=/Users/ALISTAIRE/qso-field
QSO_FIELD_REPO=aevespers2/qso-field.github.io
QSO_CONTRACT_MODES=smart,genius
QSO_ITENSOR_RUNNER=unset
```

When `QSO_ITENSOR_RUNNER` is unset, deterministic fallback remains the public
default. ITensor is optional and must not change the public result shape.

## Adoption Rule

New projects should ask:

```text
Can this state, evidence, route, observation, repair, projection, or training
trace be represented as a QSO object or a qso-fabric payload?
```

If yes, consume the provider.

If no, document the missing contract before inventing a new substrate.

## Minimal TypeScript Path

```ts
import {
  buildQSOFabricExecutionEnvelope,
  createConfidence,
  createQSOObject,
} from "qso-field";

const object = createQSOObject({
  objectId: "qso:example:001",
  objectType: "example.state",
  state: { phase: "ready" },
  confidence: createConfidence(0.9, "fixture"),
});

const envelope = buildQSOFabricExecutionEnvelope({
  fabricId: "fabric.example",
  objects: [object],
});
```

## Minimal Python Provider Path

```python
from services.quantum.fabric.runtime import execute_fabric_payload

result = execute_fabric_payload(envelope)
```

## Required Documentation For Integrations

Each integration should document:

- purpose
- required permissions
- data model
- failure modes
- security assumptions
- observability outputs
- whether it uses deterministic fallback or an ITensor runner

## Non-Goals

The provider contract does not require:

- quantum hardware
- live ITensor
- a new fabric package per repo
- a VR renderer
- privileged cloud infrastructure

Every integration should work first on ordinary infrastructure.
