import type { JSONObject, QSOObject } from "./qso-object.js";
import { createProvenanceRecord, sha256 } from "./provenance.js";

export type ContractMode = "smart" | "genius";

export interface ContractContext {
  provenanceScore: number;
  confidenceScore: number;
  contradictionDensity: number;
  repairDebt: number;
  trustScore: number;
  trainingTraceScore?: number;
}

export interface ContractExecutionResult<TState extends JSONObject = JSONObject> {
  mode: ContractMode;
  accepted: boolean;
  object: QSOObject<TState>;
  stateHash: string;
  reasons: string[];
  context: ContractContext;
}

export interface SmartContract<TState extends JSONObject = JSONObject> {
  mode: "smart";
  contractId: string;
  description: string;
  execute: (state: TState) => TState;
  validate?: (state: TState) => string[];
}

export interface GeniusContract<TState extends JSONObject = JSONObject> {
  mode: "genius";
  contractId: string;
  description: string;
  propose: (state: TState, context: ContractContext) => TState;
  threshold?: number;
}

export type QSOContract<TState extends JSONObject = JSONObject> = SmartContract<TState> | GeniusContract<TState>;

export function deriveContractContext(object: QSOObject): ContractContext {
  const provenanceScore = object.provenance.length > 0 ? 1 : 0.35;
  const confidenceScore = object.confidence.score;
  const repairDebt = Math.min(1, object.repairHistory.length / 10);
  const contradictionDensity = Number(object.extensions.contradictionDensity ?? 0);
  const trustScore = Math.max(0, Math.min(1, (provenanceScore + confidenceScore + (1 - repairDebt) + (1 - contradictionDensity)) / 4));

  return {
    provenanceScore,
    confidenceScore,
    contradictionDensity,
    repairDebt,
    trustScore,
    trainingTraceScore: typeof object.extensions.trainingTraceScore === "number" ? object.extensions.trainingTraceScore : undefined,
  };
}

export function executeContract<TState extends JSONObject>(
  object: QSOObject<TState>,
  contract: QSOContract<TState>,
  context = deriveContractContext(object),
): ContractExecutionResult<TState> {
  const reasons: string[] = [];
  let accepted = true;
  let nextState: TState;

  if (contract.mode === "smart") {
    nextState = contract.execute(object.state);
    const errors = contract.validate?.(nextState) ?? [];
    if (errors.length > 0) {
      accepted = false;
      reasons.push(...errors);
    } else {
      reasons.push("smart contract validation passed");
    }
  } else {
    const threshold = contract.threshold ?? 0.6;
    nextState = contract.propose(object.state, context);
    accepted = context.trustScore >= threshold;
    reasons.push(
      accepted
        ? `genius contract trust score ${context.trustScore.toFixed(3)} met threshold ${threshold.toFixed(3)}`
        : `genius contract trust score ${context.trustScore.toFixed(3)} below threshold ${threshold.toFixed(3)}`,
    );
  }

  const stateHash = sha256(nextState);
  const nextObject: QSOObject<TState> = accepted
    ? {
        ...object,
        updatedAt: new Date().toISOString(),
        state: nextState,
        provenance: [
          ...object.provenance,
          createProvenanceRecord({
            source: `contract:${contract.contractId}`,
            value: { mode: contract.mode, previousHash: sha256(object.state), stateHash },
            description: contract.description,
          }),
        ],
        extensions: {
          ...object.extensions,
          lastContractMode: contract.mode,
          lastContractId: contract.contractId,
        },
      }
    : object;

  return {
    mode: contract.mode,
    accepted,
    object: nextObject,
    stateHash: accepted ? stateHash : sha256(object.state),
    reasons,
    context,
  };
}
