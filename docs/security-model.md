# Security Model

## Objective

QSO Field should preserve the integrity, provenance, and availability of state while operating over potentially untrusted infrastructure.

## Security Assumptions

Assume:

- nodes may fail
- networks may partition
- messages may be delayed
- telemetry may be incomplete
- operators may make mistakes
- adversaries may attempt manipulation

## Threat Categories

### Identity Threats

Examples:

- impersonation
- credential theft
- unauthorized state updates

Mitigations:

- strong identity systems
- signatures
- audit trails

### Provenance Threats

Examples:

- forged history
- missing custody records
- tampered evidence

Mitigations:

- hashes
- signatures
- custody chains
- verification workflows

### Routing Threats

Examples:

- route manipulation
- telemetry poisoning
- synchronization attacks

Mitigations:

- route verification
- multiple observers
- consistency checks

### Validator Threats

Examples:

- collusion
- false reports
- selective availability

Mitigations:

- independent validation
- transparent scoring
- auditable records

### Agent Threats

Examples:

- incorrect actions
- unsafe tool usage
- memory corruption

Mitigations:

- scoped permissions
- review mechanisms
- provenance logging

## Security Principles

1. Preserve provenance.
2. Preserve auditability.
3. Preserve availability.
4. Make confidence explicit.
5. Record repairs transparently.
6. Minimize hidden state.
7. Prefer verifiable claims.

## Security Goal

The objective is not perfect trust.

The objective is measurable, inspectable, and repairable trust.
