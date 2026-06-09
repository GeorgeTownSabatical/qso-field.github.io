# Architecture

## Overview

QSO Field is organized as a layered architecture.

```text
Layer 4 - Applications and Agents
Layer 3 - QSO State Chain
Layer 2 - Tensor State Fabric
Layer 1 - QSO Transport
Layer 0 - Existing Infrastructure
```

## Layer 0 - Existing Infrastructure

This layer contains the systems already deployed today.

Examples:

- Fiber networks
- Wi-Fi
- Cellular networks
- Satellite systems
- Data centers
- Cloud platforms
- Edge devices
- IoT systems

QSO Field does not require replacing this layer.

## Layer 1 - QSO Transport

The transport layer moves state-aware messages over existing infrastructure.

Examples:

- QUIC
- WireGuard
- IPv6
- MQTT
- NATS
- Kafka
- gRPC

Responsibilities:

- state movement
- synchronization
- telemetry
- trust metadata
- provenance propagation

## Layer 2 - Tensor State Fabric

The tensor fabric models relationships between distributed state objects.

Responsibilities:

- state reconciliation
- contradiction analysis
- confidence propagation
- simulation
- route scoring

The tensor layer is expected to use ITensors.jl and related tooling for experimentation and simulation.

## Layer 3 - QSO State Chain

The state chain records:

- state transitions
- provenance events
- repair operations
- synchronization records
- validator observations

This layer provides accountability and traceability.

## Layer 4 - Applications and Agents

Applications consume the lower layers.

Examples:

- AI agents
- evidence systems
- digital twins
- disaster response systems
- infrastructure monitoring
- satellite operations
- research networks

## Architectural Goal

Every layer should be independently useful. The system should provide value before any specialized quantum hardware is introduced.
