# QSO Field

A state-aware network layer for AI agents, provenance systems, distributed infrastructure, and future quantum communication.

> Traditional networks route packets. QSO Field routes state.

QSO Field begins as a documentation-first GitHub Pages ecosystem. The purpose of this repository is to define the public architecture, repository map, adoption strategy, and integration model before implementation code is written.

## What QSO Field Is

QSO Field is a proposed network fabric for managing distributed state across classical infrastructure today and quantum-capable infrastructure later. It treats state, provenance, confidence, repair history, and synchronization as first-class network objects.

Instead of asking only where a packet should go, QSO Field asks:

- What state is being moved, reconciled, or verified?
- What is the provenance of that state?
- How confident is the network in that state?
- What repairs or contradictions are attached to it?
- Which route best preserves coherence, trust, and availability?

## Core Ideas

- **QSO objects**: structured state objects with identity, provenance, confidence, repair history, and synchronization metadata.
- **State-aware routing**: routing based on coherence, trust, latency, availability, and repair cost.
- **Tensor state fabric**: an iTensor-inspired modeling layer for simulating state relationships, quantum-network metadata, and reconciliation behavior.
- **Proof of Coherence**: a validator model for checking state consistency, provenance, availability, and repair quality.
- **Existing infrastructure first**: QSO Field runs over current packet networks before any physical quantum network is required.
- **Quantum-ready later**: QKD, teleportation metadata, satellite links, and entanglement events can be integrated as specialized state channels when available.

## Start Here

- [Vision](docs/vision.md)
- [Architecture](docs/architecture.md)
- [Framework](docs/framework.md)
- [Repository Map](docs/repository-map.md)
- [Packages](docs/packages.md)
- [Adoption Plan](docs/adoption.md)
- [State Router](docs/state-router.md)
- [Quantum / iTensor Backbone](docs/quantum-itensor.md)
- [Proof of Coherence](docs/proof-of-coherence.md)
- [Security Model](docs/security-model.md)
- [Whitepaper](docs/whitepaper.md)

## Repository Rule

No implementation code is added until the public architecture, package map, adoption story, integration plan, and repository templates are complete.
