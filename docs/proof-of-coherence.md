# Proof of Coherence

## Purpose

Proof of Coherence is the proposed validation model for QSO Field.

It is designed to evaluate whether distributed state is consistent, available, well-provenanced, and properly reconciled.

## What It Validates

Proof of Coherence focuses on state quality rather than raw computation.

Validators may evaluate:

- state consistency
- provenance integrity
- timestamp ordering
- repair history
- synchronization status
- availability
- contradiction handling

## Validator Roles

### State Validators

Check whether a state object is well-formed and consistent with known records.

### Provenance Validators

Check whether provenance references, signatures, hashes, and custody links are valid.

### Repair Validators

Evaluate reconciliation events and determine whether a repair operation improved or degraded coherence.

### Availability Validators

Confirm that required state records remain retrievable and auditable.

### Observer Validators

Provide independent telemetry about route behavior, latency, and state propagation.

## Coherence Score

A simple coherence score may consider:

```text
coherence = consistency * provenance * availability * confidence / repair_cost
```

This is only an initial conceptual model. Later versions should define formal scoring rules and adversarial tests.

## Rewarded Behavior

The model should reward:

- accurate validation
- reliable availability
- correct reconciliation
- transparent provenance
- useful telemetry
- reproducible state verification

## Penalized Behavior

The model should discourage:

- unverifiable state claims
- broken provenance
- unavailable records
- contradictory updates without repair
- misleading confidence scores
- invalid synchronization claims

## Non-Promissory Design

This document defines a technical validation concept. It does not make financial, investment, or performance claims.

## Open Questions

- How should coherence scores be normalized?
- How should validators handle incomplete state?
- What minimum evidence is required for a state transition?
- How should contradictory but plausible states be represented?
- What governance process updates scoring rules?
