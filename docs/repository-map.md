# Repository Map

QSO Field is designed as a series of focused repositories rather than a single monolith.

Each repository owns one layer of the ecosystem and publishes its own documentation, examples, and implementation roadmap.

## Repository Series

| Repository | Purpose |
| --- | --- |
| `qso-core` | QSO object model, identity, provenance, confidence, and repair history |
| `qso-router` | State-aware routing, route scoring, sessions, telemetry, and packet compatibility |
| `qso-tensor` | Tensor State Fabric, ITensors.jl experiments, simulation, and reconciliation models |
| `qso-chain` | State ledger, validators, Proof of Coherence, and settlement records |
| `qso-agent` | Agent runtime, agent identity, memory, tool calls, and state updates |
| `qso-provenance` | Hashing, custody, audit trails, verification, and evidence chains |
| `qso-integrations` | Kubernetes, Docker, NATS, Kafka, MQTT, OpenTelemetry, WireGuard, cloud, and satellite adapters |

## Dependency Direction

```text
qso-core
  ├── qso-router
  ├── qso-provenance
  ├── qso-agent
  └── qso-tensor
        └── qso-chain
              └── qso-integrations
```

The dependency direction should remain simple:

1. `qso-core` defines the shared objects.
2. Other repositories depend on the shared object model.
3. Integrations adapt external systems to the QSO model.
4. The chain records state transitions and validation events.

## Repository Boundaries

### qso-core

Owns the canonical QSO object schema.

It should define:

- object identity
- state payloads
- provenance references
- confidence values
- repair history
- timestamps
- synchronization metadata

### qso-router

Owns routing decisions and state movement.

It should define:

- route scoring
- session registry
- transport adapters
- observability hooks
- routing policies

### qso-tensor

Owns the tensor-based modeling layer.

It should define:

- state graph models
- tensor contraction experiments
- channel simulations
- fidelity estimates
- reconciliation models

### qso-chain

Owns the ledger and validator model.

It should define:

- state transition records
- validator events
- Proof of Coherence
- settlement records
- governance hooks

### qso-agent

Owns agent-facing runtime behavior.

It should define:

- agent identity
- memory state
- tool call records
- agent-to-agent state exchange
- safety metadata

### qso-provenance

Owns verifiable history.

It should define:

- hashes
- signatures
- custody chains
- redaction records
- verification workflows

### qso-integrations

Owns adapters and deployment patterns.

It should define:

- Kubernetes deployment
- Docker packaging
- event bus adapters
- telemetry adapters
- cloud integrations
- satellite and quantum-network adapter concepts

## Rule

Each repository should be independently understandable before implementation begins.
