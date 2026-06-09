# Packages

The QSO Field package model is documentation-first. Each package should have a clear purpose, boundary, interface, and roadmap before implementation begins.

## Package Catalog

| Package | Repository | Purpose |
| --- | --- | --- |
| `@qso/core` | `qso-core` | State objects, identity, confidence, provenance, and repair history |
| `@qso/router` | `qso-router` | State-aware routing, sessions, transport adapters, and route scoring |
| `@qso/tensor` | `qso-tensor` | Tensor State Fabric, simulation, reconciliation, and quantum-network modeling |
| `@qso/chain` | `qso-chain` | State transition records, validators, settlement, and Proof of Coherence |
| `@qso/agent` | `qso-agent` | Agent identity, memory, tool-call records, and state updates |
| `@qso/provenance` | `qso-provenance` | Hashing, custody, audit trails, verification, and evidence chains |
| `@qso/integrations` | `qso-integrations` | Adapters for cloud, messaging, telemetry, networking, and satellite systems |

## Package Template

Every package should eventually include:

```text
README.md
docs/
  overview.md
  architecture.md
  api.md
  examples.md
  roadmap.md
schemas/
examples/
.github/
  ISSUE_TEMPLATE/
  PULL_REQUEST_TEMPLATE.md
SECURITY.md
CONTRIBUTING.md
LICENSE
```

## Shared Conventions

Each package should define:

- purpose
- non-goals
- owned schemas
- public interfaces
- event formats
- configuration model
- examples
- test strategy
- security assumptions

## Release Stages

1. Draft specification
2. API sketch
3. Reference examples
4. Prototype implementation
5. Interoperability tests
6. Production hardening

## Rule

A package is not ready for implementation until its documentation explains why it exists, what it owns, and how it interacts with the rest of the ecosystem.
